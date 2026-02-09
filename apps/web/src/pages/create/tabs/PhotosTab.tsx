import React from "react";
import { UploadCloud } from "lucide-react";
import type { PanelSnap, PhotoState } from "../types";
import { MAX_PHOTOS, nextShape } from "../constants";
import { handleSelectFiles } from "../photo";
import { isTouchDevice } from "../utils";

interface PhotosTabProps {
  tpl: any;
  photosByFrame: Record<number, PhotoState>;
  setPhotosByFrame: React.Dispatch<
    React.SetStateAction<Record<number, PhotoState>>
  >;
  activeFrame: number;
  active: PhotoState | null;
  setError: (error: string) => void;
  setPanelSnap: (snap: PanelSnap) => void;
}

export default function PhotosTab({
  tpl,
  photosByFrame,
  setPhotosByFrame,
  activeFrame,
  active,
  setError,
  setPanelSnap,
}: PhotosTabProps) {
  const touch = isTouchDevice();

  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-[11px] font-extrabold tracking-[0.25em] uppercase text-slate-300">
            Photos
          </div>
          <div className="text-xl font-black text-slate-700">
            Upload Love Memories
          </div>
        </div>
        <div className="text-xs font-bold text-slate-400">
          {Object.keys(photosByFrame).length}/{tpl.frames?.length ?? MAX_PHOTOS}
        </div>
      </div>

      <label className="block">
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={async (e) => {
            setError("");
            const files = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS);
            if (files.length === 0) return;
            await handleSelectFiles(files, tpl, setPhotosByFrame);
            setPanelSnap("collapsed");
          }}
        />
        <div className="rounded-[28px] border-2 border-dashed border-pink-200 bg-pink-50/50 p-6 text-center cursor-pointer active:scale-[0.99] transition">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <UploadCloud className="w-7 h-7 text-pink-500" />
          </div>
          <div className="mt-4 text-lg font-black text-pink-600">
            Upload Love Memories
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-400">
            Select up to {MAX_PHOTOS} photos
          </div>
        </div>
      </label>

      {active && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setPhotosByFrame((prev) => {
                const cur = prev[activeFrame];
                if (!cur) return prev;
                return {
                  ...prev,
                  [activeFrame]: {
                    ...cur,
                    shape: nextShape(cur.shape),
                  },
                };
              });
            }}
            className="rounded-2xl bg-white/80 border border-white shadow-sm py-3 font-extrabold text-slate-700 active:scale-95 transition"
          >
            Shape: <span className="text-pink-600">{active.shape}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPhotosByFrame((prev) => {
                const cur = prev[activeFrame];
                if (!cur) return prev;
                const fit: "cover" | "contain" =
                  cur.fit === "cover" ? "contain" : "cover";
                const scale =
                  fit === "contain"
                    ? Math.min(cur.scale, 0.95)
                    : Math.max(cur.scale, 1);
                return {
                  ...prev,
                  [activeFrame]: { ...cur, fit, scale },
                };
              });
            }}
            className="rounded-2xl bg-white/80 border border-white shadow-sm py-3 font-extrabold text-slate-700 active:scale-95 transition"
          >
            Fit: <span className="text-pink-600">{active.fit}</span>
          </button>
        </div>
      )}

      {/* Desktop-only sliders (keep UI clean on mobile) */}
      {!touch && active && (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl bg-white/80 border border-white shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="font-extrabold text-slate-700">Zoom</div>
              <div className="text-sm font-bold text-slate-400">
                {active.scale.toFixed(2)}
              </div>
            </div>
            <input
              className="w-full mt-3"
              type="range"
              min="0.3"
              max="2.5"
              step="0.01"
              value={active.scale}
              onChange={(e) => {
                const v = Number(e.target.value);
                setPhotosByFrame((prev) => {
                  const cur = prev[activeFrame];
                  if (!cur) return prev;
                  return {
                    ...prev,
                    [activeFrame]: { ...cur, scale: v },
                  };
                });
              }}
            />
          </div>

          <div className="rounded-2xl bg-white/80 border border-white shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="font-extrabold text-slate-700">Rotate</div>
              <div className="text-sm font-bold text-slate-400">
                {Math.round(active.rotate)}°
              </div>
            </div>
            <input
              className="w-full mt-3"
              type="range"
              min={-180}
              max={180}
              step={1}
              value={active.rotate}
              onChange={(e) => {
                const v = Number(e.target.value);
                setPhotosByFrame((prev) => {
                  const cur = prev[activeFrame];
                  if (!cur) return prev;
                  return {
                    ...prev,
                    [activeFrame]: { ...cur, rotate: v },
                  };
                });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
