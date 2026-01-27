import React, { useMemo, useRef } from "react";
import { SHAPES } from "../shapes";
import type { PhotoState, StickerLayer } from "../types";
import { factor } from "../constants";

const fontClass = {
  handwritten: "font-handwritten",
  cursive: "font-cursive",
  modern: "font-modern",
  classic: "font-classic",
} as const;

interface CardPreviewProps {
  tpl: any;
  photosByFrame: Record<number, PhotoState>;
  activeFrame: number;
  setActiveFrame: React.Dispatch<React.SetStateAction<number>>;
  textColor: string;
  textStyle: "handwritten" | "cursive" | "modern" | "classic";
  message: string;
  error: string;
  touch: boolean;

  onOverlayPointerDown: (
    frameIndex: number,
    e: React.PointerEvent<HTMLDivElement>
  ) => void;
  onOverlayPointerMove: (
    frameIndex: number,
    e: React.PointerEvent<HTMLDivElement>
  ) => void;
  onOverlayPointerUp: (
    frameIndex: number,
    e: React.PointerEvent<HTMLDivElement>
  ) => void;

  removePhoto: (frameIndex: number) => void;

  // Stickers
  stickers: StickerLayer[];
  activeStickerId: string | null;
  setActiveStickerId: (id: string | null) => void;
  setStickers: React.Dispatch<React.SetStateAction<StickerLayer[]>>;
}

