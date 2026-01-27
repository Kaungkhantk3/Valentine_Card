import type { PanelSnap, StickerLayer } from "../types";
import { STICKERS } from "../stickers";

export default function DecorTab({
  stickers,
  activeStickerId,
  addSticker,
  removeSticker,
  updateActiveSticker,
  setPanelSnap,
}: {
  stickers: StickerLayer[];
  activeStickerId: string | null;
  addSticker: (def: { id: string; src: string }) => void;
  removeSticker: (id: string) => void;
  updateActiveSticker: (patch: Partial<StickerLayer>) => void;
  setPanelSnap: (snap: PanelSnap) => void;
}) {
  const active = stickers.find((s) => s.id === activeStickerId) ?? null;

  return (
    <div>
      <div className="mb-2">
        <div className="text-[11px] font-extrabold tracking-[0.25em] uppercase text-slate-300">
          Decor
        </div>
        <div className="text-xl font-black text-slate-700">Stickers</div>
      </div>

      {/* Sticker grid */}
      <div className="grid grid-cols-4 gap-3">
        {STICKERS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              addSticker(s);
              setPanelSnap("collapsed"); // give space to edit
            }}
            className="rounded-2xl bg-white/80 border border-white shadow-sm p-2 active:scale-95 transition"
            title={s.label}
          >
            <img
              src={s.src}
              alt={s.label}
              className="w-full h-auto select-none"
              draggable={false}
            />
          </button>
        ))}
      </div>

      {/* Controls for selected sticker */}
      {active && (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl bg-white/80 border border-white shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="font-extrabold text-slate-700">Scale</div>
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
              onChange={(e) =>
                updateActiveSticker({ scale: Number(e.target.value) })
              }
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
              onChange={(e) =>
                updateActiveSticker({ rotate: Number(e.target.value) })
              }
            />
          </div>

          <button
            type="button"
            onClick={() => removeSticker(active.id)}
            className="w-full rounded-2xl bg-rose-500 text-white font-extrabold py-3 active:scale-95 transition"
          >
            Delete Sticker
          </button>
        </div>
      )}
    </div>
  );
}
