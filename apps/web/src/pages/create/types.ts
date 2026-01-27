import type { ShapeId } from "./shapes";

export type FitMode = "cover" | "contain";

export type PanelSnap = "collapsed" | "half" | "full";

export type PhotoState = {
  file: File;
  previewUrl: string;

  // stored in PREVIEW pixels (320-based)
  x: number;
  y: number;

  scale: number;
  rotate: number;
  shape: ShapeId;

  fit: FitMode;
  iw: number;
  ih: number;
};

export type TabId = "layout" | "photos" | "text" | "decor" | "theme";

export type StickerLayer = {
  id: string; // unique instance id
  stickerId: string; // from STICKERS
  src: string; // resolved URL
  x: number; // px relative to card center (same style as photos)
  y: number;
  scale: number;
  rotate: number; // degrees
  z: number;
};
