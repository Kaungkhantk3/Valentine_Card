import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import crypto from "crypto";
import multer from "multer";
import { Client as MinioClient } from "minio";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const upload = multer({ storage: multer.memoryStorage() });

const minio = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: Number(process.env.MINIO_PORT || 9000),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || "minio",
  secretKey: process.env.MINIO_SECRET_KEY || "minio12345",
});

const BUCKET = process.env.MINIO_BUCKET || "vday";
const PUBLIC_BASE =
  process.env.MINIO_PUBLIC_BASE_URL || "http://localhost:9000";

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "Only images allowed" });
    }

    const ext = req.file.originalname.split(".").pop() || "jpg";
    const objectName = `photos/${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}.${ext}`;

    await minio.putObject(BUCKET, objectName, req.file.buffer, req.file.size, {
      "Content-Type": req.file.mimetype,
    });

    const url = `${PUBLIC_BASE}/${BUCKET}/${objectName}`;
    res.json({ url });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "Upload failed" });
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const allowedShapes = new Set(["circle", "heart", "triangle", "square"]);
const allowedFits = new Set(["cover", "contain"]);

const PhotoInputSchema = z.object({
  frameIndex: z.number().int().min(0),
  url: z.string().min(1),
  x: z.number().optional(),
  y: z.number().optional(),
  scale: z.number().optional(),
  rotate: z.number().optional(),
  shape: z.string().optional(),
  fit: z.string().optional(),
});
const StickerInputSchema = z.object({
  stickerId: z.string().min(1).max(64),
  src: z.string().min(1).max(255),
  x: z.number().optional(),
  y: z.number().optional(),
  scale: z.number().optional(),
  rotate: z.number().optional(),
  z: z.number().int().optional(),
});

const CreateCardSchema = z.object({
  templateId: z.string().min(1).max(50),
  message: z.string().min(1).max(120),
  textColor: z.string().min(1).max(32).optional(),
  textStyle: z.enum(["handwritten", "cursive", "modern", "classic"]).optional(),
  photoUrl: z.string().min(1).optional(),
  photoX: z.number().optional(),
  photoY: z.number().optional(),
  photoScale: z.number().optional(),
  photoRotate: z.number().optional(),
  shape: z.string().optional(),
  photos: z.array(PhotoInputSchema).optional(),
  stickers: z.array(StickerInputSchema).optional(),
});

function makeSlug() {
  return crypto.randomBytes(6).toString("base64url");
}

app.post("/cards", async (req, res) => {
  const parsed = CreateCardSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const data = parsed.data;

  const incomingPhotos = (data.photos ?? [])
    .slice()
    .sort((a, b) => a.frameIndex - b.frameIndex);
  const incomingStickers = (data.stickers ?? [])
    .slice()
    .map((s, idx) => ({ ...s, z: s.z ?? idx }));

  // keep photo required (your decision)
  const hasMulti = incomingPhotos.length > 0;
  const hasLegacy = !!data.photoUrl;

  if (!hasMulti && !hasLegacy) {
    return res.status(400).json({ error: "Photo required" });
  }

  // ensure unique slug
  let slug = makeSlug();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.card.findUnique({ where: { slug } });
    if (!exists) break;
    slug = makeSlug();
  }

  // normalize legacy defaults from first photo if multi present
  const first = hasMulti ? incomingPhotos[0] : null;

  const legacyShapeRaw = (first?.shape ?? data.shape ?? "heart") as string;
  const legacyShape = allowedShapes.has(legacyShapeRaw)
    ? legacyShapeRaw
    : "heart";

  const legacyRotate = first?.rotate ?? data.photoRotate ?? 0;

  const legacyPhotoUrl = first?.url ?? data.photoUrl ?? "";
  const legacyX = first?.x ?? data.photoX ?? 0;
  const legacyY = first?.y ?? data.photoY ?? 0;
  const legacyScale = first?.scale ?? data.photoScale ?? 1;

  const createData: Parameters<typeof prisma.card.create>[0]["data"] = {
    slug,
    templateId: data.templateId,
    message: data.message,
    textColor: data.textColor ?? "#FFFFFF",
    textStyle: data.textStyle ?? "modern",

    // legacy
    photoUrl: legacyPhotoUrl,
    photoX: legacyX,
    photoY: legacyY,
    photoScale: legacyScale,
    photoRotate: legacyRotate,
    shape: legacyShape,
  };

  if (hasMulti) {
    createData.photos = {
      create: incomingPhotos.map((p) => {
        const shapeRaw = p.shape ?? "heart";
        const shape = allowedShapes.has(shapeRaw) ? shapeRaw : "heart";

        const fitRaw = p.fit ?? "cover";
        const fit = allowedFits.has(fitRaw) ? fitRaw : "cover";

        return {
          frameIndex: p.frameIndex,
          url: p.url,
          x: p.x ?? 0,
          y: p.y ?? 0,
          scale: p.scale ?? 1,
          rotate: p.rotate ?? 0,
          shape,
          fit,
        };
      }),
    };
  }

  if (incomingStickers.length > 0) {
    (createData as any).stickers = {
      create: incomingStickers.map((s) => ({
        stickerId: s.stickerId,
        src: s.src,
        x: s.x ?? 0,
        y: s.y ?? 0,
        scale: s.scale ?? 1,
        rotate: s.rotate ?? 0,
        z: s.z ?? 0,
      })),
    };
  }

  const card = await prisma.card.create({
    data: createData,
    select: { slug: true },
  });

  res.status(201).json(card);
});

app.get("/cards/:slug", async (req, res) => {
  const { slug } = req.params;

  const card = await prisma.card.findUnique({
    where: { slug },
    include: {
      photos: true,
      stickers: true,
    },
  });

  if (!card) return res.status(404).json({ error: "Not found" });
  res.json(card);
});

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
