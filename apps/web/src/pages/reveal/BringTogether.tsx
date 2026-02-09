import { useState, useRef, useEffect } from "react";
import type { RevealMechanismProps, BringTogetherConfig } from "./types";

interface Position {
  x: number;
  y: number;
}

export default function BringTogether({
  onUnlock,
  config,
}: RevealMechanismProps) {
  const snapDistance = (config as BringTogetherConfig)?.snapDistance ?? 80;
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [movablePos, setMovablePos] = useState<Position>({ x: 80, y: 50 });
  const [fixedPos] = useState<Position>({ x: 20, y: 50 }); // Left side, centered vertically
  const [hasSnapped, setHasSnapped] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const currentPosRef = useRef<Position>({ x: 80, y: 50 });

  // Calculate distance between two points
  const calculateDistance = (pos1: Position, pos2: Position): number => {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const updatePosition = (clientX: number, clientY: number) => {
    if (!containerRef.current || hasSnapped) return;

    const rect = containerRef.current.getBoundingClientRect();
    const newX = ((clientX - rect.left) / rect.width) * 100;
    const newY = ((clientY - rect.top) / rect.height) * 100;

    // Clamp to bounds
    const clampedX = Math.max(5, Math.min(95, newX));
    const clampedY = Math.max(5, Math.min(95, newY));

    currentPosRef.current = { x: clampedX, y: clampedY };

    // Use requestAnimationFrame for smooth updates
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      setMovablePos({ x: clampedX, y: clampedY });

      // Check if close enough to snap
      const distance = calculateDistance(
        { x: clampedX, y: clampedY },
        fixedPos,
      );

      if (distance < snapDistance / 5) {
        // Snap together!
        setHasSnapped(true);
        setDragging(false);
        setMovablePos(fixedPos);

        // Trigger unlock after animation
        setTimeout(() => {
          onUnlock();
        }, 1000);
      }
    });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (hasSnapped) return;
    e.preventDefault();
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || hasSnapped) return;
    e.preventDefault();
    updatePosition(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragging) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
    setDragging(false);
  };

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const distance = calculateDistance(movablePos, fixedPos);

  return (
    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 animate-fadeIn">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-pink-600 mb-3 font-accent">
          Bring Together 💑
        </h1>
        <p className="text-slate-600 text-lg">
          Drag them together to unlock your card
        </p>
      </div>

      {/* Interactive Container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-lg aspect-video bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl shadow-xl overflow-hidden touch-none"
        style={{ willChange: dragging ? "transform" : "auto" }}
      >
        {/* Connection Line */}
        {!hasSnapped && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
          >
            <line
              x1={`${fixedPos.x}%`}
              y1={`${fixedPos.y}%`}
              x2={`${movablePos.x}%`}
              y2={`${movablePos.y}%`}
              stroke="rgba(236, 72, 153, 0.3)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </svg>
        )}

        {/* Fixed Avatar (Boy - Left) */}
        <div
          className="absolute flex items-center justify-center transition-all duration-300"
          style={{
            left: `${fixedPos.x}%`,
            top: `${fixedPos.y}%`,
            transform: "translate(-50%, -50%)",
            width: "140px",
            height: "140px",
          }}
        >
          <img
            src="/avatars/boy.png"
            alt="Boy"
            className={`w-full h-full object-contain drop-shadow-xl
              ${hasSnapped ? "animate-heartBeat" : ""}
            `}
          />
          {/* Floating hearts */}
          {!hasSnapped && (
            <div className="absolute -top-2 -left-2">
              <div className="text-2xl animate-float">💕</div>
            </div>
          )}
        </div>

        {/* Movable Avatar (Girl - Right, drag to left) */}
        <div
          className={`absolute flex items-center justify-center
            ${dragging ? "cursor-grabbing scale-110" : "cursor-grab"}
            ${hasSnapped ? "duration-500" : ""}
          `}
          style={{
            left: `${movablePos.x}%`,
            top: `${movablePos.y}%`,
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            width: "140px",
            height: "140px",
            willChange: dragging ? "transform" : "auto",
            transition: hasSnapped ? "all 0.5s" : "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <img
            src="/avatars/girl.png"
            alt="Girl"
            className={`w-full h-full object-contain drop-shadow-xl
              ${hasSnapped ? "animate-heartBeat" : ""}
            `}
          />
          {/* Floating hearts */}
          {!hasSnapped && (
            <div className="absolute -top-2 -right-2">
              <div
                className="text-2xl animate-float"
                style={{ animationDelay: "0.5s" }}
              >
                💕
              </div>
            </div>
          )}
        </div>

        {/* Success Effect */}
        {hasSnapped && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-6xl animate-ping">💞</div>
          </div>
        )}
      </div>

      {/* Distance Indicator */}
      {!hasSnapped && (
        <div className="mt-6 text-center">
          <div className="w-48 h-2 bg-pink-200 rounded-full overflow-hidden mx-auto">
            <div
              className="h-full bg-pink-500 transition-all duration-200"
              style={{
                width: `${Math.max(0, 100 - distance)}%`,
              }}
            />
          </div>
          <p className="text-sm text-slate-500 mt-2">
            {distance < 30 ? "Almost there! 💕" : "Keep going..."}
          </p>
        </div>
      )}

      {hasSnapped && (
        <div className="mt-8 text-center animate-fadeIn">
          <p className="text-2xl font-semibold text-pink-600">
            Together at last! ✨
          </p>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes heartBeat {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          25% { transform: translate(-50%, -50%) scale(1.2); }
          50% { transform: translate(-50%, -50%) scale(1); }
          75% { transform: translate(-50%, -50%) scale(1.1); }
        }

        .animate-heartBeat {
          animation: heartBeat 0.8s ease-in-out;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
