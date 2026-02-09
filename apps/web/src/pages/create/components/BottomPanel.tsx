import React from "react";
import {
  LayoutGrid,
  Image as ImageIcon,
  Type as TypeIcon,
  Sparkles,
  Settings,
} from "lucide-react";

import type { TabId, PanelSnap, TextStyle } from "../types";
import type { RevealType } from "../../reveal/types";
import LayoutTab from "../tabs/LayoutTab";
import PhotosTab from "../tabs/PhotosTab";
import TextTab from "../tabs/TextTab";
import DecorTab from "../tabs/DecorTab";
import SettingsTab from "../tabs/SettingsTab";

interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function TabButton({ label, icon, active, onClick, disabled }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition",
        disabled ? "opacity-40" : "opacity-100",
        active ? "text-pink-600" : "text-slate-300",
      ].join(" ")}
    >
      <div
        className={[
          "w-10 h-10 rounded-2xl flex items-center justify-center",
          active ? "bg-pink-50 shadow-sm" : "bg-transparent",
        ].join(" ")}
      >
        {icon}
      </div>
      <div className="text-[10px] font-bold tracking-widest uppercase">
        {label}
      </div>
    </button>
  );
}

interface BottomPanelProps {
  tab: TabId;
  setTab: (tab: TabId) => void;

  // ✅ Snap system
  panelSnap: PanelSnap;
  setPanelSnap: (snap: PanelSnap) => void;

  // LayoutTab props
  templateList: any[];
  templateId: string;
  setTemplateId: (id: string) => void;
  setActiveFrame: React.Dispatch<React.SetStateAction<number>>;

  // PhotosTab props
  tpl: any;
  photosByFrame: Record<number, any>;
  setPhotosByFrame: React.Dispatch<React.SetStateAction<Record<number, any>>>;
  activeFrame: number;
  active: any;
  setError: (error: string) => void;

  // TextTab props
  message: string;
  setMessage: (message: string) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  textStyle: TextStyle;
  setTextStyle: (style: TextStyle) => void;
  textLayers: any[];
  activeTextId: string | null;
  setActiveTextId: (id: string | null) => void;
  addText: () => void;
  removeText: (id: string) => void;
  updateActiveText: (patch: any) => void;

  //  Sticker state/actions
  stickers: any[];
  activeStickerId: string | null;
  addSticker: (def: { id: string; src: string }) => void;
  removeSticker: (id: string) => void;
  updateActiveSticker: (patch: any) => void;

  // Reveal Type
  revealType?: RevealType;
  setRevealType: (type: RevealType | undefined) => void;
}

export default function BottomPanel({
  tab,
  setTab,
  panelSnap,
  setPanelSnap,

  templateList,
  templateId,
  setTemplateId,
  setActiveFrame,

  tpl,
  photosByFrame,
  setPhotosByFrame,
  activeFrame,
  active,
  setError,

  message,
  setMessage,
  textColor,
  setTextColor,
  textStyle,
  setTextStyle,
  textLayers,
  activeTextId,
  setActiveTextId,
  addText,
  removeText,
  updateActiveText,

  stickers,
  activeStickerId,
  addSticker,
  removeSticker,
  updateActiveSticker,

  revealType,
  setRevealType,
}: BottomPanelProps) {
  // Better heights for mobile + keyboard
  const snapClass =
    panelSnap === "collapsed"
      ? "h-[92px]"
      : panelSnap === "half"
        ? "h-[45vh] max-h-[420px]"
        : "h-[70vh] max-h-[720px]";

  function toggleCollapse() {
    setPanelSnap(panelSnap === "collapsed" ? "half" : "collapsed");
  }

  function openTab(next: TabId) {
    setTab(next);

    // If collapsed -> open it
    if (panelSnap === "collapsed") {
      if (next === "layout" || next === "photos") setPanelSnap("full");
      else setPanelSnap("half");
      return;
    }

    // If already open -> adjust by tab
    if (next === "layout" || next === "photos") setPanelSnap("full");
    else setPanelSnap("half");
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      <div className="mx-auto max-w-md px-4 pb-4">
        <div
          className={[
            "rounded-[34px] bg-white/75 backdrop-blur-xl border border-white shadow-2xl shadow-pink-200/40",
            "transition-all duration-300 ease-out overflow-hidden",
            "flex flex-col", // ✅ IMPORTANT: enables scroll area + sticky tab bar
            snapClass,
          ].join(" ")}
        >
          {/* ✅ Handle (always visible) */}
          <button
            type="button"
            onClick={toggleCollapse}
            className="w-full flex justify-center py-2 shrink-0"
            aria-label="Toggle panel"
          >
            <div className="h-1.5 w-12 rounded-full bg-slate-300/60" />
          </button>

          {/* ✅ Scrollable Content (NOT clipped anymore) */}
          {panelSnap !== "collapsed" && (
            <div className="px-5 pt-2 pb-4 flex-1 overflow-y-auto">
              {tab === "layout" && (
                <LayoutTab
                  templateList={templateList}
                  templateId={templateId}
                  setTemplateId={setTemplateId}
                  setActiveFrame={setActiveFrame}
                  setPanelSnap={setPanelSnap}
                />
              )}

              {tab === "photos" && (
                <PhotosTab
                  tpl={tpl}
                  photosByFrame={photosByFrame}
                  setPhotosByFrame={setPhotosByFrame}
                  activeFrame={activeFrame}
                  active={active}
                  setError={setError}
                  setPanelSnap={setPanelSnap}
                />
              )}

              {tab === "text" && (
                <TextTab
                  message={message}
                  setMessage={setMessage}
                  textColor={textColor}
                  setTextColor={setTextColor}
                  textStyle={textStyle}
                  setTextStyle={setTextStyle}
                  setPanelSnap={setPanelSnap}
                  textLayers={textLayers}
                  activeTextId={activeTextId}
                  setActiveTextId={setActiveTextId}
                  addText={addText}
                  removeText={removeText}
                  updateActiveText={updateActiveText}
                />
              )}

              {tab === "decor" && (
                <DecorTab
                  stickers={stickers}
                  activeStickerId={activeStickerId}
                  addSticker={addSticker}
                  removeSticker={removeSticker}
                  updateActiveSticker={updateActiveSticker}
                  setPanelSnap={setPanelSnap}
                />
              )}

              {tab === "settings" && (
                <SettingsTab
                  revealType={revealType}
                  setRevealType={setRevealType}
                />
              )}
            </div>
          )}

          {/* ✅ Tab bar always visible */}
          <div className="border-t border-white/60 bg-white/50 px-3 py-2 shrink-0">
            <div className="flex items-center justify-between">
              <TabButton
                label="Layout"
                icon={<LayoutGrid className="w-5 h-5" />}
                active={tab === "layout"}
                onClick={() => openTab("layout")}
              />
              <TabButton
                label="Photos"
                icon={<ImageIcon className="w-5 h-5" />}
                active={tab === "photos"}
                onClick={() => openTab("photos")}
              />
              <TabButton
                label="Text"
                icon={<TypeIcon className="w-5 h-5" />}
                active={tab === "text"}
                onClick={() => openTab("text")}
              />
              <TabButton
                label="Decor"
                icon={<Sparkles className="w-5 h-5" />}
                active={tab === "decor"}
                onClick={() => openTab("decor")}
              />
              <TabButton
                label="Settings"
                icon={<Settings className="w-5 h-5" />}
                active={tab === "settings"}
                onClick={() => openTab("settings")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
