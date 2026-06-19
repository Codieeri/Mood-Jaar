import { useState } from "react";
import { Background } from "./components/Background";
import { Jar } from "./components/Jar";
import { Composer } from "./components/Composer";
import { ReplyCard, ReplyCardLoading } from "./components/ReplyCard";
import { ThoughtList } from "./components/ThoughtList";
import { ShakeReveal } from "./components/ShakeReveal";
import { ProfileModal } from "./components/ProfileModal";
import { MemoryModal } from "./components/MemoryModal";
import { CelebrationModal } from "./components/CelebrationModal";
import { ThemeToggle } from "./components/ThemeToggle";
import { SLIP_COLORS } from "./data/quotes";
import { makeId, useThoughts } from "./hooks/useThoughts";
import { useProfile } from "./hooks/useProfile";
import { useMemories } from "./hooks/useMemories";
import { useTheme } from "./hooks/useTheme";
import { AI_AVAILABLE, generateReply, generateAppreciation } from "./services/ai";
import type { Thought } from "./types";

const FILL_THRESHOLD = 15;

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export default function App() {
  const { thoughts, addThought, removeThought, clearAll } = useThoughts();
  const { profile, save: saveProfile } = useProfile();
  const {
    memories, addMemory, updateMemory, removeMemory, getRelevant,
    encState, unlock, enableEncryption, disableEncryption,
  } = useMemories();
  const { theme, toggle: toggleTheme } = useTheme();

  const [text, setText] = useState("");
  const [dropping, setDropping] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [reply, setReply] = useState<Thought | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [showProfile, setShowProfile] = useState(false);
  const [showMemories, setShowMemories] = useState(false);

  const [shaking, setShaking] = useState(false);
  const [showShake, setShowShake] = useState(false);
  const [shakeResult, setShakeResult] = useState<Thought | null>(null);

  const [showCelebration, setShowCelebration] = useState(false);
  const [lastCelebratedCount, setLastCelebratedCount] = useState(0);

  const personalized = profile.enabled || memories.length > 0;

  const handleDrop = async () => {
    const value = text.trim();
    if (!value || dropping || thinking) return;

    setText("");
    setReply(null);
    setNotice(null);
    setDropping(true);

    // Retrieve relevant memories for context
    const relevantMemories = getRelevant(value, 6);

    // Start the AI request and the drop animation together.
    const replyPromise = generateReply(value, {
      profile,
      recentThoughts: thoughts,
      memories: relevantMemories,
    });

    await new Promise((r) => window.setTimeout(r, 780));
    setDropping(false);
    if (AI_AVAILABLE) setThinking(true);

    const result = await replyPromise;
    setThinking(false);

    const r = result.reply;
    const thought: Thought = {
      id: makeId(),
      text: value,
      mood: r.mood,
      emoji: r.emoji,
      label: r.label,
      quote: r.quote,
      accent: r.accent,
      soft: r.soft,
      color: SLIP_COLORS[hashStr(value + r.mood) % SLIP_COLORS.length],
      source: result.source,
      createdAt: Date.now(),
    };

    addThought(thought);
    setReply(thought);

    if (AI_AVAILABLE && result.source === "offline") {
      setNotice("Couldn't reach the AI just now — here's a thought from the jar instead.");
    }

    // Trigger celebration if we've crossed a threshold and haven't for this one
    const newCount = thoughts.length + 1;
    const nextThreshold = Math.floor(newCount / FILL_THRESHOLD) * FILL_THRESHOLD;
    if (newCount >= FILL_THRESHOLD && nextThreshold > lastCelebratedCount) {
      setLastCelebratedCount(nextThreshold);
      window.setTimeout(() => setShowCelebration(true), 900);
    }
  };

  const handleShake = () => {
    if (shaking) return;
    if (thoughts.length === 0) {
      setShakeResult(null);
      setShowShake(true);
      return;
    }
    setShaking(true);
    window.setTimeout(() => {
      setShaking(false);
      const pick = thoughts[Math.floor(Math.random() * thoughts.length)];
      setShakeResult(pick);
      setShowShake(true);
    }, 720);
  };

  const handleAnother = () => {
    setShowShake(false);
    window.setTimeout(handleShake, 140);
  };

  const handleCelebrationKeepAdding = () => {
    setShowCelebration(false);
  };

  const handleCelebrationEmpty = async () => {
    // Generate the appreciation and save it as a pinned "milestone" memory, then empty jar.
    const msg = await generateAppreciation(thoughts, profile);
    addMemory({
      kind: "insight",
      title: `Jar milestone · ${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
      content: msg,
      tags: ["milestone", "celebration"],
      importance: 5,
      pinned: true,
      updatedAt: Date.now(),
    });
    clearAll();
    setReply(null);
    setLastCelebratedCount(0);
    setShowCelebration(false);
  };

  const count = thoughts.length;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden px-4 pb-12 pt-8 sm:px-6 sm:pt-10">
      <Background />

      {/* Floating action cluster */}
      <div className="fixed right-4 top-4 z-40 flex flex-col items-end gap-2 sm:right-6 sm:top-6">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <button
          type="button"
          onClick={() => setShowProfile(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/70 px-3.5 py-2 text-xs font-semibold text-violet-600 shadow-sm backdrop-blur transition hover:bg-white dark:border-violet-300/20 dark:bg-violet-950/40 dark:text-violet-200 dark:hover:bg-violet-900/60"
        >
          <span aria-hidden>💛</span>
          <span className="hidden sm:inline">{personalized ? "Your profile" : "Personalize"}</span>
          <span
            className={`h-1.5 w-1.5 rounded-full ${personalized ? "bg-emerald-400" : "bg-slate-300 dark:bg-slate-600"}`}
            aria-hidden
          />
        </button>
        <button
          type="button"
          onClick={() => setShowMemories(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/70 px-3.5 py-2 text-xs font-semibold text-violet-600 shadow-sm backdrop-blur transition hover:bg-white dark:border-violet-300/20 dark:bg-violet-950/40 dark:text-violet-200 dark:hover:bg-violet-900/60"
        >
          <span aria-hidden>🧠</span>
          <span className="hidden sm:inline">Memories ({memories.length})</span>
          <span
            className={`h-1.5 w-1.5 rounded-full ${memories.length > 0 ? "bg-fuchsia-400" : "bg-slate-300 dark:bg-slate-600"}`}
            aria-hidden
          />
        </button>
      </div>

      {/* Header */}
      <header className="mx-auto max-w-5xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-500/80 shadow-sm backdrop-blur dark:border-violet-300/15 dark:bg-violet-950/40 dark:text-violet-300/80">
          <span aria-hidden>🫧</span> a cozy little corner
        </span>
        <h1 className="font-display mt-4 text-5xl font-semibold tracking-tight text-violet-950 sm:text-6xl dark:text-violet-100">
          Mood Jaar <span className="align-middle">🫙</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-violet-700/70 dark:text-violet-300/70">
          Write down whatever's weighing on you, tuck it into the jar, and let a gentle word find
          its way back to you. Give the jar a shake whenever you want to revisit a thought.
        </p>
        {personalized ? (
          <p className="mt-3 text-xs font-medium text-violet-500/80">
            💛 Personalized for {profile.name || "you"} ·{" "}
            <button
              type="button"
              onClick={() => setShowProfile(true)}
              className="font-semibold text-fuchsia-600 hover:underline"
            >
              edit
            </button>
            {" · "}
            <button
              type="button"
              onClick={() => setShowMemories(true)}
              className="font-semibold text-fuchsia-600 hover:underline"
            >
              memories ({memories.length})
            </button>
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setShowProfile(true)}
            className="mt-3 text-xs font-semibold text-fuchsia-600 hover:underline"
          >
            💛 Want replies that truly fit you? Tell the jar about yourself →
          </button>
        )}
      </header>

      {/* Main */}
      <main className="mx-auto mt-9 grid max-w-5xl items-start gap-8 lg:mt-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        {/* Jar column */}
        <section className="flex flex-col items-center gap-6 lg:sticky lg:top-8">
          <Jar thoughts={thoughts} shaking={shaking} dropping={dropping} />
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleShake}
              disabled={shaking}
              className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-rose-400 via-fuchsia-500 to-violet-500 px-7 py-3.5 text-base font-bold text-white shadow-[0_18px_36px_-12px_rgba(192,38,211,0.7)] transition-all hover:scale-[1.05] hover:shadow-[0_22px_44px_-12px_rgba(192,38,211,0.85)] active:scale-95 disabled:cursor-default disabled:opacity-90"
            >
              <span className={shaking ? "" : "transition-transform group-hover:-rotate-12"} aria-hidden>
                🫙
              </span>
              Shake My Jar
            </button>
            <p className="text-sm text-violet-500/70 dark:text-violet-300/60">
              {count === 0
                ? "Your jar is empty for now."
                : `${count} ${count === 1 ? "thought" : "thoughts"} tucked safely inside`}
            </p>
          </div>
        </section>

        {/* Interaction column */}
        <section className="flex flex-col gap-6">
          <Composer
            text={text}
            setText={setText}
            onDrop={handleDrop}
            dropping={dropping || thinking}
          />

          {thinking ? (
            <ReplyCardLoading />
          ) : reply ? (
            <div className="space-y-2">
              <ReplyCard reply={reply} source={reply.source} />
              {notice && <p className="px-2 text-xs text-violet-400/80">{notice}</p>}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-violet-300/50 bg-white/25 px-6 py-7 text-center backdrop-blur dark:border-violet-300/15 dark:bg-violet-950/30">
              <div className="text-2xl" aria-hidden>
                💌
              </div>
              <p className="mt-2 text-sm text-violet-500/80 dark:text-violet-300/70">
                Drop a thought above and a kind word will float gently back to you here.
              </p>
            </div>
          )}

          <ThoughtList
            thoughts={thoughts}
            onRemove={removeThought}
            onClear={() => {
              if (window.confirm("Empty the whole jar? This can't be undone.")) {
                clearAll();
                setReply(null);
              }
            }}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="mx-auto mt-12 max-w-5xl text-center text-xs text-violet-400/70 dark:text-violet-400/60">
        Your jar and memories stay private on this device. Memories are encrypted and locked with
        your passphrase. AI replies use your current thought, profile, and saved memories to feel
        more personal. 💜
      </footer>

      {showShake && (
        <ShakeReveal
          thought={shakeResult}
          onClose={() => setShowShake(false)}
          onAnother={handleAnother}
        />
      )}

      {showProfile && (
        <ProfileModal
          initial={profile}
          aiAvailable={AI_AVAILABLE}
          onClose={() => setShowProfile(false)}
          onSave={(p) => {
            saveProfile(p);
            setShowProfile(false);
          }}
        />
      )}

      {showMemories && (
        <MemoryModal
          memories={memories}
          encState={encState}
          onAdd={addMemory}
          onUpdate={updateMemory}
          onRemove={removeMemory}
          onUnlock={unlock}
          onEnableEnc={enableEncryption}
          onDisableEnc={disableEncryption}
          onClose={() => setShowMemories(false)}
        />
      )}

      {showCelebration && (
        <CelebrationModal
          thoughts={thoughts}
          aiAvailable={AI_AVAILABLE}
          onClose={() => setShowCelebration(false)}
          onEmptyAndKeep={handleCelebrationEmpty}
          onKeepAdding={handleCelebrationKeepAdding}
          generateAppreciation={(ts) => generateAppreciation(ts, profile)}
        />
      )}
    </div>
  );
}
