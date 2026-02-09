import { useState, useEffect } from "react";
import { X, Heart, Users, Check } from "lucide-react";

type UnlockType = "findHeart" | "bringTogether" | "scratchCard" | "breakHeart";

interface UnlockManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: UnlockType) => void;
  currentSelection?: UnlockType;
}

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
      "Two avatars will appear on screen",
      "Drag one avatar towards the other",
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

export default function UnlockManualModal({
  isOpen,
  onClose,
  onSelect,
  currentSelection,
}: UnlockManualModalProps) {
  const [activeTab, setActiveTab] = useState<UnlockType>("findHeart");

  // Reset active tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(currentSelection || "findHeart");
    }
  }, [isOpen, currentSelection]);

  if (!isOpen) return null;

  const activeMethod = unlockMethods[activeTab];
  const Icon = activeMethod.icon;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Bottom Sheet Modal - Taller */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slideUp">
        <div className="bg-white rounded-t-3xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col">
          {/* Header - More compact */}
          <div className="relative px-6 pt-4 pb-3 border-b border-slate-200 bg-white flex-shrink-0">
            <button
              onClick={onClose}
              className="absolute right-4 top-3 p-2 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="text-lg font-bold text-slate-800">
              How Unlock Animations Work
            </h2>
          </div>

          {/* Tabs */}
          <div className="px-6 pt-3 pb-3 flex gap-2 border-b border-slate-100 flex-shrink-0">
            {Object.values(unlockMethods).map((method) => {
              const TabIcon = method.icon;
              const isActive = activeTab === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => setActiveTab(method.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                    isActive
                      ? method.color === "pink"
                        ? "border-pink-500 bg-pink-50 text-pink-700"
                        : "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span className="text-sm font-semibold">{method.title}</span>
                </button>
              );
            })}
          </div>

          {/* Content - Takes available space */}
          <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center">
            {/* Video Preview - Much larger */}
            <div className="w-full max-w-2xl mb-12">
              <div className="relative aspect-[9/16] rounded-3xl overflow-hidden bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 shadow-xl">
                <video
                  key={activeMethod.videoSrc}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src={activeMethod.videoSrc} type="video/mp4" />
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon
                      className={`w-16 h-16 ${
                        activeMethod.color === "pink"
                          ? "text-pink-400"
                          : "text-purple-400"
                      }`}
                    />
                  </div>
                </video>
              </div>
            </div>

            {/* Instructions - Below video */}
            <div className="w-full max-w-2xl">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">
                How it works:
              </h3>
              <div className="space-y-3">
                {activeMethod.steps.map((step, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white mt-0.5 ${
                        activeMethod.color === "pink"
                          ? "bg-pink-500"
                          : "bg-purple-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <p className="text-sm text-slate-700 pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex-shrink-0">
            <button
              onClick={() => {
                onSelect(activeTab);
                onClose();
              }}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
}
