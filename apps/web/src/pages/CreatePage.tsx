import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { templates } from "../templates";
import { SHAPES } from "../shapes";
import type { ShapeId } from "../shapes";

type FitMode = "cover" | "contain";

type PhotoState = {
  file: File;
  previewUrl: string;
  uploadedUrl?: string;

  // stored in PREVIEW pixels (320-based)
  x: number;
  y: number;

  scale: number;
  rotate: number;
  shape: ShapeId;

  // ✅ NEW
  fit: FitMode;
  iw: number;
  ih: number;
};

const MAX_PHOTOS = 5;
const API = import.meta.env.VITE_API_URL as string;

const tpl = templates.t2;

const PREVIEW_W = 320;
const factor = 1080 / PREVIEW_W; // 3.375

const SHAPE_ORDER: ShapeId[] = ["circle", "heart", "triangle", "square"];
function nextShape(s: ShapeId): ShapeId {
  const i = SHAPE_ORDER.indexOf(s);
  return SHAPE_ORDER[(i + 1) % SHAPE_ORDER.length];
}

async function uploadOne(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const upRes = await fetch(`${API}/upload`, { method: "POST", body: form });
  const upJson = await upRes.json();
  if (!upRes.ok) throw new Error(upJson?.error ?? "Upload failed");

  return upJson.url as string;
}

async function getImageSize(file: File): Promise<{ w: number; h: number }> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("Image load failed"));
    });
    return {
      w: img.naturalWidth || img.width,
      h: img.naturalHeight || img.height,
    };
  } finally {
    try {
      URL.revokeObjectURL(url);
    } catch {}
  }
}

function chooseFit(iw: number, ih: number, fw: number, fh: number): FitMode {
  const imgR = iw / ih;
  const frameR = fw / fh;
  const ratioDiff = Math.max(imgR / frameR, frameR / imgR);

  // big mismatch -> start with contain so user sees whole image (instagram-like)
  return ratioDiff > 1.35 ? "contain" : "cover";
}

function initialScaleForFit(fit: FitMode): number {
  // keep cover stable; contain starts slightly zoomed-out
  return fit === "contain" ? 0.85 : 1;
}

