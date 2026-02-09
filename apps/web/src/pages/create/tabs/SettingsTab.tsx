import { Heart, Users, HelpCircle, Sparkles, Lock } from "lucide-react";
import { Link } from "react-router-dom";

interface SettingsTabProps {
  revealType?: "findHeart" | "bringTogether" | "scratchCard" | "breakHeart";
  setRevealType: (
    type:
      | "findHeart"
      | "bringTogether"
      | "scratchCard"
      | "breakHeart"
      | undefined,
  ) => void;
}

export default function SettingsTab({
  revealType,
  setRevealType,
}: SettingsTabProps) {
  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700">
            Unlock Animation
          </h3>
          <Link
            to={`/unlock-demo${revealType ? `?selected=${revealType}` : ""}`}
            className="flex items-center gap-1 text-xs text-pink-600 hover:text-pink-700 font-medium transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            How it works
          </Link>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Choose how your card will be revealed
        </p>

        <div className="grid grid-cols-2 gap-3">
          {/* Find the Real Heart */}
          <button
            onClick={() =>
              setRevealType(
                revealType === "findHeart" ? undefined : "findHeart",
              )
            }
            className={`relative p-4 rounded-xl border-2 transition-all ${
              revealType === "findHeart"
                ? "border-pink-500 bg-pink-50"
                : "border-slate-200 bg-white hover:border-pink-300"
            }`}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  revealType === "findHeart" ? "bg-pink-500" : "bg-slate-100"
                }`}
              >
                <Heart
                  className={`w-6 h-6 ${
                    revealType === "findHeart"
                      ? "text-white fill-white"
                      : "text-slate-400 fill-slate-400"
                  }`}
                />
              </div>
              <div className="text-xs font-semibold text-slate-700">
                Find the Heart
              </div>
              <div className="text-[10px] text-slate-500">
                Tap to find the real one
              </div>
            </div>
          </button>

          {/* Bring Together */}
          <button
            onClick={() =>
              setRevealType(
                revealType === "bringTogether" ? undefined : "bringTogether",
              )
            }
            className={`relative p-4 rounded-xl border-2 transition-all ${
              revealType === "bringTogether"
                ? "border-purple-500 bg-purple-50"
                : "border-slate-200 bg-white hover:border-purple-300"
            }`}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  revealType === "bringTogether"
                    ? "bg-purple-500"
                    : "bg-slate-100"
                }`}
              >
                <Users
                  className={`w-6 h-6 ${
                    revealType === "bringTogether"
                      ? "text-white"
                      : "text-slate-400"
                  }`}
                />
              </div>
              <div className="text-xs font-semibold text-slate-700">
                Bring Together
              </div>
              <div className="text-[10px] text-slate-500">
                Drag hearts together
              </div>
            </div>
          </button>

          {/* Scratch Card */}
          <button
            onClick={() =>
              setRevealType(
                revealType === "scratchCard" ? undefined : "scratchCard",
              )
            }
            className={`relative p-4 rounded-xl border-2 transition-all ${
              revealType === "scratchCard"
                ? "border-rose-500 bg-rose-50"
                : "border-slate-200 bg-white hover:border-rose-300"
            }`}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  revealType === "scratchCard" ? "bg-rose-500" : "bg-slate-100"
                }`}
              >
                <Sparkles
                  className={`w-6 h-6 ${
                    revealType === "scratchCard"
                      ? "text-white"
                      : "text-slate-400"
                  }`}
                />
              </div>
              <div className="text-xs font-semibold text-slate-700">
                Scratch to Reveal
              </div>
              <div className="text-[10px] text-slate-500">
                Scratch the screen
              </div>
            </div>
          </button>

          {/* Break Heart Lock */}
          <button
            onClick={() =>
              setRevealType(
                revealType === "breakHeart" ? undefined : "breakHeart",
              )
            }
            className={`relative p-4 rounded-xl border-2 transition-all ${
              revealType === "breakHeart"
                ? "border-red-500 bg-red-50"
                : "border-slate-200 bg-white hover:border-red-300"
            }`}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  revealType === "breakHeart" ? "bg-red-500" : "bg-slate-100"
                }`}
              >
                <Lock
                  className={`w-6 h-6 ${
                    revealType === "breakHeart"
                      ? "text-white"
                      : "text-slate-400"
                  }`}
                />
              </div>
              <div className="text-xs font-semibold text-slate-700">
                Break Heart Lock
              </div>
              <div className="text-[10px] text-slate-500">
                Tap 5 times to break
              </div>
            </div>
          </button>
        </div>

        {!revealType && (
          <p className="text-xs text-slate-400 mt-3 text-center">
            No animation selected - receiver will see the card directly
          </p>
        )}
      </div>
    </div>
  );
}
