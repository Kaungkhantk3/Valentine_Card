import React, { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Sparkles,
  Send,
  Star,
  ArrowRight,
  Zap,
  Image as ImageIcon,
  MessageSquareHeart,
} from "lucide-react";

const FallingDecorations: React.FC = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 10 + Math.random() * 25,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 10,
      type: Math.random() > 0.5 ? "heart" : "sparkle",
      opacity: 0.1 + Math.random() * 0.3,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-fall"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `-${p.delay}s`,
            opacity: p.opacity,
          }}
        >
          {p.type === "heart" ? (
            <Heart className="w-full h-full text-pink-300 fill-pink-300" />
          ) : (
            <Sparkles className="w-full h-full text-pink-200" />
          )}
        </div>
      ))}
    </div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#FFF9FB] text-slate-800 overflow-x-hidden">
      <FallingDecorations />

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center pt-20">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-pink-200 blur-3xl rounded-full opacity-30 animate-pulse"></div>
          <div className="relative glass p-6 rounded-[2.5rem] bg-white/40 border border-white/60 shadow-2xl">
            <Heart className="w-20 h-20 text-pink-500 fill-pink-500 drop-shadow-lg" />
            <div className="absolute -top-2 -right-2 bg-yellow-400 p-2 rounded-full shadow-lg animate-bounce">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          <h1 className="text-5xl font-accent bg-gradient-to-br from-pink-600 to-rose-400 bg-clip-text text-transparent leading-tight">
            Valentine Card <br /> Studio
          </h1>
          <p className="text-lg text-slate-500 font-medium px-4">
            Create stunning, personalized love letters & cards in seconds.
            Simple. Elegant. Eternal.
          </p>
        </div>

        <div className="w-full max-w-sm mt-12 space-y-4">
          <button
            onClick={() => navigate("/create")}
            className="group relative w-full overflow-hidden rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
          >
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#FF4B91_0%,#FFD1D1_50%,#FF4B91_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-pink-500 px-8 py-4 text-lg font-bold text-white backdrop-blur-3xl group-active:scale-95 transition-transform duration-200">
              Start Designing
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          <div className="flex items-center justify-center gap-6 text-slate-400 font-semibold text-[10px] tracking-widest uppercase py-4">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-500" /> Instant
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-pink-400" /> Free
            </span>
            <span className="flex items-center gap-1">
              <Send className="w-3 h-3 text-blue-400" /> No Login
            </span>
          </div>
        </div>
      </main>

      {/* Feature Grid */}
      <section className="relative z-10 px-8 pb-12">
        <div className="grid grid-cols-2 gap-4">
          <div className="glass p-5 rounded-3xl bg-white/60 border border-white shadow-sm flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-700">
                Photo Layouts
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Smart templates that fit your memories perfectly.
              </p>
            </div>
          </div>

          <div className="glass p-5 rounded-3xl bg-white/60 border border-white shadow-sm flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
              <MessageSquareHeart className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-700">
                Live Feedback
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Real-time reactions when they open your card.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="relative z-10 p-8 text-center">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          Made with &hearts; for the romantically inclined
        </p>
      </footer>
    </div>
  );
};

export default Home;
