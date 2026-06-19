import type { Thought } from "../types";

export function ReplyCardLoading() {
  return (
    <div className="animate-fade-up rounded-[28px] border border-white/80 bg-white/50 p-6 shadow-[0_24px_50px_-24px_rgba(109,87,168,0.4)] backdrop-blur-xl dark:border-violet-300/15 dark:bg-violet-950/40">
      <div className="flex items-center gap-2 text-sm font-medium text-violet-500/80 dark:text-violet-300/80">
        <span className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-fuchsia-400 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" />
        </span>
        The jar is writing something that feels closer to you…
      </div>
    </div>
  );
}

export function ReplyCard({ reply, source }: { reply: Thought; source?: "ai" | "offline" }) {
  // Use the reply's soft color but blend with dark surface in dark mode via overlay
  return (
    <div
      className="animate-pop relative overflow-hidden rounded-[28px] border border-white/80 p-5 shadow-[0_24px_50px_-24px_rgba(109,87,168,0.5)] backdrop-blur-xl sm:p-6 dark:border-violet-300/15 dark:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.6)]"
      style={{ background: `linear-gradient(135deg, ${reply.soft} 0%, #ffffffe6 70%)` }}
    >
      {/* Dark mode overlay to tone down the bright pastel */}
      <div className="pointer-events-none absolute inset-0 hidden bg-violet-950/70 dark:block" />

      {/* decorative glow */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl"
        style={{ background: reply.accent + "55" }}
      />

      <div className="relative flex items-center justify-between gap-2">
        <span
          className="inline-flex items-center rounded-full border bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide dark:bg-violet-950/60"
          style={{ color: reply.accent, borderColor: reply.accent + "55" }}
        >
          {reply.label}
        </span>
        <div className="flex items-center gap-2">
          {source === "ai" && (
            <span className="rounded-full bg-violet-100/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-500 dark:bg-violet-800/60 dark:text-violet-200">
              ✨ for you
            </span>
          )}
          <span className="text-3xl" aria-hidden>
            {reply.emoji}
          </span>
        </div>
      </div>

      <p className="font-hand relative mt-4 text-[28px] leading-tight text-violet-950/90 sm:text-[30px] dark:text-violet-50">
        "{reply.quote}"
      </p>

      <div className="relative mt-4 border-t border-violet-900/10 pt-3 dark:border-violet-300/15">
        <p className="text-xs font-medium uppercase tracking-wide text-violet-500/70 dark:text-violet-300/70">
          For what you just shared
        </p>
        <p className="mt-1 line-clamp-3 text-sm italic text-violet-900/70 dark:text-violet-200/70">"{reply.text}"</p>
      </div>
    </div>
  );
}
