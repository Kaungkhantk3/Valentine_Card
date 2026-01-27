import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { templates } from "./create/templates";
import { SHAPES } from "./create/shapes";

const API = import.meta.env.VITE_API_URL as string;
const PREVIEW_W = 320;
const fontClass = {
  handwritten: "font-handwritten",
  cursive: "font-cursive",
  modern: "font-modern",
  classic: "font-classic",
} as const;

type Shape = "circle" | "heart" | "triangle" | "square";
type FitMode = "cover" | "contain";

type CardPhoto = {
  id: number;
  frameIndex: number;
  url: string;
  x: number;
  y: number;
  scale: number;
  rotate: number;
  shape: Shape;
  fit?: FitMode;
};

type CardSticker = {
  id: number;
  src: string;
  cardId: number;
  stickerId: string;
  x: number; // in 1080x1920 units (center-based)
  y: number;
  scale: number;
  rotate: number;
  z: number;
};

type Card = {
  id: number;
  slug: string;
  templateId: string;
  photoUrl: string;
  message: string;
  textColor?: string;
  textStyle?: "handwritten" | "cursive" | "modern" | "classic";
  photoX: number;
  photoY: number;
  photoScale: number;
  photoRotate: number;
  shape?: Shape;
  photos?: CardPhoto[];
  stickers?: CardSticker[];
  createdAt: string;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function clipRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
  ctx.clip();
}

