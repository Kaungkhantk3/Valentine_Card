import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { templates } from "./templates";
import type { PhotoState, TabId, PanelSnap, StickerLayer } from "./types";
import { MAX_PHOTOS } from "./constants";
import { uploadOne, createCard } from "./api";
import { cleanupPreviewUrl } from "./photo";

export function useEditorState() {
  const nav = useNavigate();

  // ----- Template / Layout -----
  const templateList = useMemo(() => {
    // templates is an object; normalize to array
    return Object.values(templates);
  }, []);

  const [templateId, setTemplateId] = useState<string>(
    () => templateList[0]?.id ?? "t1"
  );

  const tpl = useMemo(() => {
    return (
      (templates as any)[templateId] ?? templateList[0] ?? (templates as any).t1
    );
  }, [templateId, templateList]);

  // ----- Editor State -----
  const [tab, setTab] = useState<TabId>("layout");
  const [message, setMessage] = useState("Hello Valentine");
  const [loading, setLoading] = useState(false);
  const [panelSnap, setPanelSnap] = useState<PanelSnap>("half");
  const [error, setError] = useState("");

  const [activeFrame, setActiveFrame] = useState(0);
  const [photosByFrame, setPhotosByFrame] = useState<
    Record<number, PhotoState>
  >({});

  const active = photosByFrame[activeFrame] ?? null;

  // ----- UI-only Text Settings (for now) -----
  const [textColor, setTextColor] = useState<string>("#FF3B8E");
  const [textStyle, setTextStyle] = useState<
    "handwritten" | "cursive" | "modern" | "classic"
  >("modern");

  const [stickers, setStickers] = useState<StickerLayer[]>([]);
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);

  // ----- Cleanup -----
  useEffect(() => {
    return () => {
      // cleanup all preview URLs on unmount
      Object.values(photosByFrame).forEach((p) =>
        cleanupPreviewUrl(p.previewUrl)
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- Backend Create -----
  async function handleCreate() {
    setError("");

    const entries = Object.entries(photosByFrame)
      .map(([k, v]) => ({ frameIndex: Number(k), ...v }))
      .sort((a, b) => a.frameIndex - b.frameIndex);

    if (entries.length === 0) {
      setError("Please select images");
      setTab("photos");
      return;
    }

    setLoading(true);

    try {
      const uploaded = await Promise.all(
        entries.slice(0, MAX_PHOTOS).map(async (p) => ({
          frameIndex: p.frameIndex,
          url: await uploadOne(p.file),
          x: p.x,
          y: p.y,
          scale: p.scale,
          rotate: p.rotate,
          shape: p.shape,
          fit: p.fit,
        }))
      );

      const data = await createCard(
        tpl.id,
        message,
        textColor,
        textStyle,
        uploaded,
        stickers
      );
      nav(`/c/${data.slug}`);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }
  function addSticker(def: { id: string; src: string }) {
    const id = `st_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    setStickers((prev) => [
      ...prev,
      {
        id,
        stickerId: def.id,
        src: def.src,
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
        z: prev.length + 1,
      },
    ]);
    setActiveStickerId(id);
  }

  function removeSticker(id: string) {
    setStickers((prev) => prev.filter((s) => s.id !== id));
    setActiveStickerId((cur) => (cur === id ? null : cur));
  }

  function updateActiveSticker(patch: Partial<StickerLayer>) {
    setStickers((prev) =>
      prev.map((s) => (s.id === activeStickerId ? { ...s, ...patch } : s))
    );
  }

  return {
    // Template
    templateList,
    templateId,
    setTemplateId,
    tpl,

    // Editor state
    tab,
    setTab,
    message,
    setMessage,
    loading,
    panelSnap,
    setPanelSnap,
    error,
    setError,

    // Frame/photos
    activeFrame,
    setActiveFrame,
    photosByFrame,
    setPhotosByFrame,
    active,

    // Stickers
    stickers,
    setStickers,
    activeStickerId,
    setActiveStickerId,
    addSticker,
    removeSticker,
    updateActiveSticker,

    // Text settings
    textColor,
    setTextColor,
    textStyle,
    setTextStyle,

    // Actions
    handleCreate,
  };
}
