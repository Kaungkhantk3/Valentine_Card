import { useState, useRef } from "react";
import { Heart, Key } from "lucide-react";
import type { RevealMechanismProps } from "./types";

export default function BreakHeart({ onUnlock }: RevealMechanismProps) {
  const [keyPosition, setKeyPosition] = useState({ x: 0, y: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [hasUnlocked, setHasUnlocked] = useState(false);
  const keyRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const container = e.currentTarget.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    setKeyPosition({ x, y });

    // Check if key is close to lock
    if (lockRef.current && keyRef.current) {
      const lockRect = lockRef.current.getBoundingClientRect();
      const keyRect = keyRef.current.getBoundingClientRect();

      const lockCenterX = lockRect.left + lockRect.width / 2;
      const lockCenterY = lockRect.top + lockRect.height / 2;
      const keyCenterX = keyRect.left + keyRect.width / 2;
      const keyCenterY = keyRect.top + keyRect.height / 2;

      const dx = lockCenterX - keyCenterX;
      const dy = lockCenterY - keyCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 50 && !isUnlocking) {
        // Key is close to lock - unlock!
        setIsUnlocking(true);
        setIsDragging(false);
        setTimeout(() => {
          setHasUnlocked(true);
          setTimeout(() => {
            onUnlock();
          }, 1000);
        }, 800);
      }
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
      {/* Title */}
      <div className="mb-16 text-center animate-fadeIn">
        <h2 className="text-4xl font-bold text-pink-600 mb-3 font-accent">
          Unlock the Heart 💝
        </h2>
        <p className="text-slate-600 text-lg">
          Drag the key to the heart lock to open it
        </p>
      </div>

      {/* Container for draggable area */}
      <div className="relative w-full max-w-md h-96">
        {/* Heart-shaped Lock */}
        <div
          ref={lockRef}
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
            isUnlocking ? "scale-125" : "scale-100"
          }`}
        >
          {/* Glow effect */}
          <div
            className={`absolute inset-0 -m-12 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full blur-3xl transition-all duration-500 ${
              isUnlocking ? "opacity-60 scale-150" : "opacity-30"
            }`}
          />

          {/* Heart Lock */}
          <div className="relative w-32 h-32">
            <Heart
              className={`w-full h-full transition-all duration-500 ${
                isUnlocking
                  ? "text-pink-400 fill-pink-400"
                  : "text-pink-500 fill-pink-500"
              }`}
              strokeWidth={2}
            />

            {/* Keyhole in center */}
            {!isUnlocking && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full shadow-inner flex items-center justify-center">
                  <div className="w-2 h-3 bg-pink-600 rounded-t-full" />
                  <div className="absolute top-1/2 w-1.5 h-3 bg-pink-600" />
                </div>
              </div>
            )}

            {/* Opening animation */}
            {isUnlocking && (
              <>
                {/* Left half */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
                    animation: "openLeft 0.8s ease-out forwards",
                  }}
                >
                  <Heart
                    className="w-full h-full text-pink-400 fill-pink-400"
                    strokeWidth={2}
                  />
                </div>
                {/* Right half */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)",
                    animation: "openRight 0.8s ease-out forwards",
                  }}
                >
                  <Heart
                    className="w-full h-full text-pink-400 fill-pink-400"
                    strokeWidth={2}
                  />
                </div>
                {/* Card inside */}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    animation: "cardReveal 0.6s 0.4s ease-out forwards",
                    opacity: 0,
                  }}
                >
                  <div className="text-4xl">💌</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Draggable Key */}
        {!isUnlocking && (
          <div
            ref={keyRef}
            className={`absolute left-1/2 top-1/2 cursor-grab active:cursor-grabbing transition-transform ${
              isDragging ? "scale-110" : "scale-100"
            }`}
            style={{
              transform: `translate(calc(-50% + ${keyPosition.x}px), calc(-50% + ${keyPosition.y}px))`,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <div className="relative">
              {/* Key glow */}
              <div className="absolute inset-0 -m-4 bg-yellow-300 rounded-full blur-xl opacity-40" />

              {/* Key */}
              <div className="relative">
                <Key
                  className="w-16 h-16 text-yellow-500 fill-yellow-400"
                  strokeWidth={2}
                  style={{
                    filter: "drop-shadow(0 4px 12px rgba(234, 179, 8, 0.5))",
                    transform: "rotate(-45deg)",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hint */}
      {!isUnlocking && (
        <div className="mt-8 text-center animate-bounce">
          <p className="text-pink-500 text-sm font-semibold">
            👆 Drag the key to the heart
          </p>
        </div>
      )}

      {/* Unlock Animation */}
      {hasUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center animate-fadeIn">
          <div className="text-center">
            <div className="text-8xl mb-4 animate-bounce">💝</div>
            <p className="text-2xl font-bold text-pink-600">Unlocked!</p>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes openLeft {
          to {
            transform: translateX(-30px) rotate(-15deg);
            opacity: 0.5;
          }
        }

        @keyframes openRight {
          to {
            transform: translateX(30px) rotate(15deg);
            opacity: 0.5;
          }
        }

        @keyframes cardReveal {
          to {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}
