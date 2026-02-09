import type { PhotoState, FitMode } from "./types";
import type { ShapeId } from "./shapes";
import React from "react";

export async function getImageSize(
  file: File,
): Promise<{ w: number; h: number }> {
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

export function chooseFit(
  iw: number,
  ih: number,
  fw: number,
  fh: number,
): FitMode {
  const imgR = iw / ih;
  const frameR = fw / fh;
  const ratioDiff = Math.max(imgR / frameR, frameR / imgR);
  return ratioDiff > 1.35 ? "contain" : "cover";
}

export function initialScaleForFit(fit: FitMode): number {
  return fit === "contain" ? 0.85 : 1;
}

export function cleanupPreviewUrl(url?: string) {
  if (!url) return;
  try {
    URL.revokeObjectURL(url);
  } catch {}
}

export async function handleSelectFiles(
  files: File[],
  tpl: any,
  setPhotosByFrame: React.Dispatch<
    React.SetStateAction<Record<number, PhotoState>>
  >,
) {
  if (files.length === 0) return;

  const meta = await Promise.all(
    files.map(async (f) => {
      const { w, h } = await getImageSize(f);
      return { file: f, w, h };
    }),
  );

  setPhotosByFrame((prev) => {
    const next = { ...prev };
    const framesCount = (tpl.frames?.length ?? 0) > 0 ? tpl.frames.length : 5; // Use 5 as max if no frames (free placement)

    let idx = 0;
    while (idx < framesCount && next[idx]) idx++;

    for (const m of meta) {
      if (idx >= framesCount) break;

      const fr = tpl.frames?.[idx];
      const fit = fr ? chooseFit(m.w, m.h, fr.w, fr.h) : "cover";
      const scale = fr ? initialScaleForFit(fit) : 1;

      const defaultShape = (tpl.defaultShape ?? "heart") as ShapeId;
      const autoRotate = tpl.frameRotations?.[idx] ?? 0;

      cleanupPreviewUrl(next[idx]?.previewUrl);

      next[idx] = {
        file: m.file,
        previewUrl: URL.createObjectURL(m.file),
        x: 0,
        y: 0,
        scale,
        rotate: autoRotate,
        shape: defaultShape,
        fit,
        iw: m.w,
        ih: m.h,
      };

      idx++;
    }

    return next;
  });
}

export function removePhoto(
  frameIndex: number,
  setPhotosByFrame: React.Dispatch<
    React.SetStateAction<Record<number, PhotoState>>
  >,
) {
  setPhotosByFrame((prev) => {
    const p = prev[frameIndex];
    if (p) cleanupPreviewUrl(p.previewUrl);
    const next = { ...prev };
    delete next[frameIndex];
    return next;
  });
}
