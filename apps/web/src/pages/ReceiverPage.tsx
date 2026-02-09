import { useEffect, useMemo, useRef, useState, Suspense, lazy } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heart, Sparkles } from "lucide-react";
import { SHAPES } from "./create/shapes";
import { templates } from "./create/templates";
import type { RevealType } from "./reveal";

// Lazy load reveal components - only loaded when needed
const RevealSelector = lazy(() => import("./reveal/RevealSelector"));
const FindTheRealHeart = lazy(() => import("./reveal/FindTheRealHeart"));
const BringTogether = lazy(() => import("./reveal/BringTogether"));
const ScratchCard = lazy(() => import("./reveal/ScratchCard"));
const BreakHeart = lazy(() => import("./reveal/BreakHeart"));

// Lazy load heavy animation components - only when needed
const ConfettiExplosion = lazy(() =>
  import("./AnimationComponents").then((m) => ({
    default: m.ConfettiExplosion,
  })),
);

const API = import.meta.env.VITE_API_URL as string;
const PREVIEW_W = 320;

type Particle = {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
};

type Confetti = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  type: "sparkle" | "heart" | "star";
};

type Shape = "circle" | "heart" | "triangle" | "square";
type FitMode = "cover" | "contain";

type CardPhoto = {
  id: number;
  frameIndex: number;
  url: string;
  x: number;
  y: number;
  scale: number;
  rotate: number;
  shape: Shape;
  fit?: FitMode;
};

type CardSticker = {
  id: number;
  src: string;
  cardId: number;
  stickerId: string;
  x: number;
  y: number;
  scale: number;
  rotate: number;
  z: number;
};

type CardTextLayer = {
  id: number;
  content: string;
  color: string;
  style: "handwritten" | "cursive" | "modern" | "classic" | "elegant";
  x: number;
  y: number;
  scale: number;
  rotate: number;
  z: number;
};

type Card = {
  id: number;
  slug: string;
  templateId: string;
  photoUrl: string;
  message: string;
  textColor?: string;
  textStyle?: "handwritten" | "cursive" | "modern" | "classic" | "elegant";
  photoX: number;
  photoY: number;
  photoScale: number;
  photoRotate: number;
  shape?: Shape;
  revealType?: string | null;
  photos?: CardPhoto[];
  stickers?: CardSticker[];
  textLayers?: CardTextLayer[];
  createdAt: string;
};

const fontClass = {
  handwritten: "font-handwritten",
  cursive: "font-cursive",
  modern: "font-modern",
  classic: "font-classic",
  elegant: "font-cursive",
} as const;

type Stage = "selector" | "reveal" | "envelope" | "opening" | "card";

