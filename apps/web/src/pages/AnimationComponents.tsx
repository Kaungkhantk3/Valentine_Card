/**
 * Heavy animation components - separated for lazy loading.
 * These are only loaded when needed to improve initial page performance.
 */

import { useMemo } from "react";

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

export function HeartRain() {
  const hearts = useMemo<Particle[]>(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 20 + 10,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 0.5,
      opacity: Math.random() * 0.5 + 0.5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {hearts.map((p) => (
        <div
          key={p.id}
          className="absolute animate-fall"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  );
}

export function ConfettiExplosion({ show }: { show: boolean }) {
  const confetti = useMemo<Confetti[]>(() => {
    if (!show) return [];

    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
      duration: Math.random() * 1 + 0.8,
      type: ["sparkle", "heart", "star"][Math.floor(Math.random() * 3)] as
        | "sparkle"
        | "heart"
        | "star",
    }));
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {confetti.map((c) => (
        <div
          key={c.id}
          className="absolute animate-explode text-2xl"
          style={
            {
              left: `${c.left}%`,
              top: "50%",
              "--tx": `${Math.cos(Math.random() * Math.PI * 2) * 200}px`,
              "--ty": `${Math.sin(Math.random() * Math.PI * 2) * 200}px`,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
            } as React.CSSProperties
          }
        >
          {c.type === "sparkle" && "✨"}
          {c.type === "heart" && "💕"}
          {c.type === "star" && "⭐"}
        </div>
      ))}
    </div>
  );
}