export default function CreatePage() {
  const nav = useNavigate();

  const [message, setMessage] = useState("Hello Valentine");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeFrame, setActiveFrame] = useState(0);
  const [photosByFrame, setPhotosByFrame] = useState<
    Record<number, PhotoState>
  >({});

  const active = photosByFrame[activeFrame] ?? null;

  function cleanupPreviewUrl(url?: string) {
    if (!url) return;
    try {
      URL.revokeObjectURL(url);
    } catch {}
  }

  const frameStyles = useMemo(() => {
    return tpl.frames.map((fr) => ({
      left: `${(fr.x / 1080) * 100}%`,
      top: `${(fr.y / 1920) * 100}%`,
      width: `${(fr.w / 1080) * 100}%`,
      height: `${(fr.h / 1920) * 100}%`,
    })) as Array<{
      left: string;
      top: string;
      width: string;
      height: string;
    }>;
  }, []);

  async function handleCreate() {
    setError("");

    const entries = Object.entries(photosByFrame)
      .map(([k, v]) => ({ frameIndex: Number(k), ...v }))
      .sort((a, b) => a.frameIndex - b.frameIndex);

    if (entries.length === 0) {
      setError("Please select images");
      return;
    }

    setLoading(true);

    try {
      const uploaded = await Promise.all(
        entries.slice(0, MAX_PHOTOS).map(async (p) => ({
          frameIndex: p.frameIndex,
          url: await uploadOne(p.file),
          x: p.x,
          y: p.y,
          scale: p.scale,
          rotate: p.rotate,
          shape: p.shape,
          fit: p.fit,
        }))
      );

      const res = await fetch(`${API}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: tpl.id,
          message,
          photos: uploaded,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Create failed");

      nav(`/c/${data.slug}`);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function startDrag(frameIndex: number, e: React.MouseEvent<HTMLDivElement>) {
    const p = photosByFrame[frameIndex];
    if (!p) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const initX = p.x;
    const initY = p.y;

    function move(ev: MouseEvent) {
      setPhotosByFrame((prev) => ({
        ...prev,
        [frameIndex]: {
          ...prev[frameIndex],
          x: initX + (ev.clientX - startX),
          y: initY + (ev.clientY - startY),
        },
      }));
    }

    function up() {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    }

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }

  async function handleSelectFiles(files: File[]) {
    if (files.length === 0) return;

    const meta = await Promise.all(
      files.map(async (f) => {
        const { w, h } = await getImageSize(f);
        return { file: f, w, h };
      })
    );

    setPhotosByFrame((prev) => {
      const next = { ...prev };

      let idx = 0;
      while (idx < tpl.frames.length && next[idx]) idx++;

      for (const m of meta) {
        if (idx >= tpl.frames.length) break;

        const fr = tpl.frames[idx];
        const fit = chooseFit(m.w, m.h, fr.w, fr.h);
        const scale = initialScaleForFit(fit);

        // ✅ Use template's default shape and rotation
        const defaultShape = (tpl.defaultShape ?? "heart") as ShapeId;
        const autoRotate = tpl.frameRotations?.[idx] ?? 0;

        cleanupPreviewUrl(next[idx]?.previewUrl);

        next[idx] = {
          file: m.file,
          previewUrl: URL.createObjectURL(m.file),
          x: 0,
          y: 0,
          scale,
          rotate: autoRotate, // ✅ Changed from 0
          shape: defaultShape, // ✅ Changed from "heart"
          fit,
          iw: m.w,
          ih: m.h,
        };

        idx++;
      }

      return next;
    });
  }

  return (
    <div>
      <h1>Create</h1>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={async (e) => {
          setError("");
          const files = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS);
          if (files.length === 0) return;

          await handleSelectFiles(files);

          if (e.currentTarget) {
            e.currentTarget.value = "";
          }
        }}
      />

      <input
        value={message}
        maxLength={120}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message"
      />

      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 700 }}>Active Frame: {activeFrame + 1}</div>

        <button
          type="button"
          disabled={!active}
          onClick={() => {
            setPhotosByFrame((prev) => {
              const p = prev[activeFrame];
              if (!p) return prev;
              return {
                ...prev,
                [activeFrame]: { ...p, shape: nextShape(p.shape) },
              };
            });
          }}
        >
          Shape: {active?.shape ?? "-"}
        </button>

        <button
          type="button"
          disabled={!active}
          onClick={() => {
            setPhotosByFrame((prev) => {
              const p = prev[activeFrame];
              if (!p) return prev;
              const fit: FitMode = p.fit === "cover" ? "contain" : "cover";
              const scale =
                fit === "contain"
                  ? Math.min(p.scale, 0.95)
                  : Math.max(p.scale, 1);
              return {
                ...prev,
                [activeFrame]: { ...p, fit, scale },
              };
            });
          }}
        >
          Fit: {active?.fit ?? "-"}
        </button>
      </div>

      <label style={{ display: "block", marginTop: 8 }}>
        Zoom: {(active?.scale ?? 1).toFixed(2)}
        <input
          style={{ width: "100%" }}
          type="range"
          min="0.3"
          max="2.5"
          step="0.01"
          value={active?.scale ?? 1}
          disabled={!active}
          onChange={(e) => {
            const v = Number(e.target.value);
            setPhotosByFrame((prev) => {
              const p = prev[activeFrame];
              if (!p) return prev;
              return { ...prev, [activeFrame]: { ...p, scale: v } };
            });
          }}
        />
      </label>

      <label style={{ display: "block", marginTop: 8 }}>
        Rotate: {Math.round(active?.rotate ?? 0)}°
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          value={active?.rotate ?? 0}
          disabled={!active}
          onChange={(e) => {
            const v = Number(e.target.value);
            setPhotosByFrame((prev) => {
              const p = prev[activeFrame];
              if (!p) return prev;
              return { ...prev, [activeFrame]: { ...p, rotate: v } };
            });
          }}
        />
      </label>

      <div
        style={{
          width: 320,
          aspectRatio: "9 / 16",
          borderRadius: 16,
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.15)",
          background: "#111",
          marginTop: 12,
        }}
      >
        <img
          src={tpl.backgroundSrc}
          alt="template"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Multi-photo masked preview */}
        <svg
          viewBox="0 0 1080 1920"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          <defs>
            {tpl.frames.map((fr, i) => {
              const p = photosByFrame[i];
              if (!p) return null;

              if (fr.kind === "path") {
                return (
                  <clipPath key={i} id={`createClip-${i}`}>
                    <path
                      d={SHAPES[p.shape].svgPath}
                      transform={`translate(${fr.x}, ${fr.y}) scale(${
                        fr.w / 100
                      }, ${fr.h / 100})`}
                    />
                  </clipPath>
                );
              }

              return null;
            })}
          </defs>

          {tpl.frames.map((fr, i) => {
            const p = photosByFrame[i];
            if (!p) return null;

            if (fr.kind === "path") {
              return (
                <image
                  key={i}
                  href={p.previewUrl}
                  x={fr.x}
                  y={fr.y}
                  width={fr.w}
                  height={fr.h}
                  preserveAspectRatio={
                    p.fit === "contain" ? "xMidYMid meet" : "xMidYMid slice"
                  }
                  clipPath={`url(#createClip-${i})`}
                  style={{
                    transformOrigin: `${fr.x + fr.w / 2}px ${
                      fr.y + fr.h / 2
                    }px`,
                    transform: `translate(${p.x * factor}px, ${
                      p.y * factor
                    }px) rotate(${p.rotate}deg) scale(${p.scale})`,
                  }}
                />
              );
            }

            return null;
          })}
        </svg>

        {/* Frame overlays: select + drag */}
        {tpl.frames.map((_, i) => {
          const isActive = i === activeFrame;
          const hasPhoto = !!photosByFrame[i];

          return (
            <div
              key={i}
              onMouseDown={(e) => {
                setActiveFrame(i);
                if (hasPhoto) startDrag(i, e);
              }}
              onClick={() => setActiveFrame(i)}
              style={{
                position: "absolute",
                ...frameStyles[i],
                cursor: hasPhoto ? "grab" : "pointer",
                outline: isActive
                  ? "2px solid rgba(255,255,255,0.85)"
                  : "1px solid rgba(255,255,255,0.25)",
                borderRadius: 12,
                background: hasPhoto ? "transparent" : "rgba(255,255,255,0.05)",
              }}
              title={
                hasPhoto ? `Frame ${i + 1} (drag)` : `Frame ${i + 1} (no photo)`
              }
            />
          );
        })}

        {/* Message */}
        <div
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 28,
            textAlign: "center",
            color: "white",
            fontSize: 16,
            fontWeight: 700,
            textShadow: "0 2px 10px rgba(0,0,0,0.6)",
            pointerEvents: "none",
          }}
        >
          {message}
        </div>
      </div>

      <button
        onClick={handleCreate}
        disabled={loading}
        style={{ marginTop: 12 }}
      >
        {loading ? "Creating..." : "Upload + Create"}
      </button>

      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
    </div>
  );
}
