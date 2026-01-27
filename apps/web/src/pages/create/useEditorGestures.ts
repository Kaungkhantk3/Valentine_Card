import { useMemo, useRef } from "react";
import type { PhotoState } from "./types";
import { clamp, dist, angle } from "./utils";
import { nextShape } from "./constants";

type Pt = { x: number; y: number };

function midpoint(a: Pt, b: Pt): Pt {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function useEditorGestures(
  photosByFrame: Record<number, PhotoState>,
  setPhotosByFrame: React.Dispatch<React.SetStateAction<Record<number, PhotoState>>>,
  setActiveFrame: React.Dispatch<React.SetStateAction<number>>
) {
  const pointers = useRef(new Map<number, Pt>());

  const gesture = useRef<{
    frameIndex: number;

    // drag baseline (1 pointer)
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;

    // 2-pointer baseline
    baseScale: number;
    baseRotate: number;
    baseDist: number;
    baseAng: number;
    baseMid: Pt;

    // tap
    lastTapAt: number;
    moved: boolean;
  } | null>(null);

  // ✅ must be applied on overlay element
  const overlayStyle = useMemo(() => ({ touchAction: "none" as const }), []);

  function setActiveAndEnsure(frameIndex: number) {
    setActiveFrame(frameIndex);
    return !!photosByFrame[frameIndex];
  }

  function initGesture(frameIndex: number, p: PhotoState, e: React.PointerEvent<HTMLDivElement>) {
    gesture.current = {
      frameIndex,

      startX: e.clientX,
      startY: e.clientY,
      baseX: p.x,
      baseY: p.y,

      baseScale: p.scale,
      baseRotate: p.rotate,
      baseDist: 1,
      baseAng: 0,
      baseMid: { x: e.clientX, y: e.clientY },

      lastTapAt: gesture.current?.lastTapAt ?? 0,
      moved: false,
    };
  }

  function onOverlayPointerDown(frameIndex: number, e: React.PointerEvent<HTMLDivElement>) {
    const hasPhoto = setActiveAndEnsure(frameIndex);
    if (!hasPhoto) return false;

    const p = photosByFrame[frameIndex];
    if (!p) return false;

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // init or refresh baseline
    if (!gesture.current || gesture.current.frameIndex !== frameIndex) {
      initGesture(frameIndex, p, e);
    } else {
      // refresh baseline from current photo state
      gesture.current.startX = e.clientX;
      gesture.current.startY = e.clientY;
      gesture.current.baseX = p.x;
      gesture.current.baseY = p.y;
      gesture.current.baseScale = p.scale;
      gesture.current.baseRotate = p.rotate;
      gesture.current.moved = false;
    }

    // if we now have 2 pointers, snapshot 2-finger baseline
    if (pointers.current.size === 2 && gesture.current) {
      const pts = Array.from(pointers.current.values());
      gesture.current.baseDist = dist(pts[0], pts[1]) || 1;
      gesture.current.baseAng = angle(pts[0], pts[1]);
      gesture.current.baseMid = midpoint(pts[0], pts[1]);

      // refresh from photo at the moment 2nd finger touches
      gesture.current.baseScale = p.scale;
      gesture.current.baseRotate = p.rotate;
      gesture.current.baseX = p.x;
      gesture.current.baseY = p.y;
    }

    return true;
  }

  function onOverlayPointerMove(frameIndex: number, e: React.PointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    const p = photosByFrame[frameIndex];
    if (!g || !p) return;
    if (g.frameIndex !== frameIndex) return;

    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // ✅ 2-finger: pinch + rotate + pan (midpoint movement)
    if (pointers.current.size === 2) {
      const pts = Array.from(pointers.current.values());
      const d = dist(pts[0], pts[1]);
      const a = angle(pts[0], pts[1]);
      const m = midpoint(pts[0], pts[1]);

      const scaleMul = d / (g.baseDist || 1);
      const nextScale = clamp(g.baseScale * scaleMul, 0.3, 2.5);

      const deltaAng = a - g.baseAng;
      const deltaDeg = (deltaAng * 180) / Math.PI;
      const nextRotate = clamp(g.baseRotate + deltaDeg, -180, 180);

      // pan
      const dx = m.x - g.baseMid.x;
      const dy = m.y - g.baseMid.y;

      if (Math.abs(dx) + Math.abs(dy) > 1) g.moved = true;

      setPhotosByFrame((prev) => {
        const cur = prev[frameIndex];
        if (!cur) return prev;
        return {
          ...prev,
          [frameIndex]: {
            ...cur,
            scale: nextScale,
            rotate: nextRotate,
            x: g.baseX + dx,
            y: g.baseY + dy,
          },
        };
      });

      return;
    }

    // ✅ 1-finger: drag
    if (pointers.current.size === 1) {
      const curPt = pointers.current.get(e.pointerId);
      if (!curPt) return;

      const dx = curPt.x - g.startX;
      const dy = curPt.y - g.startY;

      if (Math.abs(dx) + Math.abs(dy) > 1) g.moved = true;

      setPhotosByFrame((prev) => {
        const curP = prev[frameIndex];
        if (!curP) return prev;
        return {
          ...prev,
          [frameIndex]: {
            ...curP,
            x: g.baseX + dx,
            y: g.baseY + dy,
          },
        };
      });
    }
  }

  function onOverlayPointerUp(frameIndex: number, e: React.PointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    const p = photosByFrame[frameIndex];

    pointers.current.delete(e.pointerId);

    if (!g || !p) return;

    // ✅ if one finger remains after multi-touch, reset baselines so it won’t jump
    if (pointers.current.size === 1) {
      const remaining = Array.from(pointers.current.values())[0];
      const cur = photosByFrame[frameIndex];
      if (cur) {
        g.startX = remaining.x;
        g.startY = remaining.y;
        g.baseX = cur.x;
        g.baseY = cur.y;
        g.baseScale = cur.scale;
        g.baseRotate = cur.rotate;
        g.baseMid = remaining;
        g.baseDist = 1;
        g.baseAng = 0;
      }
      return;
    }

    // ✅ tap/double tap only if no pointers left and user didn’t move
    if (pointers.current.size === 0) {
      const now = Date.now();
      const tapTime = now - (g.lastTapAt || 0);

      if (!g.moved) {
        if (tapTime > 0 && tapTime < 260) {
          // double tap => toggle fit
          setPhotosByFrame((prev) => {
            const cur = prev[frameIndex];
            if (!cur) return prev;
            const fit: "cover" | "contain" = cur.fit === "cover" ? "contain" : "cover";
            const scale = fit === "contain" ? Math.min(cur.scale, 0.95) : Math.max(cur.scale, 1);
            return { ...prev, [frameIndex]: { ...cur, fit, scale } };
          });
          g.lastTapAt = 0;
        } else {
          // single tap => next shape
          setPhotosByFrame((prev) => {
            const cur = prev[frameIndex];
            if (!cur) return prev;
            return { ...prev, [frameIndex]: { ...cur, shape: nextShape(cur.shape) } };
          });
          g.lastTapAt = now;
        }
      }

      g.moved = false;
    }
  }

  return {
    overlayStyle, // ✅ apply this to overlay div
    onOverlayPointerDown,
    onOverlayPointerMove,
    onOverlayPointerUp,
  };
}
