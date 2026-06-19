import { useEffect } from "react";
import type { Thought } from "../types";

interface ShakeRevealProps {
  thought: Thought | null;
  onClose: () => void;
  onAnother: () => void;
}

export function ShakeReveal({ thought, onClose, onAnother }: ShakeRevealProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-violet-950/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* sparkles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <span className="animate-sparkle absolute left-1/4 top-1/4 text-2xl" style={{ animationDelay: "0s" }}>
          ✨
        </span>
        <span className="animate-sparkle absolute right-1/4 top-1/3 text-xl" style={{ animationDelay: "0.3s" }}>
          ⭐
        </span>
        <span className="animate-sparkle absolute left-1/3 bottom-1/4 text-2xl" style={{ animationDelay: "0.6s" }}>
          ✨
        </span>
        <span className="animate-sparkle absolute right-1/3 bottom-1/3 text-xl" style={{ animationDelay: "0.9s" }}>
          🌟
        </span>
      </div>

      <div className="animate-pop relative w-full max-w-md">
        {thought ? (
          <div className="relative overflow-hidden rounded-[30px] border border-amber-200/70 bg-gradient-to-b from-amber-50 to-white p-7 shadow-[0_40px_80px_-30px_rgba(76,29,149,0.6)]">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-1.5 text-violet-400/70 transition hover:bg-violet-100 hover:text-violet-600"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
                style={{ background: thought.soft }}
                aria-hidden
              >
                {thought.emoji}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700/70">
                A note from your jar
              </span>
            </div>

            <p className="font-hand mt-4 text-[26px] leading-snug text-violet-950/90">
              “{thought.text}”
            </p>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-amber-900/15" />
              <span className="text-amber-700/60" aria-hidden>
                ❀
              </span>
              <span className="h-px flex-1 bg-amber-900/15" />
            </div>

            <p className="text-center text-[15px] leading-relaxed text-violet-900/80">
              {thought.quote}
            </p>

            <div className="mt-7 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-violet-200 bg-white/70 px-5 py-2.5 text-sm font-semibold text-violet-600 transition hover:bg-white"
              >
                Put it back
              </button>
              <button
                type="button"
                onClick={onAnother}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-400/40 transition hover:scale-[1.04] active:scale-95"
              >
                Pull another note
              </button>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/80 p-8 text-center shadow-[0_40px_80px_-30px_rgba(76,29,149,0.5)] backdrop-blur-xl">
            <div className="text-5xl" aria-hidden>
              🫙
            </div>
            <h3 className="mt-3 font-display text-2xl font-semibold text-violet-950/90">
              Your jar is still empty
            </h3>
            <p className="mt-2 text-sm text-violet-500/80">
              Write down a thought and tuck it in first — then come back and give the jar a shake.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-400/40 transition hover:scale-[1.04] active:scale-95"
            >
              Okay 💜
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
