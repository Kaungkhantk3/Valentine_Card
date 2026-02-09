import { useState, Suspense, lazy } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Heart, Users, Check } from "lucide-react";

// Lazy load video component to avoid eager video initialization
const VideoPreview = lazy(() =>
  Promise.resolve({
    default: ({
      videoSrc,
      Icon,
      color,
    }: {
      videoSrc: string;
      Icon: any;
      color: string;
    }) => (
      <div className="relative aspect-[9/16] max-w-md mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 shadow-2xl">
        <video
          key={videoSrc}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={videoSrc} type="video/mp4" />
          <div className="w-full h-full flex items-center justify-center">
            <Icon
              className={`w-20 h-20 ${
                color === "pink" ? "text-pink-400" : "text-purple-400"
              }`}
            />
          </div>
        </video>
      </div>
    ),
  }),
);

function VideoFallback() {
  return (
    <div className="relative aspect-[9/16] max-w-md mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 shadow-2xl animate-pulse" />
  );
}

type UnlockType = "findHeart" | "bringTogether" | "scratchCard" | "breakHeart";

const unlockMethods = {
  findHeart: {
    id: "findHeart" as const,
    title: "Find the Real Heart",
    icon: Heart,
    color: "pink",
    videoSrc: "/videos/find-heart-demo.mp4",
    steps: [
      "Multiple hearts will appear on screen",
      "Tap each heart to test it",
      "Find the one true heart to reveal your card",
    ],
  },
  bringTogether: {
    id: "bringTogether" as const,
    title: "Bring Together",
    icon: Users,
    color: "purple",
    videoSrc: "/videos/bring-together-demo.mp4",
    steps: [
      "Two hearts will appear on screen",
      "Drag one heart towards the other",
      "When they touch, your card will be revealed",
    ],
  },
  scratchCard: {
    id: "scratchCard" as const,
    title: "Scratch Card",
    icon: Heart,
    color: "pink",
    videoSrc: "/videos/scratch-card-demo.mp4",
    steps: [
      "A glittery scratch card will appear",
      "Drag your finger or mouse to scratch the cover",
      "Scratch 50% of the card to reveal your message",
    ],
  },
  breakHeart: {
    id: "breakHeart" as const,
    title: "Unlock the Heart",
    icon: Heart,
    color: "rose",
    videoSrc: "/videos/break-heart-demo.mp4",
    steps: [
      "A heart-shaped lock will appear on screen",
      "Drag the golden key towards the lock",
      "When the key is close enough, the heart unlocks",
    ],
  },
};

export default function UnlockAnimationDemo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentSelection = searchParams.get("selected") as UnlockType | null;

  const [activeTab, setActiveTab] = useState<UnlockType>(
    currentSelection || "findHeart",
  );

  const activeMethod = unlockMethods[activeTab];
  const Icon = activeMethod.icon;

  const handleSelect = () => {
    navigate(`/create?revealType=${activeTab}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                How Unlock Animations Work
              </h1>
              <p className="text-sm text-slate-500">
                Choose an interactive way to reveal your card
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div
          className="overflow-x-auto scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex gap-3 mb-8 pl-6 pr-6 min-w-max md:min-w-0 md:justify-center">
            <div className="flex-shrink-0 w-0"></div>
            {Object.values(unlockMethods).map((method) => {
              const TabIcon = method.icon;
              const isActive = activeTab === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => setActiveTab(method.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? method.color === "pink"
                        ? "border-pink-500 bg-pink-50 text-pink-700 font-semibold shadow-md"
                        : method.color === "purple"
                          ? "border-purple-500 bg-purple-50 text-purple-700 font-semibold shadow-md"
                          : "border-rose-500 bg-rose-50 text-rose-700 font-semibold shadow-md"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <TabIcon className="w-5 h-5" />
                  <span className="text-base">{method.title}</span>
                </button>
              );
            })}
            <div className="flex-shrink-0 w-0"></div>
          </div>
        </div>

        {/* Video and Instructions */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Video Preview - Lazy loaded */}
          <div className="w-full">
            <Suspense fallback={<VideoFallback />}>
              <VideoPreview
                videoSrc={activeMethod.videoSrc}
                Icon={Icon}
                color={activeMethod.color}
              />
            </Suspense>
          </div>

          {/* Instructions */}
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              How it works:
            </h2>
            <div className="space-y-4 mb-8">
              {activeMethod.steps.map((step, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-white ${
                      activeMethod.color === "pink"
                        ? "bg-pink-500"
                        : "bg-purple-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p className="text-base text-slate-700 pt-2">{step}</p>
                </div>
              ))}
            </div>

            {/* Select Button */}
            <button
              onClick={handleSelect}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${
                activeMethod.color === "pink"
                  ? "bg-gradient-to-r from-pink-500 to-pink-600"
                  : "bg-gradient-to-r from-purple-500 to-purple-600"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                Select This Animation
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
