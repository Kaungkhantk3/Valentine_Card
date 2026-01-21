import type { ShapeId } from "./shapes";

export type TEMPLATE_FRAME =
  | {
      kind: "rect";
      x: number;
      y: number;
      w: number;
      h: number;
      r?: number;
    }
  | {
      kind: "path";
      x: number;
      y: number;
      w: number;
      h: number;
      d: string; // kept for compatibility, not used by SHAPES-based masking
    };

export type Template = {
  id: string;
  backgroundSrc: string;
  frames: TEMPLATE_FRAME[];
  defaultShape?: ShapeId;
  frameRotations?: number[];
};

const HEART_D =
  "M50 86 C22 68 10 55 10 38 C10 26 18 18 30 18 C38 18 45 22 50 29 C55 22 62 18 70 18 C82 18 90 26 90 38 C90 55 78 68 50 86 Z";

export const templates: Record<string, Template> = {
  t1: {
     id: "t1",
    backgroundSrc: "/templates/t1.png",
    frames: [{ kind: "path", x: 180, y: 420, w: 720, h: 720, d: HEART_D }],
    defaultShape: "heart",
  },

  // ✅ Polaroid stack: 3 frames
 t2: {
  id: "t2",
  backgroundSrc: "/templates/t2.png",
  frames: [
    // Top polaroid - adjust y value based on your PNG
    { kind: "path", x: 342, y: 172, w: 416, h: 434, d: HEART_D },
    
    // Middle polaroid - adjust y value
    { kind: "path", x: 335, y: 694, w: 420, h: 436, d: HEART_D },
    
    // Bottom polaroid - adjust y value
    { kind: "path", x: 344, y: 1250, w: 412, h: 430, d: HEART_D },
  ],
    defaultShape: "square",
    frameRotations: [0, -9, 0],
}
};
