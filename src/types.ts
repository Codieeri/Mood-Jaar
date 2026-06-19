export interface Thought {
  id: string;
  text: string;
  mood: string;
  emoji: string;
  label: string;
  quote: string;
  accent: string;
  soft: string;
  color: string;
  source?: "ai" | "offline";
  createdAt: number;
}

export interface Reply {
  mood: string;
  emoji: string;
  label: string;
  quote: string;
  accent: string;
  soft: string;
}

export interface Profile {
  name: string;
  ageRange: string;
  happiness: string;
  struggles: string;
  support: string;
  enabled: boolean;
}

export const EMPTY_PROFILE: Profile = {
  name: "",
  ageRange: "",
  happiness: "",
  struggles: "",
  support: "",
  enabled: false,
};

// ─── Memory system ───

export type MemoryKind =
  | "event"       // important life event (surgery, breakup, achievement)
  | "preference"  // likes/dislikes, communication style
  | "concern"     // recurring worry, fear, anxiety theme
  | "insight"     // personal realization, lesson learned
  | "goal"        // hope, dream, something they're working towards
  | "journal";    // a journal-style longer entry

export interface Memory {
  id: string;
  kind: MemoryKind;
  title: string;          // short headline
  content: string;        // full note
  tags: string[];
  importance: number;     // 1–5 star rating
  pinned: boolean;        // pinned = always included in long-term context
  createdAt: number;
  updatedAt: number;
  sourceThoughtId?: string;
}

export interface MemoryContext {
  recent: Memory[];     // short-term (last few)
  important: Memory[];  // long-term (pinned + high importance)
}
