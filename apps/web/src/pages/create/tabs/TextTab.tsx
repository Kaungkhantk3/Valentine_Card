import type { PanelSnap } from "../types";

const fontClass = {
  handwritten: "font-handwritten",
  cursive: "font-cursive",
  modern: "font-modern",
  classic: "font-classic",
} as const;

interface TextTabProps {
  message: string;
  setMessage: (message: string) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  textStyle: "handwritten" | "cursive" | "modern" | "classic";
  setTextStyle: (
    style: "handwritten" | "cursive" | "modern" | "classic"
  ) => void;
  setPanelSnap: (snap: PanelSnap) => void;
}

export default function TextTab({
  message,
  setMessage,
  textColor,
  setTextColor,
  textStyle,
  setTextStyle,
  setPanelSnap,
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
          { id: "cursive", label: "Cursive" },
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

        <button
          type="button"
          onClick={() => setPanelSnap("collapsed")}
          className="mt-3 w-full rounded-2xl bg-pink-500 text-white font-extrabold py-3 active:scale-95 transition"
        >
          Done
        </button>
      </div>
    </div>
  );
}