export default function CardPreview({
  tpl,
  photosByFrame,
  activeFrame,
  setActiveFrame,
  textColor,
  textStyle,
  message,
  error,
  touch,
  onOverlayPointerDown,
  onOverlayPointerMove,
  onOverlayPointerUp,
  removePhoto,

  // Stickers
  stickers,
  activeStickerId,
  setActiveStickerId,
  setStickers,
}: CardPreviewProps) {
  // ----- Frame Styles (for click/drag overlay) -----
  const frameStyles = useMemo(() => {
    return tpl.frames.map((fr: any) => ({
      left: `${(fr.x / 1080) * 100}%`,
      top: `${(fr.y / 1920) * 100}%`,
      width: `${(fr.w / 1080) * 100}%`,
      height: `${(fr.h / 1920) * 100}%`,
    })) as Array<{ left: string; top: string; width: string; height: string }>;
  }, [tpl.frames]);

  const active = photosByFrame[activeFrame] ?? null;
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative">
      <div className="absolute inset-0 bg-pink-200/40 blur-3xl rounded-[3rem] -z-10" />
      <div className="mx-auto w-[320px]">
        <div className="rounded-[28px] bg-white/70 border border-white shadow-xl shadow-pink-200/40 p-4">
          <div
            ref={cardRef}
            className="w-[320px] aspect-[9/16] rounded-[22px] overflow-hidden relative bg-[#111]"
            style={{ width: "100%" }}
          >
            <img
              src={tpl.backgroundSrc}
              alt="template"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />

            {/*  Stickers layer (above background, below photos/text) */}
            {stickers
              .slice()
              .sort((a, b) => a.z - b.z)
              .map((s) => {
                const selected = s.id === activeStickerId;

                return (
                  <div
                    key={s.id}
                    className="absolute left-1/2 top-1/2 touch-none z-40"
                    style={{
                      transform: `translate(calc(-50% + ${s.x}px), calc(-50% + ${s.y}px)) rotate(${s.rotate}deg) scale(${s.scale})`,
                      transformOrigin: "center",
                      touchAction: "none",
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      (e.currentTarget as HTMLElement).setPointerCapture(
                        e.pointerId
                      );

                      setActiveStickerId(s.id);

                      const startX = e.clientX;
                      const startY = e.clientY;
                      const ox = s.x;
                      const oy = s.y;

                      const onMove = (ev: PointerEvent) => {
                        const rect = cardRef.current?.getBoundingClientRect();
                        if (!rect) return;

                        const dxPx = ev.clientX - startX;
                        const dyPx = ev.clientY - startY;

                        // convert screen pixels -> template units
                        const dx = dxPx * (1080 / rect.width);
                        const dy = dyPx * (1920 / rect.height);

                        setStickers((prev) =>
                          prev.map((st) =>
                            st.id === s.id
                              ? { ...st, x: ox + dx, y: oy + dy }
                              : st
                          )
                        );
                      };

                      const onUp = () => {
                        window.removeEventListener("pointermove", onMove);
                        window.removeEventListener("pointerup", onUp);
                      };

                      window.addEventListener("pointermove", onMove);
                      window.addEventListener("pointerup", onUp);
                    }}
                  >
                    <img
                      src={s.src}
                      alt={s.stickerId}
                      draggable={false}
                      className={[
                        "w-[110px] h-auto select-none",
                        selected ? "ring-2 ring-pink-400 rounded-2xl" : "",
                      ].join(" ")}
                    />
                  </div>
                );
              })}

            {/* Multi-photo masked preview */}
            <svg
              viewBox="0 0 1080 1920"
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              <defs>
                {tpl.frames.map((fr: any, i: number) => {
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

              {tpl.frames.map((fr: any, i: number) => {
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

            {/* Overlay capture layer (for gestures + selection) */}
            {tpl.frames.map((_: any, i: number) => {
              const isActive = i === activeFrame;
              const hasPhoto = !!photosByFrame[i];

              return (
                <div
                  key={i}
                  onPointerDown={(e) => onOverlayPointerDown(i, e)}
                  onPointerMove={(e) => onOverlayPointerMove(i, e)}
                  onPointerUp={(e) => onOverlayPointerUp(i, e)}
                  onPointerCancel={(e) => onOverlayPointerUp(i, e)}
                  onClick={() => setActiveFrame(i)}
                  style={{
                    position: "absolute",
                    ...frameStyles[i],
                    touchAction: "none", // IMPORTANT for pinch/rotate on mobile
                  }}
                  className={[
                    "rounded-2xl transition z-20",
                    hasPhoto ? "bg-transparent" : "bg-white/5",
                    isActive
                      ? "outline outline-2 outline-white/80"
                      : "outline outline-1 outline-white/25",
                    hasPhoto ? "cursor-grab" : "cursor-pointer",
                    touch ? "touch-none" : "",
                  ].join(" ")}
                  title={
                    hasPhoto ? `Frame ${i + 1}` : `Frame ${i + 1} (no photo)`
                  }
                />
              );
            })}

            {/* Message */}
            <div
              className={[
                "absolute left-4 right-4 bottom-7 text-center font-extrabold",
                fontClass[textStyle],
              ].join(" ")}
              style={{
                textShadow: "0 2px 12px rgba(0,0,0,0.55)",
                pointerEvents: "none",
                color: textColor,
              }}
            >
              <div className="text-[16px]">{message}</div>
            </div>

            {/* Right-side mini tools (optional) */}
            {active && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                <button
                  type="button"
                  className="w-12 h-12 rounded-2xl bg-white/75 border border-white shadow-sm flex items-center justify-center active:scale-95 transition"
                  onClick={() =>
                    setActiveFrame((x: number) =>
                      Math.max(0, Math.min(x - 1, tpl.frames.length - 1))
                    )
                  }
                  aria-label="Previous frame"
                >
                  <span className="text-slate-600 font-black">↑</span>
                </button>
                <button
                  type="button"
                  className="w-12 h-12 rounded-2xl bg-white/75 border border-white shadow-sm flex items-center justify-center active:scale-95 transition"
                  onClick={() =>
                    setActiveFrame((x: number) =>
                      Math.max(0, Math.min(x + 1, tpl.frames.length - 1))
                    )
                  }
                  aria-label="Next frame"
                >
                  <span className="text-slate-600 font-black">↓</span>
                </button>
                <button
                  type="button"
                  className="w-12 h-12 rounded-2xl bg-pink-500 text-white shadow-lg shadow-pink-200/50 flex items-center justify-center active:scale-95 transition"
                  onClick={() => removePhoto(activeFrame)}
                  aria-label="Remove photo"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>

          {/* Small hint */}
          <div className="mt-3 text-center text-[11px] font-semibold text-slate-400">
            {touch ? (
              <span>
                Drag to move · Pinch to zoom · Two-finger rotate · Tap to change
                shape · Double tap fit
              </span>
            ) : (
              <span>Drag with mouse. Use tabs below for Photos/Text.</span>
            )}
          </div>

          {error && (
            <div className="mt-3 text-sm font-bold text-rose-600">{error}</div>
          )}
        </div>
      </div>
    </section>
  );
}
