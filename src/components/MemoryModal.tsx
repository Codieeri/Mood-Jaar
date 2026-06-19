import { useEffect, useState } from "react";
import type { Memory, MemoryKind } from "../types";
import type { EncryptionState } from "../hooks/useMemories";
import { cn } from "../utils/cn";

interface MemoryModalProps {
  memories: Memory[];
  encState: EncryptionState;
  onAdd: (m: Omit<Memory, "id" | "createdAt">) => void;
  onUpdate: (id: string, patch: Partial<Memory>) => void;
  onRemove: (id: string) => void;
  onUnlock: (pass: string) => Promise<boolean>;
  onEnableEnc: (pass: string) => Promise<void>;
  onDisableEnc: () => Promise<void>;
  onClose: () => void;
}

const KINDS: { kind: MemoryKind; label: string; emoji: string; color: string }[] = [
  { kind: "event",      label: "Life event",  emoji: "📅", color: "#dbeafe" },
  { kind: "journal",    label: "Journal",      emoji: "📝", color: "#fce7f3" },
  { kind: "concern",    label: "Concern",      emoji: "💭", color: "#ede9fe" },
  { kind: "insight",    label: "Insight",      emoji: "💡", color: "#fef9c3" },
  { kind: "goal",       label: "Goal / hope",  emoji: "🌱", color: "#dcfce7" },
  { kind: "preference", label: "Preference",   emoji: "⚙️", color: "#f1f5f9" },
];

function kindMeta(kind: MemoryKind) {
  return KINDS.find((k) => k.kind === kind) ?? KINDS[0];
}

