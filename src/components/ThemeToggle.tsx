import type { Theme } from "../hooks/useTheme";
import { cn } from "../utils/cn";

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
  className?: string;
}

export function ThemeToggle({ theme, onToggle, className }: ThemeToggleProps) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "group relative inline-flex h-9 w-[68px] items-center rounded-full border p-1 shadow-sm backdrop-blur transition-all duration-300",
        isDark
          ? "border-violet-400/25 bg-violet-950/60 shadow-violet-900/40"
          : "border-white/70 bg-white/70 shadow-violet-200/40",
        className
      )}
    >
      {/* Track background */}
      <span
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-300",
          isDark
            ? "bg-gradient-to-r from-indigo-950 to-violet-900"
            : "bg-gradient-to-r from-amber-100/80 to-sky-100/80"
        )}
      />

      {/* Sliding knob */}
      <span
        className={cn(
          "relative z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-md transition-all duration-300",
          isDark
            ? "translate-x-[31px] bg-violet-800 shadow-violet-950/50"
            : "translate-x-0 bg-white shadow-amber-200/60"
        )}
      >
        <span className="text-sm select-none transition-transform duration-300" aria-hidden>
          {isDark ? "🌙" : "☀️"}
        </span>
      </span>

      {/* Tiny stars that show in dark mode */}
      <span
        className={cn(
          "absolute left-2.5 top-1.5 text-[7px] transition-opacity duration-300 select-none",
          isDark ? "opacity-60" : "opacity-0"
        )}
        aria-hidden
      >
        ✦
      </span>
      <span
        className={cn(
          "absolute left-4 bottom-1.5 text-[5px] transition-opacity duration-300 select-none",
          isDark ? "opacity-40" : "opacity-0"
        )}
        aria-hidden
      >
        ✦
      </span>
    </button>
  );
}
