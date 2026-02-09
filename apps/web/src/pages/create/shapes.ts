export type ShapeId = "circle" | "heart" | "triangle" | "square";

export type ShapeDef = {
  id: ShapeId;
  svgPath: string; // in 100x100 space
  canvasPath: (ctx: CanvasRenderingContext2D, size: number) => void; // draw in size x size
};

// Heart in 100x100 coordinate space (same as your old HEART_D)
const HEART_PATH =
  "M50 86 C22 68 10 55 10 38 C10 26 18 18 30 18 C38 18 45 22 50 29 C55 22 62 18 70 18 C82 18 90 26 90 38 C90 55 78 68 50 86 Z";

export const SHAPES: Record<ShapeId, ShapeDef> = {
  circle: {
    id: "circle",
    svgPath: "M50,0 A50,50 0 1,1 49.999,0 Z",
    canvasPath(ctx, size) {
      const r = size / 2;
      ctx.beginPath();
      ctx.arc(r, r, r, 0, Math.PI * 2);
      ctx.closePath();
    },
  },

  square: {
    id: "square",
    svgPath:
      "M10 0 H90 Q100 0 100 10 V90 Q100 100 90 100 H10 Q0 100 0 90 V10 Q0 0 10 0 Z",
    canvasPath(ctx, size) {
      const radius = size * 0.1; // 10% rounded corners
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(size - radius, 0);
      ctx.quadraticCurveTo(size, 0, size, radius);
      ctx.lineTo(size, size - radius);
      ctx.quadraticCurveTo(size, size, size - radius, size);
      ctx.lineTo(radius, size);
      ctx.quadraticCurveTo(0, size, 0, size - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
    },
  },

  triangle: {
    id: "triangle",
    svgPath:
      "M50 5 Q52 0 54 3 L97 95 Q100 100 95 100 L5 100 Q0 100 3 95 L46 3 Q48 0 50 5 Z",
    canvasPath(ctx, size) {
      const r = size * 0.03; // Small rounding factor
      ctx.beginPath();
      ctx.moveTo(size / 2, r);
      ctx.lineTo(size - r, size - r);
      ctx.quadraticCurveTo(size, size, size / 2 + r, size);
      ctx.lineTo(r, size);
      ctx.quadraticCurveTo(0, size, r, size - r);
      ctx.closePath();
    },
  },

  heart: {
    id: "heart",
    svgPath: HEART_PATH,
    canvasPath(ctx, size) {
      const s = size / 100;
      ctx.beginPath();
      ctx.moveTo(50 * s, 86 * s);
      ctx.bezierCurveTo(22 * s, 68 * s, 10 * s, 55 * s, 10 * s, 38 * s);
      ctx.bezierCurveTo(10 * s, 26 * s, 18 * s, 18 * s, 30 * s, 18 * s);
      ctx.bezierCurveTo(38 * s, 18 * s, 45 * s, 22 * s, 50 * s, 29 * s);
      ctx.bezierCurveTo(55 * s, 22 * s, 62 * s, 18 * s, 70 * s, 18 * s);
      ctx.bezierCurveTo(82 * s, 18 * s, 90 * s, 26 * s, 90 * s, 38 * s);
      ctx.bezierCurveTo(90 * s, 55 * s, 78 * s, 68 * s, 50 * s, 86 * s);
      ctx.closePath();
    },
  },
};