function timeLabel(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// ─── Star rating ───

function Stars({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: "sm" | "md";
}) {
  const s = size === "sm" ? "text-sm" : "text-lg";
  return (
    <div className={cn("inline-flex gap-0.5", s)} role="group" aria-label="Importance rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          disabled={!onChange}
          aria-label={`${n} star`}
          className={cn(
            "transition",
            onChange ? "cursor-pointer hover:scale-125" : "cursor-default",
            n <= value ? "opacity-100" : "opacity-25"
          )}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ─── Tag input ───

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState("");

  const add = () => {
    const val = input.trim().toLowerCase().slice(0, 24);
    if (val && !tags.includes(val) && tags.length < 8) {
      onChange([...tags, val]);
    }
    setInput("");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700"
          >
            #{t}
            <button
              type="button"
              onClick={() => onChange(tags.filter((x) => x !== t))}
              className="ml-0.5 text-violet-400 hover:text-rose-500"
              aria-label={`Remove tag ${t}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z0-9-_ ]/g, "").slice(0, 24))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add a tag and press Enter"
          className="w-full rounded-xl border border-white/80 bg-white/70 px-3 py-1.5 text-xs text-violet-950 placeholder:text-violet-400/60 shadow-inner outline-none transition focus:border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-200/50"
        />
      </div>
    </div>
  );
}

// ─── Main component ───

type Tab = "memories" | "encryption";

export function MemoryModal({
  memories,
  encState,
  onAdd,
  onUpdate,
  onRemove,
  onUnlock,
  onEnableEnc,
  onDisableEnc,
  onClose,
}: MemoryModalProps) {
  const [tab, setTab] = useState<Tab>("memories");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterKind, setFilterKind] = useState<MemoryKind | "all">("all");

  // Form state
  const [fKind, setFKind] = useState<MemoryKind>("event");
  const [fTitle, setFTitle] = useState("");
  const [fContent, setFContent] = useState("");
  const [fImportance, setFImportance] = useState(3);
  const [fPinned, setFPinned] = useState(false);
  const [fTags, setFTags] = useState<string[]>([]);

  // Encryption tab state
  const [pass, setPass] = useState("");
  const [passConfirm, setPassConfirm] = useState("");
  const [encError, setEncError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // View-lock state: always requires passphrase when modal is opened
  // Even if storage encryption is off, we gate viewing with a passphrase.
  const [viewUnlocked, setViewUnlocked] = useState(false);
  const [setupMode, setSetupMode] = useState(!encState.enabled);

  useEffect(() => {
    // Reset view-lock every time the modal opens
    setViewUnlocked(false);
    setSetupMode(!encState.enabled);
    setPass("");
    setPassConfirm("");
    setEncError("");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const resetForm = () => {
    setFKind("event");
    setFTitle("");
    setFContent("");
    setFImportance(3);
    setFPinned(false);
    setFTags([]);
    setShowForm(false);
    setEditingId(null);
  };

  const openEdit = (m: Memory) => {
    setFKind(m.kind);
    setFTitle(m.title);
    setFContent(m.content);
    setFImportance(m.importance);
    setFPinned(m.pinned);
    setFTags(m.tags);
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!fContent.trim()) return;
    const data = {
      kind: fKind,
      title: fTitle.trim(),
      content: fContent.trim(),
      importance: fImportance,
      pinned: fPinned,
      tags: fTags,
      updatedAt: Date.now(),
    };
    if (editingId) {
      onUpdate(editingId, data);
    } else {
      onAdd({ ...data, sourceThoughtId: undefined });
    }
    resetForm();
  };

  const handleUnlock = async () => {
    setEncError("");
    const ok = await onUnlock(pass);
    if (ok) {
      setViewUnlocked(true);
      setPass("");
    } else {
      setEncError("Wrong passphrase. Try again.");
    }
  };

  const handleSetupAndUnlock = async () => {
    setEncError("");
    if (pass.length < 4) {
      setEncError("Passphrase must be at least 4 characters.");
      return;
    }
    if (pass !== passConfirm) {
      setEncError("Passphrases don't match.");
      return;
    }
    await onEnableEnc(pass);
    setViewUnlocked(true);
    setSetupMode(false);
    setPass("");
    setPassConfirm("");
  };

  const handleEnableEnc = async () => {
    setEncError("");
    if (pass.length < 4) {
      setEncError("Passphrase must be at least 4 characters.");
      return;
    }
    if (pass !== passConfirm) {
      setEncError("Passphrases don't match.");
      return;
    }
    await onEnableEnc(pass);
    setPass("");
    setPassConfirm("");
  };

  // Filtering
  const filtered = memories.filter((m) => {
    if (filterKind !== "all" && m.kind !== filterKind) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q) ||
        m.tags.some((t) => t.includes(q))
      );
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });

  // ─── View-lock screen (always shown first) ───
  if (!viewUnlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-violet-950/40 backdrop-blur-sm" onClick={onClose} />
        <div className="animate-pop relative w-full max-w-md rounded-[30px] border border-white/70 bg-white/90 p-8 text-center shadow-[0_40px_80px_-30px_rgba(76,29,149,0.55)] backdrop-blur-xl dark:border-violet-300/30 dark:bg-[#251b39] dark:text-violet-100">
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-200 via-violet-200 to-indigo-200 blur-lg" />
            <span className="relative text-4xl" aria-hidden>🔐</span>
          </div>
          <h3 className="font-display mt-4 text-2xl font-semibold text-violet-950/90 dark:text-violet-100">
            {setupMode ? "Lock your memories" : "Memories are locked"}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-violet-600/80">
            {setupMode
              ? "Create a passphrase to encrypt and lock your memories. You'll need it every time you open this jar."
              : "Your memories are encrypted. Enter your passphrase to view them."}
          </p>

          {setupMode ? (
            <>
              <input
                type={showPass ? "text" : "password"}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Create passphrase (min 4 chars)"
                autoFocus
                className="mt-5 w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm text-violet-950 placeholder:text-violet-400/60 shadow-inner outline-none transition focus:border-fuchsia-300 focus:ring-4 focus:ring-fuchsia-200/50"
              />
              <input
                type={showPass ? "text" : "password"}
                value={passConfirm}
                onChange={(e) => setPassConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSetupAndUnlock()}
                placeholder="Confirm passphrase"
                className="mt-2 w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm text-violet-950 placeholder:text-violet-400/60 shadow-inner outline-none transition focus:border-fuchsia-300 focus:ring-4 focus:ring-fuchsia-200/50"
              />
              <label className="mt-2 flex items-center justify-center gap-2 text-xs text-violet-500/80">
                <input type="checkbox" checked={showPass} onChange={(e) => setShowPass(e.target.checked)} />
                Show passphrase
              </label>
            </>
          ) : (
            <input
              type={showPass ? "text" : "password"}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              placeholder="Your passphrase"
              autoFocus
              className="mt-5 w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm text-violet-950 placeholder:text-violet-400/60 shadow-inner outline-none transition focus:border-fuchsia-300 focus:ring-4 focus:ring-fuchsia-200/50"
            />
          )}

          {encError && <p className="mt-2 text-xs font-medium text-rose-500">{encError}</p>}

          {setupMode && (
            <div className="mt-3 rounded-xl border border-amber-200/70 bg-amber-50/70 p-3 text-left text-[11px] leading-relaxed text-amber-800/90">
              ⚠️ <strong>Remember your passphrase!</strong> Without it, your memories cannot be read. There's no reset option.
            </div>
          )}

          <div className="mt-5 flex justify-center gap-3">
            <button type="button" onClick={onClose} className="rounded-full border border-violet-200 bg-white/70 px-5 py-2.5 text-sm font-semibold text-violet-600 transition hover:bg-white">
              Cancel
            </button>
            <button
              type="button"
              onClick={setupMode ? handleSetupAndUnlock : handleUnlock}
              disabled={setupMode ? pass.length < 4 : !pass}
              className="rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-400/40 transition hover:scale-[1.04] active:scale-95 disabled:opacity-50"
            >
              {setupMode ? "Lock & enter" : "Unlock"}
            </button>
          </div>

          {!setupMode && (
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="mt-3 text-xs font-medium text-violet-500/70 hover:text-violet-700"
            >
              {showPass ? "Hide passphrase" : "Show passphrase"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-violet-950/30 backdrop-blur-sm" onClick={onClose} />

      <div className="animate-pop relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[30px] border border-white/70 bg-white/88 shadow-[0_40px_80px_-30px_rgba(76,29,149,0.55)] backdrop-blur-xl dark:border-violet-300/25 dark:bg-[#1f162f] dark:text-violet-100 font-medium">
        {/* ── Header ── */}
        <div className="flex-none border-b border-violet-100/60 p-6 pb-4">
          <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded-full p-1.5 text-violet-400/70 transition hover:bg-violet-100 hover:text-violet-600">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-400 to-violet-500 text-base shadow-sm">🧠</span>
            <h2 className="font-display text-2xl font-semibold text-violet-950/90">Memory Jar</h2>
            <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              🔒 Encrypted
            </span>
            <button
              type="button"
              onClick={() => {
                setViewUnlocked(false);
                setPass("");
              }}
              title="Re-lock view"
              className="ml-auto flex items-center gap-1 rounded-full border border-violet-200 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-violet-600 transition hover:bg-violet-50"
            >
              🔒 Re-lock
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-1 rounded-full bg-violet-100/50 p-1 dark:bg-violet-950/60">
            {([["memories", "🗂️ Memories"], ["encryption", "🔒 Encryption"]] as const).map(([t, label]) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  tab === t
                    ? "bg-white text-violet-700 shadow-sm dark:bg-violet-800 dark:text-violet-100"
                    : "text-violet-500/70 hover:text-violet-700 dark:text-violet-300/70 dark:hover:text-violet-100"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {tab === "memories" ? (
            <>
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => { resetForm(); setShowForm(true); }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-400/40 transition hover:scale-[1.04] active:scale-95"
                >
                  ＋ Add memory
                </button>
                <div className="flex-1" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-36 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-xs text-violet-950 placeholder:text-violet-400/60 shadow-inner outline-none transition focus:border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-200/50 sm:w-44 dark:border-violet-300/10 dark:bg-violet-950/50 dark:text-violet-100 dark:placeholder:text-violet-500"
                />
              </div>

              {/* Kind filters */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setFilterKind("all")}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-medium transition",
                    filterKind === "all"
                      ? "bg-violet-600 text-white shadow-sm"
                      : "bg-white/60 text-violet-500 hover:bg-white"
                  )}
                >
                  All ({memories.length})
                </button>
                {KINDS.map((k) => {
                  const c = memories.filter((m) => m.kind === k.kind).length;
                  if (c === 0 && filterKind !== k.kind) return null;
                  return (
                    <button
                      key={k.kind}
                      type="button"
                      onClick={() => setFilterKind(filterKind === k.kind ? "all" : k.kind)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-medium transition",
                        filterKind === k.kind
                          ? "bg-violet-600 text-white shadow-sm"
                          : "bg-white/60 text-violet-500 hover:bg-white"
                      )}
                    >
                      {k.emoji} {k.label} ({c})
                    </button>
                  );
                })}
              </div>

              {/* ── Add / Edit form ── */}
              {showForm && (
                <div className="mt-4 rounded-2xl border border-violet-200/60 bg-gradient-to-b from-violet-50/80 to-white/80 p-5 dark:border-violet-400/20 dark:from-violet-900/30 dark:to-violet-950/30">
                  <h3 className="text-sm font-semibold text-violet-950/80 dark:text-violet-100">
                    {editingId ? "Edit memory" : "New memory"}
                  </h3>

                  {/* Kind chips */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {KINDS.map((k) => (
                      <button
                        key={k.kind}
                        type="button"
                        onClick={() => setFKind(k.kind)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs font-medium transition",
                          fKind === k.kind
                            ? "border-violet-400 bg-violet-100 text-violet-700 ring-1 ring-violet-300 dark:border-violet-400 dark:bg-violet-900 dark:text-violet-100"
                            : "border-white/80 bg-white/60 text-violet-500 hover:bg-white dark:border-violet-300/10 dark:bg-violet-950/40 dark:text-violet-400"
                        )}
                      >
                        {k.emoji} {k.label}
                      </button>
                    ))}
                  </div>

                  {/* Title */}
                  <input
                    value={fTitle}
                    onChange={(e) => setFTitle(e.target.value.slice(0, 80))}
                    placeholder="Short headline (optional)"
                    className="mt-3 w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-2.5 text-sm font-medium text-violet-950 placeholder:text-violet-400/60 shadow-inner outline-none transition focus:border-fuchsia-300 focus:ring-4 focus:ring-fuchsia-200/50 dark:border-violet-300/10 dark:bg-violet-950/50 dark:text-violet-100 dark:placeholder:text-violet-500"
                  />

                  {/* Content */}
                  <textarea
                    value={fContent}
                    onChange={(e) => setFContent(e.target.value.slice(0, 800))}
                    rows={4}
                    placeholder="What do you want the jar to remember? e.g. I've been on bed rest after an accident for 3 weeks now..."
                    className="mt-2 w-full resize-none rounded-2xl border border-white/80 bg-white/70 px-4 py-2.5 text-sm text-violet-950 placeholder:text-violet-400/60 shadow-inner outline-none transition focus:border-fuchsia-300 focus:ring-4 focus:ring-fuchsia-200/50 dark:border-violet-300/10 dark:bg-violet-950/50 dark:text-violet-100 dark:placeholder:text-violet-500"
                  />
                  <p className="mt-1 text-right text-[10px] text-violet-400/60">
                    {fContent.length}/800
                  </p>

                  {/* Stars + Pin */}
                  <div className="mt-2 flex items-center gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-500/70">Importance</p>
                      <Stars value={fImportance} onChange={setFImportance} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFPinned(!fPinned)}
                      className={cn(
                        "mt-3 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition",
                        fPinned
                          ? "border-amber-300 bg-amber-50 text-amber-700"
                          : "border-white/80 bg-white/60 text-violet-500 hover:bg-white"
                      )}
                    >
                      📌 {fPinned ? "Pinned" : "Pin"}
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="mt-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-500/70 mb-1">Tags</p>
                    <TagInput tags={fTags} onChange={setFTags} />
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex justify-end gap-2">
                    <button type="button" onClick={resetForm} className="rounded-full border border-violet-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-violet-600 transition hover:bg-white">
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={!fContent.trim()}
                      className="rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-5 py-1.5 text-sm font-semibold text-white shadow-lg shadow-violet-400/40 transition hover:scale-[1.04] active:scale-95 disabled:opacity-50"
                    >
                      {editingId ? "Update" : "Save"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Memory list ── */}
              {sorted.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-violet-300/50 bg-white/30 py-10 text-center dark:border-violet-300/20 dark:bg-violet-950/30">
                  <div className="text-3xl" aria-hidden>🧠</div>
                  <p className="mt-2 text-sm text-violet-500/80 dark:text-violet-300/70">
                    {memories.length === 0
                      ? "No memories yet. Add important life events, concerns, or goals so the jar can truly know you."
                      : "No memories match your search."}
                  </p>
                </div>
              ) : (
                <ul className="mt-4 space-y-2">
                  {sorted.map((m) => {
                    const meta = kindMeta(m.kind);
                    return (
<li
                         key={m.id}
                         className="group rounded-2xl border border-white/70 bg-white/70 p-4 transition hover:bg-white hover:shadow-sm dark:border-violet-300/20 dark:bg-[#2c213e] dark:hover:bg-[#372a4d] dark:text-violet-100"
                       >
                        <div className="flex items-start gap-3">
                          <span
                            className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-xl text-sm"
                            style={{ background: meta.color }}
                          >
                            {meta.emoji}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              {m.title && (
                                <h4 className="text-sm font-semibold text-violet-950/85">{m.title}</h4>
                              )}
                              {m.pinned && <span className="text-xs" title="Pinned">📌</span>}
                              <span className="rounded-full bg-violet-100/70 px-2 py-0.5 text-[10px] font-medium text-violet-500">
                                {meta.label}
                              </span>
                              <span className="rounded-full bg-emerald-100/70 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700" title="Stored encrypted">
                                🔒
                              </span>
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-violet-900/75 dark:text-violet-100/90 font-semibold dark:font-medium">{m.content}</p>
                            {m.tags.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {m.tags.map((t) => (
                                  <span key={t} className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-500">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="mt-2 flex items-center gap-3">
                              <Stars value={m.importance} size="sm" />
                              <span className="text-[10px] text-violet-400/60">{timeLabel(m.updatedAt)}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-none flex-col gap-1 opacity-0 transition group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => onUpdate(m.id, { pinned: !m.pinned })}
                              title={m.pinned ? "Unpin" : "Pin"}
                              className="rounded-lg p-1.5 text-xs text-violet-400 hover:bg-amber-50 hover:text-amber-600"
                            >
                              📌
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(m)}
                              title="Edit"
                              className="rounded-lg p-1.5 text-xs text-violet-400 hover:bg-violet-100 hover:text-violet-600"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemove(m.id)}
                              title="Delete"
                              className="rounded-lg p-1.5 text-xs text-violet-400 hover:bg-rose-50 hover:text-rose-500"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          ) : (
            /* ── Encryption tab ── */
            <div className="space-y-5">
              <div className="rounded-2xl border border-violet-200/60 bg-gradient-to-b from-violet-50/80 to-white/80 p-5 dark:border-violet-400/20 dark:from-violet-900/40 dark:to-violet-950/40">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-violet-950/85 dark:text-violet-100">
                  🔒 End-to-end encryption
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-violet-600/80 dark:text-violet-300/90">
                  Your memories are stored on this device. Encryption adds AES-256-GCM protection
                  with a passphrase only you know — even if someone accesses your browser storage,
                  they can't read your memories.
                </p>

                {!encState.supported && (
                  <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                    ⚠️ Your browser doesn't support the Web Crypto API. Encryption isn't available here.
                  </div>
                )}
              </div>

              {encState.supported && (
                <div className="rounded-2xl border border-violet-200/60 bg-white/70 p-5">
                  {encState.enabled ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-sm">🔒</span>
                        <div>
                          <p className="text-sm font-semibold text-emerald-700">Encryption is ON</p>
                          <p className="text-[11px] text-violet-500/70">Your memories are encrypted with AES-256-GCM</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onDisableEnc}
                        className="mt-4 rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        Disable encryption
                      </button>
                      <p className="mt-1.5 text-[10px] text-violet-400/60">
                        This will store your memories unencrypted. You won't need a passphrase anymore.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-sm">🔓</span>
                        <div>
                          <p className="text-sm font-semibold text-violet-900/80">Encryption is OFF</p>
                          <p className="text-[11px] text-violet-500/70">Your memories are stored as plain text</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="relative">
                          <input
                            type={showPass ? "text" : "password"}
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                            placeholder="Create a passphrase (min 4 chars)"
                            className="w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-2.5 pr-14 text-sm text-violet-950 placeholder:text-violet-400/60 shadow-inner outline-none transition focus:border-fuchsia-300 focus:ring-4 focus:ring-fuchsia-200/50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-0.5 text-xs font-medium text-violet-500 hover:bg-violet-100"
                          >
                            {showPass ? "Hide" : "Show"}
                          </button>
                        </div>
                        <input
                          type={showPass ? "text" : "password"}
                          value={passConfirm}
                          onChange={(e) => setPassConfirm(e.target.value)}
                          placeholder="Confirm passphrase"
                          className="w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-2.5 text-sm text-violet-950 placeholder:text-violet-400/60 shadow-inner outline-none transition focus:border-fuchsia-300 focus:ring-4 focus:ring-fuchsia-200/50"
                        />
                      </div>

                      {encError && <p className="mt-2 text-xs font-medium text-rose-500">{encError}</p>}

                      <button
                        type="button"
                        onClick={handleEnableEnc}
                        disabled={pass.length < 4}
                        className="mt-3 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-400/40 transition hover:scale-[1.04] active:scale-95 disabled:opacity-50"
                      >
                        Enable encryption
                      </button>

                      <div className="mt-3 rounded-xl border border-amber-200/70 bg-amber-50/70 p-3 text-[11px] leading-relaxed text-amber-800/90">
                        ⚠️ <strong>Remember your passphrase!</strong> If you forget it, your encrypted
                        memories cannot be recovered. There is no reset option.
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* How it works */}
              <div className="rounded-2xl border border-violet-200/60 bg-white/50 p-5">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-violet-500/80">How it works</h4>
                <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-violet-600/80">
                  <li className="flex gap-2"><span className="flex-none">🔑</span> Your passphrase is stretched with PBKDF2 (100,000 iterations)</li>
                  <li className="flex gap-2"><span className="flex-none">🛡️</span> Memories are encrypted with AES-256-GCM</li>
                  <li className="flex gap-2"><span className="flex-none">💾</span> Only encrypted data is saved to localStorage</li>
                  <li className="flex gap-2"><span className="flex-none">🚫</span> Your passphrase is never stored — only you know it</li>
                  <li className="flex gap-2"><span className="flex-none">🌐</span> Nothing leaves your device. No server, no cloud</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
