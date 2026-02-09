import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useEditorState } from "./useEditorState";
import { useEditorGestures } from "./useEditorGestures";
import { isTouchDevice } from "./utils";
import { removePhoto } from "./photo";
import TopBar from "./components/TopBar";
import CardPreview from "./components/CardPreview";
import BottomPanel from "./components/BottomPanel";

export default function CreatePage() {
  const [searchParams] = useSearchParams();
  const touch = isTouchDevice();

  const {
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

    stickers,
    setStickers,
    activeStickerId,
    setActiveStickerId,
    addSticker,
    removeSticker: removeStickerLayer,
    updateActiveSticker,

    // Text settings
    textColor,
    setTextColor,
    textStyle,
    setTextStyle,
    textLayers,
    setTextLayers,
    activeTextId,
    setActiveTextId,
    addText,
    removeText,
    updateActiveText,

    // Reveal Type
    revealType,
    setRevealType,

    // Actions
    handleCreate,
  } = useEditorState();

  // Handle revealType from URL (when returning from demo page)
  useEffect(() => {
    const urlRevealType = searchParams.get("revealType");
    if (urlRevealType === "findHeart" || urlRevealType === "bringTogether") {
      setRevealType(urlRevealType);
    }
  }, [searchParams, setRevealType]);

  const { onOverlayPointerDown, onOverlayPointerMove, onOverlayPointerUp } =
    useEditorGestures(photosByFrame, setPhotosByFrame, setActiveFrame);

  const handleRemovePhoto = (frameIndex: number) => {
    removePhoto(frameIndex, setPhotosByFrame);
  };

  const handleOverlayPointerDown = (
    frameIndex: number,
    e: React.PointerEvent<HTMLDivElement>,
  ) => {
    const hasPhoto = onOverlayPointerDown(frameIndex, e);
    if (!hasPhoto) {
      setTab("photos");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9FB] text-slate-800">
      <TopBar loading={loading} handleCreate={handleCreate} />

      <main className="mx-auto max-w-md px-4 pt-6 pb-40">
        <CardPreview
          tpl={tpl}
          photosByFrame={photosByFrame}
          activeFrame={activeFrame}
          setActiveFrame={setActiveFrame}
          textColor={textColor}
          textStyle={textStyle}
          message={message}
          error={error}
          touch={touch}
          onOverlayPointerDown={handleOverlayPointerDown}
          onOverlayPointerMove={onOverlayPointerMove}
          onOverlayPointerUp={onOverlayPointerUp}
          removePhoto={handleRemovePhoto}
          stickers={stickers}
          activeStickerId={activeStickerId}
          setActiveStickerId={setActiveStickerId}
          setStickers={setStickers}
          textLayers={textLayers}
          activeTextId={activeTextId}
          setActiveTextId={setActiveTextId}
          setTextLayers={setTextLayers}
        />
      </main>

      <BottomPanel
        tab={tab}
        setTab={setTab}
        templateList={templateList}
        templateId={templateId}
        setTemplateId={setTemplateId}
        setActiveFrame={setActiveFrame}
        panelSnap={panelSnap}
        setPanelSnap={setPanelSnap}
        tpl={tpl}
        photosByFrame={photosByFrame}
        setPhotosByFrame={setPhotosByFrame}
        activeFrame={activeFrame}
        active={active}
        setError={setError}
        message={message}
        setMessage={setMessage}
        textColor={textColor}
        setTextColor={setTextColor}
        textStyle={textStyle}
        setTextStyle={setTextStyle}
        textLayers={textLayers}
        activeTextId={activeTextId}
        setActiveTextId={setActiveTextId}
        addText={addText}
        removeText={removeText}
        updateActiveText={updateActiveText}
        stickers={stickers}
        activeStickerId={activeStickerId}
        addSticker={addSticker}
        removeSticker={removeStickerLayer}
        updateActiveSticker={updateActiveSticker}
        revealType={revealType}
        setRevealType={setRevealType}
      />
    </div>
  );
}
