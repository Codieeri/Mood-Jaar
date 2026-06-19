import type { Thought } from "../types";

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 45) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface ThoughtListProps {
  thoughts: Thought[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function ThoughtList({ thoughts, onRemove, onClear }: ThoughtListProps) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/45 p-5 shadow-[0_24px_50px_-28px_rgba(109,87,168,0.45)] backdrop-blur-xl sm:p-6 dark:border-violet-300/15 dark:bg-violet-950/40">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-violet-950/80 dark:text-violet-100/90">
          <span aria-hidden>🗂️</span> Inside your jar
        </h2>
        {thoughts.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-full px-3 py-1 text-xs font-medium text-rose-500/80 transition hover:bg-rose-100/70 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-300"
          >
            Empty jar
          </button>
        )}
      </div>

      {thoughts.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed border-violet-300/50 bg-white/30 px-4 py-8 text-center dark:border-violet-300/15 dark:bg-violet-950/30">
          <div className="text-3xl" aria-hidden>
            🫙
          </div>
          <p className="mt-2 text-sm text-violet-500/80 dark:text-violet-300/70">
            Nothing here yet. Your thoughts will gather safely in this jar.
          </p>
        </div>
      ) : (
        <ul className="mt-3 max-h-[300px] space-y-2 overflow-y-auto pr-1">
          {thoughts.map((t) => (
            <li
              key={t.id}
              className="group flex items-start gap-3 rounded-2xl border border-white/70 bg-white/60 p-3 transition hover:bg-white/80 dark:border-violet-300/15 dark:bg-violet-950/50 dark:hover:bg-violet-900/60"
            >
              <span
                className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full text-sm"
                style={{ background: t.soft }}
                aria-hidden
              >
                {t.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm leading-snug text-violet-950/80 dark:text-violet-100/90">{t.text}</p>
                <p className="mt-0.5 text-[11px] text-violet-400/70 dark:text-violet-300/50">{timeAgo(t.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(t.id)}
                aria-label="Remove thought"
                className="flex-none rounded-full p-1 text-violet-300 opacity-0 transition hover:bg-rose-100 hover:text-rose-500 focus:opacity-100 group-hover:opacity-100 dark:text-violet-400 dark:hover:bg-rose-900/30 dark:hover:text-rose-300"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
