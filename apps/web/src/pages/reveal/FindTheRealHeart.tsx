import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import type { RevealMechanismProps } from "./types";

interface HeartPosition {
  id: number;
  x: number;
  y: number;
  isCorrect: boolean;
  isShaking: boolean;
}

export default function FindTheRealHeart({ onUnlock }: RevealMechanismProps) {
  const heartCount = 12; // Fixed to 12 hearts (4 columns x 3 rows)
  const [hearts, setHearts] = useState<HeartPosition[]>([]);
  const [hasWon, setHasWon] = useState(false);

  // Initialize hearts in a 4x3 grid and pick one as correct
  useEffect(() => {
    const correctIndex = Math.floor(Math.random() * heartCount);
    const newHearts: HeartPosition[] = [];

    // Create 4 columns x 3 rows grid
    const cols = 4;
    const rows = 3;
    const paddingX = 15; // Padding from edges
    const paddingY = 15;
    const spacingX = (100 - 2 * paddingX) / (cols - 1);
    const spacingY = (100 - 2 * paddingY) / (rows - 1);

    for (let i = 0; i < heartCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = paddingX + col * spacingX;
      const y = paddingY + row * spacingY;

      newHearts.push({
        id: i,
        x,
        y,
        isCorrect: i === correctIndex,
        isShaking: false,
      });
    }

    setHearts(newHearts);
  }, []);

  const handleHeartTap = (heartId: number) => {
    if (hasWon) return;

    const heart = hearts.find((h) => h.id === heartId);
    if (!heart) return;

    if (heart.isCorrect) {
      // Correct heart tapped!
      setHasWon(true);
      setTimeout(() => {
        onUnlock();
      }, 800);
    } else {
      // Wrong heart - shake it
      setHearts((prev) =>
        prev.map((h) => (h.id === heartId ? { ...h, isShaking: true } : h)),
      );

      // Remove shake after animation
      setTimeout(() => {
        setHearts((prev) =>
          prev.map((h) => (h.id === heartId ? { ...h, isShaking: false } : h)),
        );
      }, 500);
    }
  };

  return (
    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 animate-fadeIn">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-pink-600 mb-3 font-accent">
          Find the Real Heart 💕
        </h1>
        <p className="text-slate-600 text-lg">
          One heart holds the key to your card
        </p>
      </div>

      {/* Hearts Container */}
      <div className="relative w-full max-w-md aspect-square">
        {hearts.map((heart) => (
          <button
            key={heart.id}
            onClick={() => handleHeartTap(heart.id)}
            disabled={hasWon}
            className={`absolute w-16 h-16 transition-all duration-300 cursor-pointer
              ${heart.isShaking ? "animate-shake" : "animate-heartbeat"}
              ${hasWon && heart.isCorrect ? "animate-pulse scale-150 z-10" : ""}
              ${hasWon && !heart.isCorrect ? "opacity-20 scale-75" : ""}
              ${!hasWon ? "hover:scale-110 active:scale-95" : ""}
            `}
            style={{
              left: `${heart.x}%`,
              top: `${heart.y}%`,
              transform: "translate(-50%, -50%)",
              animationDelay: `${heart.id * 0.1}s`,
            }}
          >
            <Heart
              className={`w-full h-full transition-all duration-300
                ${hasWon && heart.isCorrect ? "text-pink-500 fill-pink-500" : "text-pink-400 fill-pink-400"}
              `}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>

      {hasWon && (
        <div className="mt-8 text-center animate-fadeIn">
          <p className="text-2xl font-semibold text-pink-600">
            You found it! ✨
          </p>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-50%, -50%) rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: translate(-50%, -50%) rotate(10deg); }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes heartbeat {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          25% { transform: translate(-50%, -50%) scale(1.1); }
          50% { transform: translate(-50%, -50%) scale(1); }
          75% { transform: translate(-50%, -50%) scale(1.05); }
        }

        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }

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
