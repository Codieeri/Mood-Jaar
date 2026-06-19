import { useCallback, useEffect, useRef, useState } from "react";
import type { Memory } from "../types";
import { makeId } from "./useThoughts";
import {
  cryptoAvailable,
  createProbe,
  decrypt,
  encrypt,
  loadEncMeta,
  saveEncMeta,
  verifyProbe,
} from "../utils/encryption";

const STORAGE_KEY = "moodjaar.memories.v2";
const MAX_MEMORIES = 500;

// ─── Relevance scoring ───

const STOPWORDS = new Set([
  "the","a","an","is","are","was","were","be","been","being",
  "have","has","had","do","does","did","will","would","could",
  "should","may","might","must","of","to","in","for","on","with",
  "at","by","from","and","or","but","if","then","this","that",
  "it","its","as","not","no","so","very","just","i","me","my",
  "you","your","we","us","they","them","he","she","what","which",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && w.length > 1 && !STOPWORDS.has(w));
}

function scoreMemory(memory: Memory, query: string): number {
  const qTokens = new Set(tokenize(query));
  const mTokens = new Set([...tokenize(memory.content), ...tokenize(memory.title), ...memory.tags.flatMap(t => tokenize(t))]);
  let matches = 0;
  for (const t of qTokens) {
    if (mTokens.has(t)) matches++;
  }
  const daysOld = (Date.now() - memory.createdAt) / (1000 * 60 * 60 * 24);
  const recencyBoost = Math.max(0, 1 - daysOld / 60);
  const pinnedBoost = memory.pinned ? 2 : 0;
  return matches * (0.5 + 0.5 * memory.importance) + recencyBoost * 0.3 + pinnedBoost;
}

// ─── Storage helpers ───

function validate(m: unknown): m is Memory {
  if (!m || typeof m !== "object") return false;
  const o = m as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.kind === "string" &&
    typeof o.content === "string" &&
    typeof o.importance === "number"
  );
}

async function loadRaw(passphrase?: string): Promise<Memory[]> {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    // If encrypted, decrypt first
    if (passphrase && raw.startsWith("ENC:")) {
      raw = await decrypt(raw.slice(4), passphrase);
    } else if (raw.startsWith("ENC:")) {
      return []; // encrypted but no passphrase yet
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // backfill new fields for old data
    return parsed.filter(validate).map((m) => ({
      ...m,
      title: m.title ?? "",
      pinned: m.pinned ?? false,
      updatedAt: m.updatedAt ?? m.createdAt,
    }));
  } catch {
    return [];
  }
}

async function saveRaw(memories: Memory[], passphrase?: string) {
  try {
    const json = JSON.stringify(memories);
    if (passphrase) {
      const ct = await encrypt(json, passphrase);
      localStorage.setItem(STORAGE_KEY, "ENC:" + ct);
    } else {
      localStorage.setItem(STORAGE_KEY, json);
    }
  } catch {
    /* ignore quota errors */
  }
}

// ─── Hook ───

export interface EncryptionState {
  supported: boolean;
  enabled: boolean;
  unlocked: boolean;
}

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loaded, setLoaded] = useState(false);
  const passRef = useRef<string | undefined>(undefined);
  const [encState, setEncState] = useState<EncryptionState>({
    supported: cryptoAvailable(),
    enabled: loadEncMeta().enabled,
    unlocked: false,
  });

  // Initial load
  useEffect(() => {
    const meta = loadEncMeta();
    if (meta.enabled) {
      // needs unlock; stay empty until passphrase is provided
      setEncState({ supported: cryptoAvailable(), enabled: true, unlocked: false });
      setLoaded(true);
    } else {
      loadRaw().then((mems) => {
        setMemories(mems);
        setEncState({ supported: cryptoAvailable(), enabled: false, unlocked: true });
        setLoaded(true);
      });
    }
  }, []);

  // Auto-save when memories change
  useEffect(() => {
    if (!loaded) return;
    saveRaw(memories, passRef.current);
  }, [memories, loaded]);

  // ─── Encryption actions ───

  const unlock = useCallback(async (passphrase: string): Promise<boolean> => {
    const meta = loadEncMeta();
    if (meta.probe) {
      const ok = await verifyProbe(meta.probe, passphrase);
      if (!ok) return false;
    }
    passRef.current = passphrase;
    const mems = await loadRaw(passphrase);
    setMemories(mems);
    setEncState((s) => ({ ...s, unlocked: true }));
    return true;
  }, []);

  const enableEncryption = useCallback(async (passphrase: string) => {
    passRef.current = passphrase;
    const probe = await createProbe(passphrase);
    saveEncMeta({ enabled: true, probe });
    await saveRaw(memories, passphrase);
    setEncState((s) => ({ ...s, enabled: true, unlocked: true }));
  }, [memories]);

  const disableEncryption = useCallback(async () => {
    passRef.current = undefined;
    saveEncMeta({ enabled: false });
    await saveRaw(memories, undefined);
    setEncState((s) => ({ ...s, enabled: false, unlocked: true }));
  }, [memories]);

  // ─── CRUD ───

  const addMemory = useCallback((memory: Omit<Memory, "id" | "createdAt">) => {
    const now = Date.now();
    setMemories((prev) =>
      [{ ...memory, id: makeId(), createdAt: now, updatedAt: memory.updatedAt ?? now }, ...prev].slice(0, MAX_MEMORIES)
    );
  }, []);

  const updateMemory = useCallback((id: string, patch: Partial<Memory>) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch, updatedAt: Date.now() } : m))
    );
  }, []);

  const removeMemory = useCallback((id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const clearAll = useCallback(() => setMemories([]), []);

  // ─── Retrieval ───

  const getRelevant = useCallback(
    (query: string, max = 8): Memory[] => {
      // Always include pinned memories
      const pinned = memories.filter((m) => m.pinned);
      const unpinned = memories.filter((m) => !m.pinned);
      const scored = [...unpinned].sort((a, b) => scoreMemory(b, query) - scoreMemory(a, query));
      const top = scored.slice(0, max - pinned.length);
      const all = [...pinned, ...top];
      // dedupe
      return all.filter((v, i, a) => a.findIndex((m) => m.id === v.id) === i).slice(0, max);
    },
    [memories]
  );

  const getRecent = useCallback(
    (count = 5): Memory[] =>
      [...memories].sort((a, b) => b.createdAt - a.createdAt).slice(0, count),
    [memories]
  );

  return {
    memories,
    loaded,
    encState,
    addMemory,
    updateMemory,
    removeMemory,
    getRelevant,
    getRecent,
    clearAll,
    unlock,
    enableEncryption,
    disableEncryption,
  };
}
