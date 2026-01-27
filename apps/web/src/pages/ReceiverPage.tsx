import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heart, Lock } from "lucide-react";

const HOLD_DURATION = 1600; // ms

type Particle = {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
};

const HeartRain = () => {
  const hearts = useMemo<Particle[]>(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 14 + Math.random() * 20,
      duration: 6 + Math.random() * 8,
      delay: Math.random() * 6,
      opacity: 0.15 + Math.random() * 0.35,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((h) => (
        <div
          key={h.id}
          className="absolute animate-fall"
          style={{
            left: `${h.left}%`,
            width: h.size,
            height: h.size,
            animationDuration: `${h.duration}s`,
            animationDelay: `-${h.delay}s`,
            opacity: h.opacity,
          }}
        >
          <Heart className="w-full h-full text-pink-400 fill-pink-400" />
        </div>
      ))}
    </div>
  );
};

export default function ReceiverPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const raf = useRef<number | null>(null);
  const startTime = useRef<number>(0);

  useEffect(() => {
    if (!holding) return;

    function tick(t: number) {
      if (!startTime.current) startTime.current = t;
      const elapsed = t - startTime.current;
      const pct = Math.min(elapsed / HOLD_DURATION, 1);
      setProgress(pct);

      if (pct >= 1) {
        navigate(`/c/${slug}`);
        return;
      }

      raf.current = requestAnimationFrame(tick);
    }

    raf.current = requestAnimationFrame(tick);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [holding, navigate, slug]);

  function startHold() {
    setProgress(0);
    startTime.current = 0;
    setHolding(true);
  }

  function stopHold() {
    setHolding(false);
    setProgress(0);
    startTime.current = 0;
    if (raf.current) cancelAnimationFrame(raf.current);
  }

  return (
    <div className="relative min-h-screen bg-[#FFF9FB] flex items-center justify-center overflow-hidden">
      <HeartRain />

      <div className="relative z-10 text-center px-6">
        <div className="mx-auto mb-8 w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center">
          <Lock className="w-10 h-10 text-pink-500" />
        </div>

        <h1 className="text-4xl font-pacifico text-pink-600 mb-3">
          A card is waiting 💌
        </h1>

        <p className="text-slate-500 mb-10">Someone made this just for you</p>

        {/* Hold Button */}
        <div
          onMouseDown={startHold}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={startHold}
          onTouchEnd={stopHold}
          className="relative mx-auto w-64 h-16 rounded-full bg-pink-500 text-white font-bold flex items-center justify-center cursor-pointer select-none shadow-lg active:scale-95 transition-transform"
        >
          <span className="relative z-10">
            {holding ? "Keep holding…" : "Hold to unlock"}
          </span>

          {/* Progress fill */}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-pink-600 transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Local styles */}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); }
          100% { transform: translateY(110vh) rotate(360deg); }
        }

        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
}
