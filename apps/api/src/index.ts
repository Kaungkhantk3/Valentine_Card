import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { set, z } from "zod";
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
const PUBLIC_BASE = process.env.MINIO_PUBLIC_BASE_URL || "http://localhost:9000";

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "Only images allowed" });
    }

    const ext = req.file.originalname.split(".").pop() || "jpg";
    const objectName = `photos/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;

    await minio.putObject(
      BUCKET,
      objectName,
      req.file.buffer,
      req.file.size,
      { "Content-Type": req.file.mimetype }
    );

    const url = `${PUBLIC_BASE}/${BUCKET}/${objectName}`;
    res.json({ url });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "Upload failed" });
  }
});


app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const CreateCardSchema = z.object({
  templateId: z.string().min(1).max(50),
  message: z.string().min(1).max(120),

  // legacy (still supported)
  photoUrl: z.string().min(1).optional(),
  photoX: z.number().optional(),
  photoY: z.number().optional(),
  photoScale: z.number().optional(),
  photoRotate: z.number().optional(),
  shape: z.string().optional(),

  // ✅ new multi-photo
  photos: z
    .array(
      z.object({
        frameIndex: z.number().int().min(0),
        url: z.string().min(1),
        x: z.number().optional(),
        y: z.number().optional(),
        scale: z.number().optional(),
        rotate: z.number().optional(),
        shape: z.string().optional(),
      })
    )
    .optional(),
});


function makeSlug() {
  return crypto.randomBytes(6).toString("base64url"); // short share id
}

// CREATE CARD
const allowedShapes = new Set(["circle", "heart", "triangle", "square"]);

app.post("/cards", async (req, res) => {
  const parsed = CreateCardSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  // ensure unique slug
  let slug = makeSlug();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.card.findUnique({ where: { slug } });
    if (!exists) break;
    slug = makeSlug();
  }

  const allowedShapes = new Set(["circle", "heart", "triangle", "square"]);

  const body = parsed.data;

  // ✅ normalize photos
  const photos =
    body.photos?.length
      ? body.photos
      : body.photoUrl
      ? [
          {
            frameIndex: 0,
            url: body.photoUrl,
            x: body.photoX ?? 0,
            y: body.photoY ?? 0,
            scale: body.photoScale ?? 1,
            rotate: body.photoRotate ?? 0,
            shape: allowedShapes.has(body.shape ?? "heart") ? (body.shape ?? "heart") : "heart",
          },
        ]
      : [];

  if (photos.length === 0) {
    return res.status(400).json({ error: "Provide photoUrl or photos[]" });
  }

  const legacy = photos.find((p) => p.frameIndex === 0) ?? photos[0]!; 


  const card = await prisma.card.create({
    data: {
      slug,
      templateId: body.templateId,
      message: body.message,

      // legacy (frame 0)
      photoUrl: legacy.url,
      photoX: legacy.x ?? 0,
      photoY: legacy.y ?? 0,
      photoScale: legacy.scale ?? 1,
      photoRotate: legacy.rotate ?? 0,
      shape: allowedShapes.has(legacy.shape ?? "heart") ? (legacy.shape ?? "heart") : "heart",
      photos: {
        create: photos.map((p) => ({
          frameIndex: p.frameIndex,
          url: p.url,
          x: p.x ?? 0,
          y: p.y ?? 0,
          scale: p.scale ?? 1,
          rotate: p.rotate ?? 0,
          shape: allowedShapes.has(p.shape ?? "heart") ? (p.shape ?? "heart") : "heart",
        })),
      },
    },
    select: { slug: true },
  });

  res.status(201).json(card);
});

// GET CARDf
app.get("/cards/:slug", async (req, res) => {
  const { slug } = req.params;

  const card = await prisma.card.findUnique({
    where: { slug },
    include: { photos: true },
  });

  if (!card) return res.status(404).json({ error: "Not found" });
  res.json(card);
});


const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
