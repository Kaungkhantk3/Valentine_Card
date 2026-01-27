import type { ShapeId } from "./shapes";

export const MAX_PHOTOS = 5;
export const API = import.meta.env.VITE_API_URL as string;

export const PREVIEW_W = 320;
export const factor = 1080 / PREVIEW_W; // 3.375

export const SHAPE_ORDER: ShapeId[] = ["circle", "heart", "triangle", "square"];

export function nextShape(s: ShapeId): ShapeId {
  const i = SHAPE_ORDER.indexOf(s);
  return SHAPE_ORDER[(i + 1) % SHAPE_ORDER.length];
}