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
  name?: string;
  backgroundSrc: string;
  frames?: TEMPLATE_FRAME[]; // Optional - no frames means free placement
  defaultShape?: ShapeId;
  frameRotations?: number[];
};

const HEART_D =
  "M50 86 C22 68 10 55 10 38 C10 26 18 18 30 18 C38 18 45 22 50 29 C55 22 62 18 70 18 C82 18 90 26 90 38 C90 55 78 68 50 86 Z";

export const templates: Record<string, Template> = {
  t1: {
    id: "t1",
    name: "Single Heart Frame",
    backgroundSrc: "/templates/t1.png",
    frames: [{ kind: "path", x: 180, y: 520, w: 720, h: 720, d: HEART_D }],
    defaultShape: "heart",
    frameRotations: [12],
  },

  // ✅ Polaroid stack: 3 frames
  t2: {
    id: "t2",
    name: "Polaroid Stack",
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
  },

  t3: {
    id: "t3",
    name: "Music Vibes",
    backgroundSrc: "/templates/t3.png",
    frames: [{ kind: "path", x: 270, y: 485, w: 535, h: 540, d: HEART_D }],
    defaultShape: "square",
  },
  t4: {
    id: "t4",
    name: "Valentine's Day",
    backgroundSrc: "/templates/t4.png",
    frames: [{ kind: "path", x: 270, y: 650, w: 535, h: 540, d: HEART_D }],
    defaultShape: "square",
  },
  t5: {
    id: "t5",
    name: "Valentine",
    backgroundSrc: "/templates/t5.png",
    frames: [
      { kind: "path", x: 560, y: 670, w: 395, h: 575, d: HEART_D },
      { kind: "path", x: 200, y: 1050, w: 430, h: 628, d: HEART_D },
    ],
    defaultShape: "square",
  },

  t6: {
    id: "t6",
    name: "Memory Polaroids",
    backgroundSrc: "/templates/t6.png",
    frames: [
      // Top polaroid - adjust y value based on your PNG
      { kind: "path", x: 10, y: 180, w: 424, h: 429, d: HEART_D },

      // Middle polaroid - adjust y value
      { kind: "path", x: 700, y: 655, w: 420, h: 436, d: HEART_D },

      // Bottom polaroid - adjust y value
      { kind: "path", x: 155, y: 910, w: 385, h: 430, d: HEART_D },
      { kind: "path", x: 450, y: 1310, w: 400, h: 420, d: HEART_D },
    ],
    defaultShape: "square",
    frameRotations: [-13, 3, -10, 10],
  },

  t7: {
    id: "t7",
    name: "Plain Background",
    backgroundSrc: "/templates/t7.png",
    frames: [], // No frames
  },

  t8: {
    id: "t8",
    name: "Calendar Style",
    backgroundSrc: "/templates/t8.png",
    frames: [], // No frames
  },
};
