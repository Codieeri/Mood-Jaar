import type { Thought } from "../types";
import { cn } from "../utils/cn";

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

interface JarProps {
  thoughts: Thought[];
  shaking: boolean;
  dropping: boolean;
}

const FILL_THRESHOLD = 16;

// Map mood emojis to simpler, single-codepoint ones that render well at tiny sizes
const TINY_EMOJI: Record<string, string> = {
  "🌧️": "💧",
  "🍃": "🍃",
  "🔥": "🔥",
  "🌙": "🌙",
  "🫂": "💜",
  "🧭": "🧭",
  "🌸": "🌸",
  "☀️": "☀",
};

function tinyEmoji(emoji: string): string {
  return TINY_EMOJI[emoji] ?? emoji.slice(0, 2);
}

export function Jar({ thoughts, shaking, dropping }: JarProps) {
  const maxVisible = 24;
  const visible = thoughts.slice(0, maxVisible);
  const count = thoughts.length;
  const fullness = Math.min(count / FILL_THRESHOLD, 1);
  const jarIsFull = count >= FILL_THRESHOLD;

  return (
    <div className="relative mx-auto flex w-full max-w-[260px] flex-col items-center">
      {/* Falling note */}
      {dropping && (
        <div
          className="drop-note absolute left-1/2 top-[-12px] z-30 flex h-10 w-8 items-center justify-center rounded-[4px] bg-white shadow-[0_4px_10px_rgba(80,60,120,0.35)] dark:bg-violet-200"
          aria-hidden
        >
          <div className="absolute inset-x-1 top-1 h-[3px] rounded-full bg-fuchsia-300" />
          <span className="mt-1 text-[9px] leading-none select-none">💌</span>
        </div>
      )}

      <div
        className={cn("relative flex flex-col items-center", shaking && "jar-shake")}
        style={{ transformOrigin: "50% 100%" }}
      >
        {/* Knob */}
        <div className="h-2.5 w-7 rounded-full bg-gradient-to-b from-rose-300 to-rose-500 shadow-sm" />

        {/* Lid */}
        <div
          className={cn(
            "relative z-20 -mb-1 h-9 w-[150px] rounded-[15px] rounded-b-[7px] bg-gradient-to-b from-rose-400 via-rose-500 to-rose-600 shadow-[0_6px_14px_-4px_rgba(190,24,93,0.6)] ring-1 ring-rose-700/20",
            jarIsFull && "ring-2 ring-amber-300/80 shadow-[0_8px_20px_-4px_rgba(245,158,11,0.6)]"
          )}
        >
          <div className="absolute left-4 top-1.5 h-1.5 w-9 rounded-full bg-white/60" />
          <div className="absolute right-4 bottom-1.5 h-1 w-5 rounded-full bg-black/10" />
          {jarIsFull && (
            <span className="absolute -top-1 -right-2 animate-bob text-base select-none" aria-hidden>
              ✨
            </span>
          )}
        </div>

        {/* Neck */}
        <div className="z-10 h-4 w-[120px] rounded-t-[6px] bg-gradient-to-b from-white/70 to-sky-100/30 ring-1 ring-inset ring-white/60 dark:from-white/20 dark:to-indigo-300/10" />

        {/* Body */}
        <div className="relative h-[260px] w-[218px] overflow-hidden rounded-[46px] rounded-t-[26px] border border-white/70 bg-gradient-to-b from-white/55 via-sky-100/25 to-indigo-100/15 shadow-[inset_0_12px_28px_rgba(255,255,255,0.7),inset_0_-22px_46px_rgba(99,102,241,0.12),0_30px_60px_-20px_rgba(109,87,168,0.6)] backdrop-blur-[3px] dark:border-violet-300/20 dark:from-white/10 dark:via-indigo-500/5 dark:to-violet-900/10 dark:shadow-[inset_0_12px_28px_rgba(255,255,255,0.08),inset_0_-22px_46px_rgba(99,102,241,0.15),0_30px_60px_-20px_rgba(0,0,0,0.5)]">
          {/* Glass highlights */}
          <div className="absolute left-4 top-7 h-[78%] w-6 rounded-full bg-gradient-to-b from-white/75 to-white/0 blur-[2px] dark:from-white/15" />
          <div className="absolute right-7 top-12 h-[52%] w-2 rounded-full bg-white/45 blur-[1px] dark:bg-white/10" />
          <div className="absolute left-1/2 top-2 h-3 w-24 -translate-x-1/2 rounded-full bg-white/40 blur-[2px] dark:bg-white/10" />

          {/* Fullness tint */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-fuchsia-200/20 via-rose-100/10 to-transparent transition-all duration-700 ease-out dark:from-fuchsia-800/25 dark:via-violet-900/10"
            style={{ height: `${Math.min(fullness * 72, 72)}%` }}
          />

          {/* Paper chits with emoji */}
          <div className="absolute inset-x-0 bottom-0 h-[80%]">
            {visible.map((t, i) => {
              const h = hashStr(t.id);
              const rot = (h % 36) - 18;
              const left = 14 + ((h >> 4) % 56);
              const spread = Math.max(20, Math.floor(fullness * 40));
              const bottom = 4 + ((h >> 9) % spread);
              const isNewest = i === 0;
              return (
                <div
                  key={t.id}
                  className="absolute"
                  style={{
                    left: `${left}%`,
                    bottom: `${bottom}%`,
                    transform: `rotate(${rot}deg)`,
                    zIndex: count - i,
                  }}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-[5px] shadow-[0_2px_6px_rgba(0,0,0,0.2)] ring-1 ring-inset ring-black/10 dark:ring-white/20",
                      isNewest && "animate-pop"
                    )}
                    style={{
                      width: 38, /* Larger chits as requested */
                      height: 48,
                      background: t.color,
                      overflow: "hidden",
                    }}
                    aria-hidden
                  >
                    {/* Larger high-contrast pill */}
                    <span className="absolute flex h-[24px] w-[24px] items-center justify-center rounded-full bg-white/95 shadow-[0_1px_4px_rgba(0,0,0,0.2)] dark:bg-[#120a1f] dark:ring-1 dark:ring-white/20" />
                    <span
                      className="relative z-10 select-none leading-none"
                      style={{ 
                        fontSize: "16px", /* Larger emoji size */
                        filter: "contrast(1.25) saturate(1.15)"
                      }}
                    >
                      {tinyEmoji(t.emoji || "💛")}
                    </span>
                    <div className="absolute inset-x-0 top-0.5 h-[3px] bg-black/5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floor shadow */}
          <div
            className={cn(
              "absolute bottom-0 left-1/2 h-5 w-3/4 -translate-x-1/2 rounded-[50%] blur-md transition-all",
              jarIsFull ? "bg-amber-900/20" : "bg-indigo-900/10"
            )}
          />

          {/* Full jar sparkle */}
          {jarIsFull && !shaking && (
            <>
              <span className="animate-sparkle absolute left-5 top-6 text-base select-none" style={{ animationDelay: "0s" }}>✨</span>
              <span className="animate-sparkle absolute right-8 top-14 text-sm select-none" style={{ animationDelay: "0.5s" }}>⭐</span>
              <span className="animate-sparkle absolute left-14 bottom-8 text-base select-none" style={{ animationDelay: "1.1s" }}>💫</span>
            </>
          )}
        </div>

        {/* Hanging tag */}
        <div
          className={cn(
            "absolute -right-1 top-[122px] z-40 rotate-[7deg] transition sm:-right-3",
            jarIsFull && "animate-bob"
          )}
        >
          <div className="absolute -top-4 left-1/2 h-4 w-px -translate-x-1/2 bg-amber-900/25" />
          <div
            className={cn(
              "rounded-lg border bg-amber-50/95 px-2.5 py-1 text-center shadow-[0_6px_14px_-6px_rgba(120,80,30,0.5)] backdrop-blur",
              jarIsFull ? "border-amber-400/70 bg-amber-100" : "border-amber-900/15"
            )}
          >
            <div className="font-hand text-xl leading-none text-amber-800">
              {count === 0 ? "empty" : jarIsFull ? "full ✨" : `${count} n${count === 1 ? "ote" : "otes"}`}
            </div>
            <div className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.15em] text-amber-700/60">
              mood jaar
            </div>
          </div>
        </div>
      </div>

      {/* Ground shadow */}
      <div
        className={cn(
          "mt-3 h-3 w-44 rounded-[50%] blur-md transition-all",
          jarIsFull ? "bg-amber-800/25" : "bg-indigo-900/15"
        )}
      />
    </div>
  );
}
