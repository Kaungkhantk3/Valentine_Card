import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";

interface TopBarProps {
  loading: boolean;
  handleCreate: () => void;
}

export default function TopBar({ loading, handleCreate }: TopBarProps) {
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-white/60 border-b border-white/60">
      <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => nav("/")}
          className="w-11 h-11 rounded-2xl bg-white/70 border border-white shadow-sm flex items-center justify-center active:scale-95 transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>

        <div className="text-center leading-tight">
          <div className="text-[11px] font-extrabold tracking-[0.25em] uppercase text-pink-300">
            Valentine Card
          </div>
          <div className="text-lg font-black text-pink-600">Editor</div>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          disabled={loading}
          className="px-5 h-11 rounded-full bg-pink-500 text-white font-extrabold shadow-lg shadow-pink-200/60 active:scale-95 transition disabled:opacity-60 disabled:active:scale-100 flex items-center gap-2"
        >
          <Check className="w-5 h-5" />
          {loading ? "Saving..." : "Finish"}
        </button>
      </div>
    </header>
  );
}