export default function CardPage() {
  const { slug } = useParams<{ slug: string }>();
  const [card, setCard] = useState<Card | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const tpl = useMemo(() => {
    const tid = card?.templateId ?? "t1";
    return templates[tid] ?? templates.t1;
  }, [card?.templateId]);

  function getPhotoForFrame(frameIndex: number) {
    const fromRel = card?.photos?.find((p) => p.frameIndex === frameIndex);
    if (fromRel) return fromRel;

    // legacy fallback = frame 0 only
    if (!card || frameIndex !== 0) return null;

    return {
      id: -1,
      frameIndex: 0,
      url: card.photoUrl,
      x: card.photoX ?? 0,
      y: card.photoY ?? 0,
      scale: card.photoScale ?? 1,
      rotate: card.photoRotate ?? 0,
      shape: (card.shape ?? "heart") as CardPhoto["shape"],
      fit: "cover",
    } satisfies CardPhoto;
  }

  const templateSrc = tpl.backgroundSrc;
  const previewFactor = 1080 / PREVIEW_W;

  useEffect(() => {
    async function run() {
      try {
        setError("");
        setLoading(true);
        const res = await fetch(`${API}/cards/${slug}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "Not found");
        setCard(json);
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    if (slug) run();
  }, [slug]);

  async function drawStickers(
    ctx: CanvasRenderingContext2D,
    stickers: CardSticker[] | undefined
  ) {
    if (!stickers || stickers.length === 0) return;

    const W = 1080;
    const H = 1920;
    const cx = W / 2;
    const cy = H / 2;

    // Matches preview: ~110px sticker on 320px card → ~372px on 1080px
    const factor = W / PREVIEW_W;
    const BASE = 110 * factor;

    const cache = new Map<string, HTMLImageElement>();

    async function load(src: string) {
      if (cache.has(src)) return cache.get(src)!;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error("Sticker load failed: " + src));
      });
      cache.set(src, img);
      return img;
    }

    const ordered = [...stickers].sort((a, b) => (a.z ?? 0) - (b.z ?? 0));

    for (const s of ordered) {
      const img = await load(s.src);

      ctx.save();
      ctx.translate(cx + s.x * factor, cy + s.y * factor);
      ctx.rotate((s.rotate * Math.PI) / 180);
      ctx.scale(s.scale, s.scale);
      ctx.drawImage(img, -BASE / 2, -BASE / 2, BASE, BASE);
      ctx.restore();
    }
  }

  async function exportStory() {
    if (!card) return;
    if (!tpl?.frames?.length) {
      alert("Template has no frames");
      return;
    }

    setExporting(true);

    try {
      const W = 1080;
      const H = 1920;

      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      const bg = await loadImage(templateSrc);
      ctx.drawImage(bg, 0, 0, W, H);

      function getCoverCrop(
        img: HTMLImageElement,
        destW: number,
        destH: number
      ) {
        const imgRatio = img.width / img.height;
        const destRatio = destW / destH;

        let sx = 0,
          sy = 0,
          sw = img.width,
          sh = img.height;

        if (imgRatio > destRatio) {
          sh = img.height;
          sw = sh * destRatio;
          sx = (img.width - sw) / 2;
        } else {
          sw = img.width;
          sh = sw / destRatio;
          sy = (img.height - sh) / 2;
        }
        return { sx, sy, sw, sh };
      }

      function getContainDestRect(
        img: HTMLImageElement,
        destW: number,
        destH: number
      ) {
        const imgR = img.width / img.height;
        const destR = destW / destH;

        let dw = destW,
          dh = destH,
          dx = 0,
          dy = 0;

        if (imgR > destR) {
          dh = destW / imgR;
          dy = (destH - dh) / 2;
        } else {
          dw = destH * imgR;
          dx = (destW - dw) / 2;
        }
        return { dx, dy, dw, dh };
      }

      for (let i = 0; i < tpl.frames.length; i++) {
        const fr = tpl.frames[i];
        const p = getPhotoForFrame(i);
        if (!p) continue;

        const looksLikeUrl = /^https?:\/\//i.test(p.url);
        if (!looksLikeUrl) continue;

        const img = await loadImage(p.url);

        const factor = W / PREVIEW_W;
        const dxPx = (p.x ?? 0) * factor;
        const dyPx = (p.y ?? 0) * factor;
        const sc = p.scale ?? 1;
        const rotRad = ((p.rotate ?? 0) * Math.PI) / 180;

        const fit: FitMode = (p.fit ?? "cover") as FitMode;

        if (fr.kind === "path") {
          const fx = fr.x;
          const fy = fr.y;
          const fw = fr.w;
          const fh = fr.h;

          const dxLocal = dxPx * (100 / fw);
          const dyLocal = dyPx * (100 / fh);

          ctx.save();

          ctx.translate(fx, fy);
          ctx.scale(fw / 100, fh / 100);

          ctx.translate(50, 50);
          ctx.translate(dxLocal, dyLocal);
          ctx.rotate(rotRad);
          ctx.scale(sc, sc);
          ctx.translate(-50, -50);

          const sid = p.shape as keyof typeof SHAPES;
          SHAPES[sid].canvasPath(ctx, 100);
          ctx.clip();

          if (fit === "contain") {
            const { dx, dy, dw, dh } = getContainDestRect(img, 100, 100);
            ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, dw, dh);
          } else {
            const { sx, sy, sw, sh } = getCoverCrop(img, fw, fh);
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 100, 100);
          }

          ctx.restore();
        } else {
          const fx = fr.x;
          const fy = fr.y;
          const fw = fr.w;
          const fh = fr.h;
          const r = fr.r ?? 0;

          ctx.save();
          clipRoundedRect(ctx, fx, fy, fw, fh, r);

          ctx.translate(fx + fw / 2, fy + fh / 2);
          ctx.translate(dxPx, dyPx);
          ctx.rotate(rotRad);
          ctx.scale(sc, sc);
          if (fit === "contain") {
            const { dx, dy, dw, dh } = getContainDestRect(img, fw, fh);
            ctx.drawImage(
              img,
              0,
              0,
              img.width,
              img.height,
              -fw / 2 + dx,
              -fh / 2 + dy,
              dw,
              dh
            );
          } else {
            const { sx, sy, sw, sh } = getCoverCrop(img, fw, fh);
            ctx.drawImage(img, sx, sy, sw, sh, -fw / 2, -fh / 2, fw, fh);
          }

          ctx.restore();
        }
      }

      await drawStickers(ctx, card.stickers);
      // message (same as yours)
      const msg = card.message || "";
      const scale = W / PREVIEW_W;

      const sidePad = 16 * scale;
      const bottomPad = 28 * scale;
      const fontSize = 16 * scale;
      const lineHeight = fontSize * 1.25;

      // wait for fonts (important if using custom fonts)
      await document.fonts.ready;

      // text color
      ctx.fillStyle = card.textColor ?? "#ffffff";

      // font style
      const style = card.textStyle ?? "modern";

      const fontFamily =
        style === "handwritten"
          ? "cursive"
          : style === "cursive"
          ? "cursive"
          : style === "classic"
          ? "serif"
          : "system-ui";

      ctx.font = `700 ${fontSize}px ${fontFamily}`;
      ctx.textAlign = "center";

      const maxWidth = W - sidePad * 2;

      const words = msg.split(" ");
      const lines: string[] = [];
      let line = "";

      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (ctx.measureText(test).width <= maxWidth) line = test;
        else {
          if (line) lines.push(line);
          line = w;
        }
      }
      if (line) lines.push(line);

      const drawLines = lines.slice(0, 3);
      let y = H - bottomPad - (drawLines.length - 1) * lineHeight;

      for (const l of drawLines) {
        ctx.fillText(l, W / 2, y);
        y += lineHeight;
      }

      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Export failed"))),
          "image/png"
        );
      });

      downloadBlob(blob, `valentine-${card.slug}.png`);
    } catch (e: any) {
      alert(e?.message ?? "Export failed");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Card</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <Link to="/create">← Back</Link>
        <button onClick={exportStory} disabled={!card || exporting}>
          {exporting ? "Exporting..." : "Export 1080×1920 PNG"}
        </button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      {card && (
        <div
          style={{
            width: 320,
            aspectRatio: "9 / 16",
            borderRadius: 16,
            overflow: "hidden",
            position: "relative",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "#111",
          }}
        >
          <img
            src={templateSrc}
            alt="template"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          <svg
            viewBox="0 0 1080 1920"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <defs>
              {tpl.frames.map((fr, i) => {
                const p = getPhotoForFrame(i);
                if (!p || fr.kind !== "path") return null;
                return (
                  <clipPath key={i} id={`frameClip-${i}`}>
                    <path
                      d={SHAPES[p.shape].svgPath}
                      transform={`translate(${fr.x}, ${fr.y}) scale(${
                        fr.w / 100
                      }, ${fr.h / 100})`}
                    />
                  </clipPath>
                );
              })}
            </defs>

            {tpl.frames.map((fr, i) => {
              const p = getPhotoForFrame(i);
              if (!p || fr.kind !== "path") return null;

              const fit: FitMode = (p.fit ?? "cover") as FitMode;

              return (
                <image
                  key={i}
                  href={p.url}
                  x={fr.x}
                  y={fr.y}
                  width={fr.w}
                  height={fr.h}
                  preserveAspectRatio={
                    fit === "contain" ? "xMidYMid meet" : "xMidYMid slice"
                  }
                  clipPath={`url(#frameClip-${i})`}
                  style={{
                    transformOrigin: `${fr.x + fr.w / 2}px ${
                      fr.y + fr.h / 2
                    }px`,
                    transform: `translate(${p.x * previewFactor}px, ${
                      p.y * previewFactor
                    }px) rotate(${p.rotate}deg) scale(${p.scale})`,
                  }}
                />
              );
            })}
          </svg>

          {/* Stickers (preview) */}
          {card.stickers
            ?.slice()
            .sort((a, b) => (a.z ?? 0) - (b.z ?? 0))
            .map((s) => (
              <img
                key={s.id}
                src={s.src}
                alt=""
                draggable={false}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 110,
                  height: 110,
                  transform: `translate(calc(-50% + ${s.x}px), calc(-50% + ${s.y}px)) rotate(${s.rotate}deg) scale(${s.scale})`,
                  transformOrigin: "center",
                  pointerEvents: "none",
                  zIndex: 20 + (s.z ?? 0),
                }}
              />
            ))}

          <div
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              bottom: 28,
              textAlign: "center",
              color: (card as any).textColor ?? "white",
              fontSize: 16,
              fontWeight: 700,
              textShadow: "0 2px 10px rgba(0,0,0,0.6)",
              pointerEvents: "none",
            }}
            className={
              fontClass[
                ((card as any).textStyle ?? "modern") as keyof typeof fontClass
              ]
            }
          >
            {card.message}
          </div>
        </div>
      )}
    </div>
  );
}
