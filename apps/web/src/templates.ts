import type { ShapeId } from "./shapes"

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
      shape: ShapeId; // ✅ instead of d
    };

export type Template = {
  id: string;
  backgroundSrc: string;
  frames: TEMPLATE_FRAME[];
};

export const templates: Record<string, Template> = {
  t1: {
    id: "t1",
    backgroundSrc: "/templates/t1.png",
    frames: [{ kind: "path", x: 180, y: 420, w: 720, h: 720, shape: "heart" }],
  },

  t2: {
  id: "t2",
  backgroundSrc: "/templates/t2.png",
  frames: [
    // Top polaroid photo area
    { kind: "path", x: 230, y: 210, w: 620, h: 620, shape: "heart"  },

    // Middle polaroid photo area
    { kind: "path", x: 230, y: 770, w: 620, h: 620, shape: "heart"  },

    // Bottom polaroid photo area
    { kind: "path", x: 230, y: 1330, w: 620, h: 620, shape: "heart"  },
  ],
},

};
