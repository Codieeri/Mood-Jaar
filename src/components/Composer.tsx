import { cn } from "../utils/cn";

interface ComposerProps {
  text: string;
  setText: (v: string) => void;
  onDrop: () => void;
  dropping: boolean;
}

const MAX = 300;

export function Composer({ text, setText, onDrop, dropping }: ComposerProps) {
  const canDrop = text.trim().length > 0 && !dropping;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canDrop) onDrop();
    }
  };

  return (
    <div className="rounded-[28px] border border-white/70 bg-white/55 p-5 shadow-[0_24px_50px_-24px_rgba(109,87,168,0.55)] backdrop-blur-xl sm:p-6 dark:border-violet-300/15 dark:bg-violet-950/40 dark:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-400 to-violet-500 text-sm shadow-sm">
          ✍️
        </span>
        <label htmlFor="thought" className="font-display text-lg font-semibold text-violet-950/80 dark:text-violet-100/90">
          What's on your mind?
        </label>
      </div>

      <textarea
        id="thought"
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX))}
        onKeyDown={handleKeyDown}
        rows={4}
        maxLength={MAX}
        placeholder="Pour it all out… a worry, a wish, a random thought — anything at all."
        className="mt-3 w-full resize-none rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-[15px] leading-relaxed text-violet-950 placeholder:text-violet-400/60 shadow-inner outline-none transition focus:border-fuchsia-300 focus:ring-4 focus:ring-fuchsia-200/50 dark:border-violet-300/15 dark:bg-violet-950/50 dark:text-violet-50 dark:placeholder:text-violet-400/50 dark:focus:border-fuchsia-400/60 dark:focus:ring-fuchsia-700/30"
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-violet-500/70 dark:text-violet-300/60">
          <span className={cn(text.length >= MAX && "font-semibold text-rose-500")}>
            {text.length}
          </span>
          /{MAX} · <span className="hidden sm:inline">Enter to drop · Shift+Enter for a new line</span>
          <span className="sm:hidden">Enter to drop</span>
        </span>
        <button
          type="button"
          onClick={onDrop}
          disabled={!canDrop}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all",
            canDrop
              ? "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 shadow-violet-400/40 hover:scale-[1.04] hover:shadow-violet-400/60 active:scale-95"
              : "cursor-not-allowed bg-slate-300/70 text-slate-500/70 shadow-none dark:bg-slate-700/50 dark:text-slate-400/50"
          )}
        >
          {dropping ? "Dropping…" : "Tuck it into the jar"}
          <span aria-hidden>{dropping ? "🫧" : "✨"}</span>
        </button>
      </div>
    </div>
  );
}
