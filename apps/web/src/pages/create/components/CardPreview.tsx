import React, { useMemo, useRef } from "react";
import { SHAPES } from "../shapes";
import type { PhotoState, StickerLayer, TextStyle, TextLayer } from "../types";
import { factor } from "../constants";
import { dist, angle, clamp } from "../utils";

type Pt = { x: number; y: number };

function midpoint(a: Pt, b: Pt): Pt {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

// Sticker element with gesture support
function StickerElement({
  sticker: s,
  selected,
  cardRef,
  setActiveStickerId,
  setStickers,
}: {
  sticker: StickerLayer;
  selected: boolean;
  cardRef: React.RefObject<HTMLDivElement | null>;
  setActiveStickerId: (id: string | null) => void;
  setStickers: React.Dispatch<React.SetStateAction<StickerLayer[]>>;
}) {
  const pointersRef = useRef(new Map<number, Pt>());
  const gestureRef = useRef<{
    startX: number;
    startY: number;
    ox: number;
    oy: number;
    baseScale: number;
    baseRotate: number;
    baseDist: number;
    baseAng: number;
    baseMid: Pt;
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setActiveStickerId(s.id);

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (!gestureRef.current) {
      gestureRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        ox: s.x,
        oy: s.y,
        baseScale: s.scale,
        baseRotate: s.rotate,
        baseDist: 1,
        baseAng: 0,
        baseMid: { x: e.clientX, y: e.clientY },
      };
    } else {
      gestureRef.current.startX = e.clientX;
      gestureRef.current.startY = e.clientY;
      gestureRef.current.ox = s.x;
      gestureRef.current.oy = s.y;
      gestureRef.current.baseScale = s.scale;
      gestureRef.current.baseRotate = s.rotate;
    }

    // If we now have 2 pointers, snapshot 2-finger baseline
    if (pointersRef.current.size === 2 && gestureRef.current) {
      const pts = Array.from(pointersRef.current.values());
      gestureRef.current.baseDist = dist(pts[0], pts[1]) || 1;
      gestureRef.current.baseAng = angle(pts[0], pts[1]);
      gestureRef.current.baseMid = midpoint(pts[0], pts[1]);
      gestureRef.current.baseScale = s.scale;
      gestureRef.current.baseRotate = s.rotate;
      gestureRef.current.ox = s.x;
      gestureRef.current.oy = s.y;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gestureRef.current;
    if (!g) return;

    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    // 2-finger: pinch + rotate + pan
    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      const d = dist(pts[0], pts[1]);
      const a = angle(pts[0], pts[1]);
      const m = midpoint(pts[0], pts[1]);

      const scaleMul = d / (g.baseDist || 1);
      const nextScale = clamp(g.baseScale * scaleMul, 0.3, 3);

      const deltaAng = a - g.baseAng;
      const deltaDeg = (deltaAng * 180) / Math.PI;
      const nextRotate = g.baseRotate + deltaDeg;

      // Pan (midpoint movement) - slower speed
      const dxPx = (m.x - g.baseMid.x) * 0.5;
      const dyPx = (m.y - g.baseMid.y) * 0.5;
      const dx = dxPx * (1080 / rect.width);
      const dy = dyPx * (1920 / rect.height);

      setStickers((prev) =>
        prev.map((st) =>
          st.id === s.id
            ? {
                ...st,
                scale: nextScale,
                rotate: nextRotate,
                x: g.ox + dx,
                y: g.oy + dy,
              }
            : st,
        ),
      );
      return;
    }

    // 1-finger: drag only - slower speed
    if (pointersRef.current.size === 1) {
      const dxPx = (e.clientX - g.startX) * 0.5; // 50% slower
      const dyPx = (e.clientY - g.startY) * 0.5;

      const dx = dxPx * (1080 / rect.width);
      const dy = dyPx * (1920 / rect.height);

      setStickers((prev) =>
        prev.map((st) =>
          st.id === s.id ? { ...st, x: g.ox + dx, y: g.oy + dy } : st,
        ),
      );
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);

    const g = gestureRef.current;
    if (!g) return;

    // If one finger remains after multi-touch, reset baselines
    if (pointersRef.current.size === 1) {
      const remaining = Array.from(pointersRef.current.values())[0];
      g.startX = remaining.x;
      g.startY = remaining.y;
      g.ox = s.x;
      g.oy = s.y;
      g.baseScale = s.scale;
      g.baseRotate = s.rotate;
      g.baseMid = remaining;
      g.baseDist = 1;
      g.baseAng = 0;
    }

    // Clear gesture when all pointers are up
    if (pointersRef.current.size === 0) {
      gestureRef.current = null;
    }
  };

  return (
    <div
      className="absolute left-1/2 top-1/2 touch-none z-40"
      style={{
        transform: `translate(calc(-50% + ${s.x / factor}px), calc(-50% + ${s.y / factor}px)) rotate(${s.rotate}deg) scale(${s.scale})`,
        transformOrigin: "center",
        touchAction: "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
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
}

// Text element with gesture support
function TextElement({
  text: t,
  selected,
  cardRef,
  setActiveTextId,
  setTextLayers,
}: {
  text: any; // TextLayer type
  selected: boolean;
  cardRef: React.RefObject<HTMLDivElement | null>;
  setActiveTextId: (id: string | null) => void;
  setTextLayers: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const pointersRef = useRef(new Map<number, Pt>());
  const gestureRef = useRef<{
    startX: number;
    startY: number;
    ox: number;
    oy: number;
    baseScale: number;
    baseRotate: number;
    baseDist: number;
    baseAng: number;
    baseMid: Pt;
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setActiveTextId(t.id);

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (!gestureRef.current) {
      gestureRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        ox: t.x,
        oy: t.y,
        baseScale: t.scale,
        baseRotate: t.rotate,
        baseDist: 1,
        baseAng: 0,
        baseMid: { x: e.clientX, y: e.clientY },
      };
    } else {
      gestureRef.current.startX = e.clientX;
      gestureRef.current.startY = e.clientY;
      gestureRef.current.ox = t.x;
      gestureRef.current.oy = t.y;
      gestureRef.current.baseScale = t.scale;
      gestureRef.current.baseRotate = t.rotate;
    }

    // If we now have 2 pointers, snapshot 2-finger baseline
    if (pointersRef.current.size === 2 && gestureRef.current) {
      const pts = Array.from(pointersRef.current.values());
      gestureRef.current.baseDist = dist(pts[0], pts[1]) || 1;
      gestureRef.current.baseAng = angle(pts[0], pts[1]);
      gestureRef.current.baseMid = midpoint(pts[0], pts[1]);
      gestureRef.current.baseScale = t.scale;
      gestureRef.current.baseRotate = t.rotate;
      gestureRef.current.ox = t.x;
      gestureRef.current.oy = t.y;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gestureRef.current;
    if (!g) return;

    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    // 2-finger: pinch + rotate + pan
    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      const d = dist(pts[0], pts[1]);
      const a = angle(pts[0], pts[1]);
      const m = midpoint(pts[0], pts[1]);

      const scaleMul = d / (g.baseDist || 1);
      const nextScale = clamp(g.baseScale * scaleMul, 0.3, 3);

      const deltaAng = a - g.baseAng;
      const deltaDeg = (deltaAng * 180) / Math.PI;
      const nextRotate = g.baseRotate + deltaDeg;

      // Pan (midpoint movement) - slower speed
      const dxPx = (m.x - g.baseMid.x) * 0.5;
      const dyPx = (m.y - g.baseMid.y) * 0.5;
      const dx = dxPx * (1080 / rect.width);
      const dy = dyPx * (1920 / rect.height);

      setTextLayers((prev) =>
        prev.map((st) =>
          st.id === t.id
            ? {
                ...st,
                scale: nextScale,
                rotate: nextRotate,
                x: g.ox + dx,
                y: g.oy + dy,
              }
            : st,
        ),
      );
      return;
    }

    // 1-finger: drag only - slower speed
    if (pointersRef.current.size === 1) {
      const dxPx = (e.clientX - g.startX) * 0.5; // 50% slower
      const dyPx = (e.clientY - g.startY) * 0.5;

      const dx = dxPx * (1080 / rect.width);
      const dy = dyPx * (1920 / rect.height);

      setTextLayers((prev) =>
        prev.map((st) =>
          st.id === t.id ? { ...st, x: g.ox + dx, y: g.oy + dy } : st,
        ),
      );
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);

    const g = gestureRef.current;
    if (!g) return;

    // If one finger remains after multi-touch, reset baselines
    if (pointersRef.current.size === 1) {
      const remaining = Array.from(pointersRef.current.values())[0];
      g.startX = remaining.x;
      g.startY = remaining.y;
      g.ox = t.x;
      g.oy = t.y;
      g.baseScale = t.scale;
      g.baseRotate = t.rotate;
      g.baseMid = remaining;
      g.baseDist = 1;
      g.baseAng = 0;
    }

    // Clear gesture when all pointers are up
    if (pointersRef.current.size === 0) {
      gestureRef.current = null;
    }
  };

  return (
    <div
      className="absolute left-1/2 top-1/2 touch-none cursor-grab active:cursor-grabbing pointer-events-auto"
      style={{
        transform: `translate(calc(-50% + ${t.x / factor}px), calc(-50% + ${t.y / factor}px)) rotate(${t.rotate}deg) scale(${t.scale})`,
        transformOrigin: "center",
        touchAction: "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className={[
          "font-extrabold text-center select-none px-2",
          selected ? "outline outline-2 outline-pink-400 rounded-lg" : "",
          fontClass[t.style as TextStyle],
        ].join(" ")}
        style={{
          color: t.color,
          textShadow: "0 2px 12px rgba(0,0,0,0.55)",
          maxWidth: "280px",
          wordWrap: "break-word",
          overflowWrap: "break-word",
        }}
      >
        {t.content}
      </div>
    </div>
  );
}

const fontClass = {
  handwritten: "font-handwritten",
  elegant: "font-cursive",
  modern: "font-modern",
  classic: "font-classic",
} as const;

interface CardPreviewProps {
  tpl: any;
  photosByFrame: Record<number, PhotoState>;
  activeFrame: number;
  setActiveFrame: React.Dispatch<React.SetStateAction<number>>;
  textColor: string;
  textStyle: TextStyle;
  message: string;
  error: string;
  touch: boolean;

  onOverlayPointerDown: (
    frameIndex: number,
    e: React.PointerEvent<HTMLDivElement>,
  ) => void;
  onOverlayPointerMove: (
    frameIndex: number,
    e: React.PointerEvent<HTMLDivElement>,
  ) => void;
  onOverlayPointerUp: (
    frameIndex: number,
    e: React.PointerEvent<HTMLDivElement>,
  ) => void;

  removePhoto: (frameIndex: number) => void;

  // Stickers
  stickers: StickerLayer[];
  activeStickerId: string | null;
  setActiveStickerId: (id: string | null) => void;
  setStickers: React.Dispatch<React.SetStateAction<StickerLayer[]>>;

  // Text layers
  textLayers: TextLayer[];
  activeTextId: string | null;
  setActiveTextId: (id: string | null) => void;
  setTextLayers: React.Dispatch<React.SetStateAction<TextLayer[]>>;
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

  // Text layers
  textLayers,
  activeTextId,
  setActiveTextId,
  setTextLayers,
}: CardPreviewProps) {
  // ----- Frame Styles (for click/drag overlay) -----
  const frameStyles = useMemo(() => {
    const frames = tpl.frames ?? [];
    return frames.map((fr: any) => ({
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
            className="w-[320px] aspect-[9/16] rounded-[22px] overflow-visible relative bg-[#111] isolate"
            style={{ width: "100%" }}
          >
            <img
              src={tpl.backgroundSrc}
              alt="template"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />

            {/* Stickers container */}
            <div className="absolute inset-0 overflow-visible">
              {/*  Stickers layer (above background, below photos/text) */}
              {stickers
                .slice()
                .sort((a, b) => a.z - b.z)
                .map((s) => {
                  const selected = s.id === activeStickerId;

                  return (
                    <StickerElement
                      key={s.id}
                      sticker={s}
                      selected={selected}
                      cardRef={cardRef}
                      setActiveStickerId={setActiveStickerId}
                      setStickers={setStickers}
                    />
                  );
                })}
            </div>

            {/* Multi-photo masked preview */}
            <svg
              viewBox="0 0 1080 1920"
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              <defs>
                {(tpl.frames ?? []).map((fr: any, i: number) => {
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

                {/* Defs for free-placement photo shapes */}
                {(!tpl.frames || tpl.frames.length === 0) &&
                  Object.entries(photosByFrame).map(([frameIdx, p]) => {
                    const i = Number(frameIdx);
                    const shape = SHAPES[p.shape];
                    return (
                      <clipPath key={`clip-${i}`} id={`freePlacementClip-${i}`}>
                        <path d={shape.svgPath} transform="scale(2, 2)" />
                      </clipPath>
                    );
                  })}
              </defs>

              {(tpl.frames ?? []).map((fr: any, i: number) => {
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

            {/* Free-placement photos (for templates without frames like t7, t8) */}
            {(!tpl.frames || tpl.frames.length === 0) &&
              Object.entries(photosByFrame)
                .sort((a, b) => Number(a[0]) - Number(b[0]))
                .map(([frameIdx, p]) => {
                  const i = Number(frameIdx);
                  const isActive = i === activeFrame;
                  return (
                    <div
                      key={i}
                      onClick={() => setActiveFrame(i)}
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: 200,
                        height: 200,
                        transform: `translate(calc(-50% + ${p.x * factor}px), calc(-50% + ${p.y * factor}px)) rotate(${p.rotate}deg) scale(${p.scale})`,
                        transformOrigin: "center",
                        cursor: "grab",
                        zIndex: 15,
                      }}
                      onPointerDown={(e) => onOverlayPointerDown(i, e)}
                      onPointerMove={(e) => onOverlayPointerMove(i, e)}
                      onPointerUp={(e) => onOverlayPointerUp(i, e)}
                      onPointerCancel={(e) => onOverlayPointerUp(i, e)}
                    >
                      <img
                        src={p.previewUrl}
                        alt=""
                        draggable={false}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          clipPath: `url(#freePlacementClip-${i})`,
                          border: isActive
                            ? "3px solid rgb(236, 72, 153)"
                            : "1px solid rgba(255,255,255,0.3)",
                          transition: "border 0.2s",
                        }}
                      />
                    </div>
                  );
                })}

            {/* Overlay capture layer (for gestures + selection) */}
            {(tpl.frames ?? []).map((_: any, i: number) => {
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

            {/* Text layers container */}
            <div className="absolute inset-0 overflow-visible pointer-events-none z-30">
              {textLayers
                .slice()
                .sort((a, b) => a.z - b.z)
                .map((t) => {
                  const selected = t.id === activeTextId;
                  return (
                    <TextElement
                      key={t.id}
                      text={t}
                      selected={selected}
                      cardRef={cardRef}
                      setActiveTextId={setActiveTextId}
                      setTextLayers={setTextLayers}
                    />
                  );
                })}
            </div>

            {/* Right-side mini tools (optional) */}
            {active && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                <button
                  type="button"
                  className="w-12 h-12 rounded-2xl bg-white/75 border border-white shadow-sm flex items-center justify-center active:scale-95 transition"
                  onClick={() =>
                    setActiveFrame((x: number) =>
                      Math.max(
                        0,
                        Math.min(x - 1, (tpl.frames?.length ?? 0) - 1),
                      ),
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
                      Math.max(
                        0,
                        Math.min(x + 1, (tpl.frames?.length ?? 0) - 1),
                      ),
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
