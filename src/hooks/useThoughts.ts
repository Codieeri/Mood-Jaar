import { useCallback, useEffect, useRef, useState } from "react";
import type { Thought } from "../types";

const STORAGE_KEY = "moodjaar.thoughts.v1";
const MAX_THOUGHTS = 200;

function loadThoughts(): Thought[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t): t is Thought =>
        t &&
        typeof t.id === "string" &&
        typeof t.text === "string" &&
        typeof t.quote === "string"
    );
  } catch {
    return [];
  }
}

export function useThoughts() {
  const [thoughts, setThoughts] = useState<Thought[]>(() => loadThoughts());
  const ref = useRef(thoughts);
  ref.current = thoughts;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(thoughts));
    } catch {
      /* ignore quota / private mode errors */
    }
  }, [thoughts]);

  const addThought = useCallback((thought: Thought) => {
    setThoughts((prev) => [thought, ...prev].slice(0, MAX_THOUGHTS));
  }, []);

  const removeThought = useCallback((id: string) => {
    setThoughts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => setThoughts([]), []);

  return { thoughts, addThought, removeThought, clearAll };
}

export function makeId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
