import { useEffect, useState } from "react";
import { EMPTY_PROFILE, type Profile } from "../types";
import { cn } from "../utils/cn";

interface ProfileModalProps {
  initial: Profile;
  aiAvailable: boolean;
  onClose: () => void;
  onSave: (p: Profile) => void;
}

const AGE_RANGES = ["Under 18", "18–24", "25–34", "35–44", "45+", "Prefer not to say"];

export function ProfileModal({ initial, aiAvailable, onClose, onSave }: ProfileModalProps) {
  const [p, setP] = useState<Profile>(initial);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setP((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    const hasAnything =
      p.name || p.ageRange || p.happiness.trim() || p.struggles.trim() || p.support.trim();
    onSave({ ...p, enabled: !!hasAnything });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-violet-950/30 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="animate-pop relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[30px] border border-white/70 bg-white/85 p-7 shadow-[0_40px_80px_-30px_rgba(76,29,149,0.55)] backdrop-blur-xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-violet-400/70 transition hover:bg-violet-100 hover:text-violet-600"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-400 to-violet-500 text-base shadow-sm">
            💛
          </span>
          <h2 className="font-display text-2xl font-semibold text-violet-950/90">Personalize your jar</h2>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-violet-600/80">
          Tell the jar a little about you. For deeper personalization, use the memories section to
          add important life events, recurring concerns, or anything you'd like the jar to remember.
        </p>

        {!aiAvailable && (
          <div className="mt-3 rounded-2xl border border-amber-200/70 bg-amber-50/70 p-3 text-[11px] leading-relaxed text-amber-800/90">
            ✨ Personalized AI replies aren't switched on for this site yet. Your details are still
            saved, and the jar will use them as soon as AI is enabled.
          </div>
        )}

        <div className="mt-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-violet-500/80">
              What should the jar call you?
            </label>
            <input
              value={p.name}
              onChange={(e) => set("name", e.target.value.slice(0, 40))}
              placeholder="Your name or a nickname"
              className="mt-1.5 w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-2.5 text-sm text-violet-950 placeholder:text-violet-400/60 shadow-inner outline-none transition focus:border-fuchsia-300 focus:ring-4 focus:ring-fuchsia-200/50"
            />
          </div>

          {/* Age range */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-violet-500/80">
              Age range
            </label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {AGE_RANGES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => set("ageRange", p.ageRange === a ? "" : a)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    p.ageRange === a
                      ? "border-violet-400 bg-violet-100 text-violet-700 ring-2 ring-violet-200"
                      : "border-white/80 bg-white/60 text-violet-500 hover:bg-white"
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Happiness */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-violet-500/80">
              What brings you joy or comfort? 🌸
            </label>
            <textarea
              value={p.happiness}
              onChange={(e) => set("happiness", e.target.value.slice(0, 400))}
              rows={2}
              placeholder="e.g. long walks, my dog, music, painting, my little sister…"
              className="mt-1.5 w-full resize-none rounded-2xl border border-white/80 bg-white/70 px-4 py-2.5 text-sm text-violet-950 placeholder:text-violet-400/60 shadow-inner outline-none transition focus:border-fuchsia-300 focus:ring-4 focus:ring-fuchsia-200/50"
            />
          </div>

          {/* Struggles */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-violet-500/80">
              What weighs on you? Struggles or past hurts 🤍
            </label>
            <textarea
              value={p.struggles}
              onChange={(e) => set("struggles", e.target.value.slice(0, 600))}
              rows={3}
              placeholder="Anything you're carrying — anxiety, a loss, a hard relationship, burnout… Share only what you're comfortable with."
              className="mt-1.5 w-full resize-none rounded-2xl border border-white/80 bg-white/70 px-4 py-2.5 text-sm text-violet-950 placeholder:text-violet-400/60 shadow-inner outline-none transition focus:border-fuchsia-300 focus:ring-4 focus:ring-fuchsia-200/50"
            />
          </div>

          {/* Support style */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-violet-500/80">
              How do you like to be supported?
            </label>
            <textarea
              value={p.support}
              onChange={(e) => set("support", e.target.value.slice(0, 300))}
              rows={2}
              placeholder="e.g. gentle reassurance, a little tough love, practical tips, just being heard…"
              className="mt-1.5 w-full resize-none rounded-2xl border border-white/80 bg-white/70 px-4 py-2.5 text-sm text-violet-950 placeholder:text-violet-400/60 shadow-inner outline-none transition focus:border-fuchsia-300 focus:ring-4 focus:ring-fuchsia-200/50"
            />
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-violet-200/60 bg-violet-50/50 p-3 text-[11px] leading-relaxed text-violet-600/80">
          🔒 This stays private on your device. When AI is on, your profile, current thought, and a
          few recent jar notes may be shared with Gemini to make replies feel more connected.
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setP(EMPTY_PROFILE);
              onSave(EMPTY_PROFILE);
            }}
            className="rounded-full px-4 py-2 text-sm font-medium text-violet-500 transition hover:bg-violet-100"
          >
            Clear details
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-violet-200 bg-white/70 px-5 py-2.5 text-sm font-semibold text-violet-600 transition hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-400/40 transition hover:scale-[1.04] active:scale-95"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
