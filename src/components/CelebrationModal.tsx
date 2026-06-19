import { useEffect, useState } from "react";
import type { Thought } from "../types";

interface CelebrationModalProps {
  thoughts: Thought[];
  aiAvailable: boolean;
  onClose: () => void;
  onEmptyAndKeep: () => void; // user is happy — empty jar, archive as memory
  onKeepAdding: () => void; // not ready — keep going
  generateAppreciation: (thoughts: Thought[]) => Promise<string>;
}

export function CelebrationModal({
  thoughts,
  aiAvailable,
  onClose,
  onEmptyAndKeep,
  onKeepAdding,
  generateAppreciation,
}: CelebrationModalProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const msg = await generateAppreciation(thoughts);
        if (!cancelled) setMessage(msg);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [thoughts, generateAppreciation]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gradient-to-br from-fuchsia-900/30 via-violet-900/40 to-indigo-900/30 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Confetti sparks */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {Array.from({ length: 24 }).map((_, i) => {
          const emojis = ["✨", "💖", "🌸", "⭐", "🌼", "💫", "🫧", "🌿"];
          const e = emojis[i % emojis.length];
          const left = (i * 37) % 100;
          const delay = (i * 0.13) % 3;
          return (
            <span
              key={i}
              className="animate-sparkle absolute text-2xl"
              style={{
                left: `${left}%`,
                top: `${(i * 23) % 100}%`,
                animationDelay: `${delay}s`,
              }}
            >
              {e}
            </span>
          );
        })}
      </div>

      <div className="animate-pop relative w-full max-w-lg">
        <div className="relative overflow-hidden rounded-[36px] border border-white/60 bg-gradient-to-b from-white via-rose-50/60 to-amber-50/70 p-8 shadow-[0_40px_100px_-20px_rgba(192,38,211,0.55)] backdrop-blur-xl">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 via-rose-200 to-fuchsia-200 text-3xl shadow-lg">
              🫙💛
            </div>
            <h2 className="font-display mt-4 text-3xl font-semibold text-violet-950/90">
              Your jar is full
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-violet-600/80">
              Look at you — {thoughts.length} thoughts held gently. Every feeling, every worry, every
              small hope: you gave them a home. That takes courage.
            </p>
          </div>

          {/* The appreciation note */}
          <div className="mt-5 rounded-2xl border border-amber-200/70 bg-white/70 p-5 shadow-inner">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-violet-500/80">
                <span className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-fuchsia-400 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400" />
                </span>
                Writing a little letter for you…
              </div>
            ) : error ? (
              <p className="font-hand text-xl leading-relaxed text-violet-900/80">
                You've been brave enough to set {thoughts.length} pieces of your heart down in this
                jar. That's not nothing — that's you taking care of yourself, one tiny, tender step
                at a time. You're doing so much better than you think. 💛
              </p>
            ) : (
              <p className="font-hand text-[22px] leading-snug text-violet-950/90">{message}</p>
            )}
            {!aiAvailable && !loading && !error && (
              <p className="mt-2 text-[10px] italic text-violet-400/70">
                (AI isn't configured yet, so this is a little love note from the jar itself.)
              </p>
            )}
          </div>

          {/* Stats / summary */}
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            {(() => {
              const count = thoughts.length;
              const moods = new Set(thoughts.map((t) => t.mood)).size;
              const days = new Set(
                thoughts.map((t) => new Date(t.createdAt).toDateString())
              ).size;
              return [
                { n: count, label: "thoughts" },
                { n: moods, label: "moods held" },
                { n: days, label: "days" },
              ];
            })().map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/80 bg-white/60 px-2 py-2.5 shadow-sm"
              >
                <div className="font-display text-2xl font-semibold text-violet-700">{s.n}</div>
                <div className="text-[10px] uppercase tracking-wide text-violet-500/70">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onKeepAdding}
              className="flex-1 rounded-full border border-violet-200 bg-white/70 px-4 py-3 text-sm font-semibold text-violet-600 transition hover:bg-white"
            >
              Keep adding, I'm not done yet
            </button>
            <button
              type="button"
              onClick={onEmptyAndKeep}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-400 via-fuchsia-500 to-amber-400 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-400/40 transition hover:scale-[1.03] active:scale-95 disabled:opacity-60"
            >
              This made me smile — let's start fresh 💛
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
