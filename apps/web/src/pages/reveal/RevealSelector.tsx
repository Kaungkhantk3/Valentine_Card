import { Heart, Users, Sparkles, Lock } from "lucide-react";
import type { RevealType } from "./types";

interface RevealSelectorProps {
  onSelect: (type: RevealType) => void;
}

export default function RevealSelector({ onSelect }: RevealSelectorProps) {
  return (
    <div className="relative z-10 w-full max-w-4xl px-6 animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-pink-600 mb-4 font-accent">
          A card is waiting 💌
        </h1>
        <p className="text-slate-600 text-xl">
          Choose how you'd like to reveal it
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Find the Real Heart */}
        <button
          onClick={() => onSelect("findHeart")}
          className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-pink-300"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Heart className="w-10 h-10 text-white fill-white" />
            </div>

            <h3 className="text-2xl font-bold text-pink-600 mb-2">
              Find the Real Heart
            </h3>

            <p className="text-slate-600 text-sm mb-4">
              Tap to find the one true heart among many
            </p>

            <div className="flex gap-2 mt-2">
              <Heart className="w-6 h-6 text-pink-300 fill-pink-300 opacity-50" />
              <Heart className="w-6 h-6 text-pink-400 fill-pink-400 opacity-70" />
              <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </button>

        {/* Bring Together */}
        <button
          onClick={() => onSelect("bringTogether")}
          className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-purple-300"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-10 h-10 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-purple-600 mb-2">
              Bring Together
            </h3>

            <p className="text-slate-600 text-sm mb-4">
              Drag two hearts together to unlock the magic
            </p>

            <div className="flex gap-8 mt-2 items-center">
              <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
              <span className="text-2xl">→</span>
              <Heart className="w-6 h-6 text-purple-500 fill-purple-500" />
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </button>

        {/* Scratch Card */}
        <button
          onClick={() => onSelect("scratchCard")}
          className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-rose-300"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-rose-600 mb-2">
              Scratch to Reveal
            </h3>

            <p className="text-slate-600 text-sm mb-4">
              Scratch the screen to uncover your card
            </p>

            <div className="flex gap-2 mt-2">
              <span className="text-2xl">💕</span>
              <span className="text-2xl opacity-50">💕</span>
              <span className="text-2xl opacity-30">💕</span>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </button>

        {/* Break Heart Lock */}
        <button
          onClick={() => onSelect("breakHeart")}
          className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-red-300"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Lock className="w-10 h-10 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-red-600 mb-2">
              Break the Heart Lock
            </h3>

            <p className="text-slate-600 text-sm mb-4">
              Tap 5 times to break the lock and reveal
            </p>

            <div className="flex gap-2 mt-2 items-center">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              <Lock className="w-5 h-5 text-red-400" />
              <span className="text-xl">💔</span>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </button>
      </div>

      <p className="text-center text-slate-400 text-sm mt-8">
        Pick your favorite way to unwrap this special moment ✨
      </p>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
