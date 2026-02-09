import { useState, useEffect, useRef, useCallback } from "react";
import type { RevealMechanismProps } from "./types";

const SCRATCH_RADIUS = 35;
const REVEAL_THRESHOLD = 70;

export default function ScratchCard({ onUnlock }: RevealMechanismProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercentage, setScratchPercentage] = useState(0);

  // Initialize canvas with glittery snow texture
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas size
    canvas.width = 350;
    canvas.height = 450;

    // Create gradient background - light gray to white with shimmer
    const gradient = ctx.createLinearGradient(0, 0, 350, 450);
    gradient.addColorStop(0, "#e8e8f0");
    gradient.addColorStop(0.5, "#f5f5f8");
    gradient.addColorStop(1, "#e8e8f0");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 350, 450);

    // Add glitter/sparkle effect with random white dots
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * 350;
      const y = Math.random() * 450;
      const size = Math.random() * 2;
      ctx.fillRect(x, y, size, size);
    }

    // Add some larger sparkles
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 350;
      const y = Math.random() * 450;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add subtle diagonal lines for texture
    ctx.strokeStyle = "rgba(200, 200, 220, 0.1)";
    ctx.lineWidth = 1;
    for (let i = -450; i < 350; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 450, 450);
      ctx.stroke();
    }
  }, []);

  // Scratch function
  const scratch = useCallback(
    (e: React.PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 350;
      const y = ((e.clientY - rect.top) / rect.height) * 450;

      // Erase circular area
      ctx.clearRect(
        x - SCRATCH_RADIUS,
        y - SCRATCH_RADIUS,
        SCRATCH_RADIUS * 2,
        SCRATCH_RADIUS * 2,
      );

      // Calculate reveal percentage
      const imageData = ctx.getImageData(0, 0, 350, 450);
      const pixels = imageData.data;
      let revealed = 0;

      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] < 128) revealed++;
      }

      const percentage = (revealed / (pixels.length / 4)) * 100;
      setScratchPercentage(percentage);

      // Trigger unlock
      if (percentage > REVEAL_THRESHOLD) {
        setIsScratching(false);
        setTimeout(() => onUnlock(), 300);
      }
    },
    [onUnlock],
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsScratching(true);
    scratch(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isScratching) return;
    scratch(e);
  };

  const handlePointerUp = () => {
    setIsScratching(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-pink-50 to-pink-100 p-4">
      {/* Main container */}
      <div className="w-full max-w-sm">
        {/* Card wrapper with rounded container */}
        <div className="rounded-3xl bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-sm border border-white/50 shadow-2xl shadow-pink-200/40 p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1
              className="text-4xl font-bold text-pink-700 mb-2"
              style={{ fontStyle: "italic" }}
            >
              A little surprise ❤️
            </h1>
            <p className="text-lg text-gray-500">
              Scratch to see what's inside
            </p>
          </div>

          {/* Scratch Card Container */}
          <div className="relative mx-auto mb-8">
            {/* Revealed card underneath */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-pink-300 via-red-300 to-pink-400 rounded-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent"></div>
              <div className="relative text-center">
                <div className="text-6xl mb-4">💗</div>
                <div className="text-white text-2xl font-bold drop-shadow-lg">
                  I LOVE YOU
                </div>
              </div>
            </div>

            {/* Scratch Canvas */}
            <canvas
              ref={canvasRef}
              className="relative w-full h-auto cursor-pointer rounded-2xl shadow-lg block border-2 border-white/30"
              style={{
                touchAction: "none",
                aspectRatio: "350/450",
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
          </div>

          {/* Tip text */}
          <div className="text-center mb-6">
            <p className="text-pink-600 font-semibold text-sm">
              👉 Tip: Drag to scratch
            </p>
          </div>

          {/* Instructions */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Works on mobile (finger) and desktop (click + drag)
            </p>
          </div>

          {/* Progress indicator - hidden until scratching starts */}
          {scratchPercentage > 0 && scratchPercentage < REVEAL_THRESHOLD && (
            <div className="mt-6 text-center text-pink-600 font-semibold text-sm">
              {Math.round(scratchPercentage)}% scratched
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
