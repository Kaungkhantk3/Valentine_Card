import React from "react";
import type { PanelSnap } from "../types";

interface LayoutTabProps {
  templateList: any[];
  templateId: string;
  setTemplateId: (id: string) => void;
  setActiveFrame: React.Dispatch<React.SetStateAction<number>>;
  setPanelSnap: (snap: PanelSnap) => void;
}

export default function LayoutTab({
  templateList,
  templateId,
  setTemplateId,
  setActiveFrame,
  setPanelSnap,
}: LayoutTabProps) {
  const layoutTitle = React.useMemo(() => {
    const t = templateList.find((x: any) => x.id === templateId);
    return t?.name ?? "Layout";
  }, [templateId, templateList]);

  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-[11px] font-extrabold tracking-[0.25em] uppercase text-slate-300">
            Layout
          </div>
          <div className="text-xl font-black text-slate-700">{layoutTitle}</div>
        </div>
        <div className="text-xs font-bold text-slate-400">Tap a layout</div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {templateList.map((t: any) => {
          const selected = t.id === templateId;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTemplateId(t.id);
                setActiveFrame(0);
                setPanelSnap("collapsed");
                // keep photosByFrame as-is; frames may differ but user can reupload
              }}
              className={[
                "min-w-[110px] rounded-3xl p-3 border transition active:scale-95",
                selected
                  ? "bg-white border-pink-200 shadow-sm"
                  : "bg-white/50 border-white",
              ].join(" ")}
            >
              <div className="w-full aspect-square rounded-2xl bg-pink-50 overflow-hidden border border-white">
                {/* show template bg */}
                <img
                  src={t.backgroundSrc}
                  alt={t.name ?? t.id}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
              <div className="mt-2 text-[12px] font-black text-slate-600 text-center">
                {(t.name ?? t.id).toUpperCase()}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