export default function ReceiverPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [stage, setStage] = useState<Stage>("selector");
  const [selectedReveal, setSelectedReveal] = useState<RevealType | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [cardFetched, setCardFetched] = useState(false);
  const boomTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch card data on mount
  useEffect(() => {
    async function fetchCard() {
      try {
        setCardLoading(true);
        const res = await fetch(`${API}/cards/${slug}`);
        const json = await res.json();
        if (res.ok) {
          console.log("Fetched card data:", json);
          setCard(json);
          setCardFetched(true);

          // If creator set a reveal type, use it directly; otherwise show selector
          if (json.revealType) {
            setSelectedReveal(json.revealType as RevealType);
            setStage("reveal");
          } else {
            setStage("selector");
          }
        }
      } catch (err) {
        console.error("Failed to fetch card:", err);
      } finally {
        setCardLoading(false);
      }
    }

    fetchCard();
  }, [slug]);

  // Refetch card data when showing the card (for backwards compatibility)
  useEffect(() => {
    if (stage !== "card" || cardFetched) return;

    async function fetchCard() {
      try {
        setCardLoading(true);
        const res = await fetch(`${API}/cards/${slug}`);
        const json = await res.json();
        if (res.ok) {
          setCard(json);
        }
      } catch (err) {
        console.error("Failed to fetch card:", err);
      } finally {
        setCardLoading(false);
      }
    }

    fetchCard();
  }, [stage, slug, cardFetched]);

  const tpl = useMemo(() => {
    if (!card) return templates.t1;
    const tid = card.templateId ?? "t1";
    return templates[tid] ?? templates.t1;
  }, [card?.templateId]);

  function getPhotoForFrame(frameIndex: number) {
    if (!card) return null;
    const fromRel = card.photos?.find((p) => p.frameIndex === frameIndex);
    if (fromRel) return fromRel;

    // legacy fallback = frame 0 only
    if (frameIndex !== 0) return null;

    return {
      id: -1,
      frameIndex: 0,
      url: card.photoUrl,
      x: card.photoX ?? 0,
      y: card.photoY ?? 0,
      scale: card.photoScale ?? 1,
      rotate: card.photoRotate ?? 0,
      shape: (card.shape ?? "heart") as CardPhoto["shape"],
      fit: "cover",
    } satisfies CardPhoto;
  }

  function handleRevealSelect(type: RevealType) {
    setSelectedReveal(type);
    setStage("reveal");
  }

  function handleRevealUnlock() {
    // After unlock, go to envelope
    setStage("envelope");
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (boomTimeout.current) clearTimeout(boomTimeout.current);
    };
  }, []);

  function handleEnvelopeClick() {
    if (stage === "envelope") {
      setStage("opening");
      setTimeout(() => setStage("card"), 1200);
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 flex items-center justify-center overflow-x-hidden">
      {/* Only render confetti when card is shown - lazy load */}
      {stage === "card" && (
        <Suspense fallback={null}>
          <ConfettiExplosion show={true} />
        </Suspense>
      )}

      {/* Stage 1: Reveal Selector - Lazy loaded */}
      {stage === "selector" && (
        <Suspense
          fallback={<div className="text-center text-pink-600">Loading...</div>}
        >
          <div className="flex items-center justify-center">
            <RevealSelector onSelect={handleRevealSelect} />
          </div>
        </Suspense>
      )}

      {/* Stage 2: Reveal Mechanism - Lazy loaded */}
      {stage === "reveal" && selectedReveal === "findHeart" && (
        <Suspense
          fallback={
            <div className="text-center text-pink-600">
              Loading animation...
            </div>
          }
        >
          <FindTheRealHeart
            onUnlock={handleRevealUnlock}
            config={{ id: "findHeart", count: 9 }}
          />
        </Suspense>
      )}

      {stage === "reveal" && selectedReveal === "bringTogether" && (
        <Suspense
          fallback={
            <div className="text-center text-pink-600">
              Loading animation...
            </div>
          }
        >
          <BringTogether
            onUnlock={handleRevealUnlock}
            config={{ id: "bringTogether", snapDistance: 80 }}
          />
        </Suspense>
      )}

      {stage === "reveal" && selectedReveal === "scratchCard" && (
        <Suspense
          fallback={
            <div className="text-center text-pink-600">
              Loading animation...
            </div>
          }
        >
          <ScratchCard onUnlock={handleRevealUnlock} />
        </Suspense>
      )}

      {stage === "reveal" && selectedReveal === "breakHeart" && (
        <Suspense
          fallback={
            <div className="text-center text-pink-600">
              Loading animation...
            </div>
          }
        >
          <BreakHeart onUnlock={handleRevealUnlock} />
        </Suspense>
      )}

      {/* Stage 3: Envelope Appears */}
      {stage === "envelope" && (
        <div className="relative z-10 flex flex-col items-center justify-center animate-fadeIn">
          <div
            onClick={handleEnvelopeClick}
            className="relative cursor-pointer group"
          >
            {/* Envelope */}
            <div className="w-80 h-56 bg-white rounded-lg shadow-2xl overflow-hidden envelope-float transform transition-transform group-hover:scale-105">
              {/* Envelope flap */}
              <div className="absolute inset-0 bg-gradient-to-b from-pink-100 to-white">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Heart className="w-16 h-16 text-pink-500 fill-pink-500 mx-auto mb-4 animate-pulse" />
                    <p className="text-pink-600 font-semibold">Click to open</p>
                  </div>
                </div>
              </div>

              {/* Envelope shadow effect */}
              <div className="absolute -bottom-2 left-0 right-0 h-4 bg-gradient-to-b from-black/10 to-transparent rounded-full" />
            </div>
          </div>

          <p className="mt-8 text-pink-600 text-lg font-semibold animate-bounce">
            ↑ Click the envelope ↑
          </p>
        </div>
      )}

      {/* Stage 4: Envelope Opening */}
      {stage === "opening" && (
        <div className="relative z-10 flex items-center justify-center">
          <div className="relative w-96 h-64">
            {/* Envelope background */}
            <div className="absolute inset-0 bg-white rounded-lg shadow-2xl envelope-open" />

            {/* Flap animation */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-pink-100 to-white rounded-t-lg envelope-flap-open origin-top" />

            {/* Particle effects during opening */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-yellow-400 animate-spin" />
            </div>
          </div>
        </div>
      )}

      {/* Stage 5: Card Appears */}
      {stage === "card" && (
        <div className="relative z-10 text-center px-6 animate-cardAppear">
          <h2 className="text-4xl font-bold text-pink-600 mb-6">
            Your Valentine Awaits! 💕
          </h2>

          <div className="mx-auto mb-8" style={{ width: "320px" }}>
            <div className="w-full aspect-[9/16] rounded-2xl shadow-2xl overflow-visible bg-white card-appear relative">
              {cardLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-300 via-pink-200 to-purple-300">
                  <div className="text-white">Loading your card...</div>
                </div>
              ) : card ? (
                <>
                  <img
                    src={tpl.backgroundSrc}
                    alt="template"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />

                  <svg
                    viewBox="0 0 1080 1920"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <defs>
                      {tpl.frames.map((fr, i) => {
                        const p = getPhotoForFrame(i);
                        if (!p || fr.kind !== "path") return null;
                        return (
                          <clipPath key={i} id={`frameClip-${i}`}>
                            <path
                              d={SHAPES[p.shape].svgPath}
                              transform={`translate(${fr.x}, ${fr.y}) scale(${
                                fr.w / 100
                              }, ${fr.h / 100})`}
                            />
                          </clipPath>
                        );
                      })}
                    </defs>

                    {tpl.frames.map((fr, i) => {
                      const p = getPhotoForFrame(i);
                      if (!p || fr.kind !== "path") return null;

                      const fit: FitMode = (p.fit ?? "cover") as FitMode;
                      const previewFactor = 1080 / PREVIEW_W;

                      return (
                        <image
                          key={i}
                          href={p.url}
                          x={fr.x}
                          y={fr.y}
                          width={fr.w}
                          height={fr.h}
                          preserveAspectRatio={
                            fit === "contain"
                              ? "xMidYMid meet"
                              : "xMidYMid slice"
                          }
                          clipPath={`url(#frameClip-${i})`}
                          style={{
                            transformOrigin: `${fr.x + fr.w / 2}px ${
                              fr.y + fr.h / 2
                            }px`,
                            transform: `translate(${p.x * previewFactor}px, ${
                              p.y * previewFactor
                            }px) rotate(${p.rotate}deg) scale(${p.scale})`,
                          }}
                        />
                      );
                    })}
                  </svg>

                  {/* Stickers */}
                  {card.stickers
                    ?.slice()
                    .sort((a, b) => (a.z ?? 0) - (b.z ?? 0))
                    .map((s) => {
                      const previewFactor = 1080 / PREVIEW_W;
                      return (
                        <img
                          key={s.id}
                          src={s.src}
                          alt=""
                          draggable={false}
                          style={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            width: 110,
                            height: 110,
                            transform: `translate(calc(-50% + ${s.x / previewFactor}px), calc(-50% + ${s.y / previewFactor}px)) rotate(${s.rotate}deg) scale(${s.scale})`,
                            transformOrigin: "center",
                            pointerEvents: "none",
                            zIndex: 20 + (s.z ?? 0),
                          }}
                        />
                      );
                    })}

                  {/* Text layers */}
                  {card.textLayers
                    ?.slice()
                    .sort((a, b) => (a.z ?? 0) - (b.z ?? 0))
                    .map((t) => {
                      const previewFactor = 1080 / PREVIEW_W;
                      return (
                        <div
                          key={t.id}
                          style={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: `translate(calc(-50% + ${t.x / previewFactor}px), calc(-50% + ${t.y / previewFactor}px)) rotate(${t.rotate}deg) scale(${t.scale})`,
                            transformOrigin: "center",
                            textAlign: "center",
                            color: t.color,
                            fontSize: 16,
                            fontWeight: 700,
                            textShadow: "0 2px 10px rgba(0,0,0,0.6)",
                            pointerEvents: "none",
                            zIndex: 30 + (t.z ?? 0),
                            whiteSpace: "nowrap",
                            padding: "0 8px",
                          }}
                          className={
                            fontClass[t.style as keyof typeof fontClass]
                          }
                        >
                          {t.content}
                        </div>
                      );
                    })}

                  {/* Fallback message text (only if no text layers) */}
                  {!card.textLayers || card.textLayers.length === 0 ? (
                    <div
                      style={{
                        position: "absolute",
                        left: 16,
                        right: 16,
                        bottom: 28,
                        textAlign: "center",
                        color: card.textColor ?? "white",
                        fontSize: 16,
                        fontWeight: 700,
                        textShadow: "0 2px 10px rgba(0,0,0,0.6)",
                        pointerEvents: "none",
                      }}
                      className={
                        fontClass[
                          (card.textStyle ?? "modern") as keyof typeof fontClass
                        ]
                      }
                    >
                      {card.message}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-300 via-pink-200 to-purple-300 flex items-center justify-center">
                  <div className="text-center text-white">
                    <p className="font-bold text-lg">Card not found</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate(`/c/${slug}`)}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-lg"
          >
            View Full Card ✨
          </button>

          <button
            onClick={() => navigate("/")}
            className="mt-4 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-lg"
          >
            Create your own card and send your love 💌
          </button>
        </div>
      )}

      {/* Styles */}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); }
          100% { transform: translateY(110vh) rotate(360deg); }
        }

        @keyframes hopBeat {
          0%, 100% { transform: translateY(0) scale(1); }
          30% { transform: translateY(-10px) scale(1.06); }
          55% { transform: translateY(0) scale(0.98); }
          75% { transform: translateY(-6px) scale(1.03); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }

        @keyframes explode {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes cardAppear {
          0% {
            opacity: 0;
            transform: scale(0.8) rotateY(90deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotateY(0deg);
          }
        }

        @keyframes envelopeOpen {
          0% {
            transform: rotateX(0deg);
          }
          100% {
            transform: rotateX(-120deg);
          }
        }

        @keyframes boom {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: scale(2) rotate(180deg);
            opacity: 0;
          }
        }

        @keyframes boomWave {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.7);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 100px rgba(236, 72, 153, 0);
          }
        }

        @keyframes heartBurst {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }

        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-explode {
          --tx: ${Math.cos(Math.random() * Math.PI * 2) * 200}px;
          --ty: ${Math.sin(Math.random() * Math.PI * 2) * 200}px;
          animation: explode 2s ease-out forwards;
        }

        .animate-heartBurst {
          animation: heartBurst 0.6s ease-out forwards;
        }

        .animate-cardAppear {
          animation: cardAppear 1s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-boom {
          animation: boom 0.6s ease-out forwards;
        }

        .boom-effect {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          animation: boomWave 0.6s ease-out forwards;
        }

        .envelope-wrap {
          position: relative;
        }

        .envelope-bubble {
          width: 96px;
          height: 96px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: hopBeat 1.4s ease-in-out infinite;
          transform-origin: center;
          outline: 1px solid rgba(255, 105, 180, 0.15);
        }

        .envelope-float {
          animation: float 3s ease-in-out infinite;
        }

        .envelope-flap-open {
          animation: envelopeOpen 1.2s ease-in-out forwards;
        }

        .envelope-open {
          animation: fadeIn 1s ease-out;
        }

        .card-appear {
          animation: cardAppear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s backwards;
        }
      `}</style>
    </div>
  );
}
