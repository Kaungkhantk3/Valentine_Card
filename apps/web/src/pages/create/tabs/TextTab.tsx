import { Plus, Trash2 } from "lucide-react";
import type { PanelSnap, TextStyle } from "../types";

const fontClass = {
  handwritten: "font-handwritten",
  elegant: "font-cursive",
  modern: "font-modern",
  classic: "font-classic",
} as const;

interface TextTabProps {
  message: string;
  setMessage: (message: string) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  textStyle: TextStyle;
  setTextStyle: (style: TextStyle) => void;
  setPanelSnap: (snap: PanelSnap) => void;
  textLayers: any[];
  activeTextId: string | null;
  setActiveTextId: (id: string | null) => void;
  addText: () => void;
  removeText: (id: string) => void;
  updateActiveText: (patch: any) => void;
}

export default function TextTab({
  message,
  setMessage,
  textColor,
  setTextColor,
  textStyle,
  setTextStyle,
  setPanelSnap,
  textLayers,
  activeTextId,
  setActiveTextId,
  addText,
  removeText,
  updateActiveText,
}: TextTabProps) {
  return (
    <div>
      <div className="mb-3">
        <div className="text-[11px] font-extrabold tracking-[0.25em] uppercase text-slate-300">
          Text
        </div>
        <div className="text-xl font-black text-slate-700">Message</div>
      </div>

      {/* Color dots */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {[
          "#FF3B8E",
          "#E11D48",
          "#111827",
          "#F59E0B",
          "#A855F7",
          "#10B981",
          "#FFFFFF",
        ].map((c) => {
          const selected = c === textColor;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setTextColor(c)}
              className={[
                "w-11 h-11 rounded-full border shadow-sm flex-shrink-0 active:scale-95 transition",
                selected ? "border-pink-400" : "border-white",
              ].join(" ")}
              style={{ background: c }}
              aria-label={`Color ${c}`}
            />
          );
        })}
      </div>

      {/* Style pills */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { id: "handwritten", label: "Handwritten" },
          { id: "elegant", label: "Elegant" },
          { id: "modern", label: "Modern" },
          { id: "classic", label: "Classic" },
        ].map((s) => {
          const selected = s.id === textStyle;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setTextStyle(s.id as any)}
              className={[
                "rounded-2xl py-4 text-center font-black border shadow-sm active:scale-95 transition",
                selected
                  ? "bg-white border-pink-200 text-slate-700"
                  : "bg-white/60 border-white text-slate-500",
              ].join(" ")}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Message input */}
      <div className="mt-4 rounded-2xl bg-white/80 border border-white shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="font-extrabold text-slate-700">Your message</div>
          <div className="text-xs font-bold text-slate-400">
            {message.length}/120
          </div>
        </div>

        <input
          value={message}
          maxLength={120}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setPanelSnap("full")}
          placeholder="Type something sweet…"
          style={{ color: textColor }}
          className={[
            "mt-3 w-full bg-transparent outline-none text-lg font-bold placeholder:text-slate-300",
            fontClass[textStyle],
          ].join(" ")}
        />

        <div className="mt-2 text-xs font-semibold text-slate-400">
          (This affects preview + export. Font selection is UI-only for now.)
        </div>

        <div className="mt-3 flex gap-3">
          <button
            type="button"
            onClick={() => setMessage("")}
            className="flex-1 rounded-2xl bg-white border-2 border-slate-300 text-slate-600 font-extrabold py-3 active:scale-95 transition hover:bg-slate-50"
          >
            Delete Text
          </button>
          <button
            type="button"
            onClick={() => setPanelSnap("collapsed")}
            className="flex-1 rounded-2xl bg-pink-500 text-white font-extrabold py-3 active:scale-95 transition"
          >
            Done
          </button>
        </div>
      </div>

      {/* Additional Text Layers */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-extrabold text-slate-700">
            Additional Text ({textLayers.length - 1}/4)
          </div>
          <button
            type="button"
            onClick={addText}
            disabled={textLayers.length >= 5}
            className={[
              "flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm active:scale-95 transition",
              textLayers.length >= 5
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-pink-500 text-white",
            ].join(" ")}
          >
            <Plus size={16} />
            Add Text
          </button>
        </div>

        {textLayers
          .filter((t) => t.id !== "msg_main")
          .map((textLayer) => {
            const isActive = textLayer.id === activeTextId;
            return (
              <div
                key={textLayer.id}
                className={[
                  "mb-3 p-3 rounded-2xl border-2 transition cursor-pointer",
                  isActive
                    ? "bg-white border-pink-400"
                    : "bg-white/60 border-white",
                ].join(" ")}
                onClick={() => setActiveTextId(textLayer.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-slate-600">
                    Text Layer
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeText(textLayer.id);
                    }}
                    className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 active:scale-95 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <input
                  value={textLayer.content}
                  maxLength={200}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTextId(textLayer.id);
                  }}
                  onChange={(e) => {
                    setActiveTextId(textLayer.id);
                    updateActiveText({ content: e.target.value });
                  }}
                  onFocus={() => setPanelSnap("full")}
                  placeholder="Type text..."
                  style={{ color: textLayer.color }}
                  className={[
                    "w-full bg-transparent outline-none text-sm font-bold placeholder:text-slate-300",
                    fontClass[textLayer.style as keyof typeof fontClass],
                  ].join(" ")}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
}
