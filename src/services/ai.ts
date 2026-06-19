import { getReply, SLIP_COLORS } from "../data/quotes";
import type { Memory, Profile, Reply, Thought } from "../types";

/**
 * The API key is provided by the project owner through a Vite env variable
 * (VITE_GEMINI_API_KEY) so every visitor gets AI replies without entering a key.
 * If it's missing, the app gracefully falls back to the built-in quote engine.
 */
const API_KEY: string =
  (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim() ?? "";

export const AI_AVAILABLE = API_KEY.length > 0;

const MODEL = "gemini-2.0-flash";

const SYSTEM_PROMPT = `You are the private, emotionally intelligent voice of "Mood Jaar", a cozy little jar that holds people's thoughts.
A person has just dropped a thought. Respond with ONE short, original note that feels personal, comforting, and quietly motivating.

Rules:
- Speak like a trusted friend who knows them. Use their name sparingly. Be specific to their actual words.
- Mirror one concrete detail or feeling from the thought so they feel seen.
- Draw on their saved memories and profile naturally, as a friend who simply *knows* them — never mention that you're reading from notes.
- NEVER start or include phrases like: "I remember", "I recall", "I know about your", "you told me", "you mentioned", "you shared", "you once said", "last time", "previously", "from what I remember", "as we discussed", "based on your memories", "based on what you", "your profile says", "your notes show", "looking at your past", "I noticed from your". These are strictly banned.
- If context from their life is useful, weave it as gentle present-tense awareness without revealing a memory source. Say things like "The surgery is still asking so much of you" or "Those quiet mornings feel like such an anchor" — never "I remember you said you had surgery".
- Never expose that you have any stored information. Speak as if you simply understand their life because you care.
- Avoid repeating the same advice they've likely heard before.
- If they shared struggles, be tender and respectful. Do not bring up trauma unless directly relevant.
- Include emotional validation plus one soft motivational nudge, tiny next step, or reminder of their strength.
- Avoid generic lines like "you've got this" or "stay strong" unless made specific and sincere.
- 2 to 4 sentences, max ~75 words. Uplifting, validating, never preachy, clinical, or dismissive.
- No emojis in the message text. No quotation marks around it. No hashtags.
- If the thought hints at serious self-harm or crisis, gently encourage them to reach out to someone they trust or a local helpline, with compassion.
- Return ONLY a compact JSON object, no markdown fences, exactly:
{"message":"...","label":"a 2-4 word warm heading","emoji":"one fitting emoji","mood":"one lowercase word for the mood"}`;

interface RawAI {
  message?: string;
  label?: string;
  emoji?: string;
  mood?: string;
}

function safeParse(text: string): RawAI | null {
  if (!text) return null;
  let t = text.trim();
  t = t.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    const obj = JSON.parse(t.slice(start, end + 1));
    return obj && typeof obj === "object" ? (obj as RawAI) : null;
  } catch {
    return null;
  }
}

// Post-processor: scrub any "I remember / I recall / you told me" phrasing
// from the AI's output. The prompt already bans these, but this is a safety net.
export function scrubRememberPhrases(text: string): string {
  if (!text) return text;
  let out = text;

  const patterns: Array<[RegExp, string]> = [
    // "I remember (that/how/about) you/your..."
    [/\bI remember\b[^.,;!?]{0,40}[.,;!?\s]*/gi, ""],
    // "I recall (that/how/about) you/your..."
    [/\bI recall\b[^.,;!?]{0,40}[.,;!?\s]*/gi, ""],
    // "I know about your..." / "I know you..."
    [/\bI know (?:about |that )?(?:your |you )/gi, ""],
    // "You told me / mentioned / shared (that/before)..."
    [/\bYou (?:told me|mentioned|shared)(?: (?:that|before|earlier|previously))? ?/gi, ""],
    // "As we discussed / talked about / mentioned..."
    [/\bAs (?:we|you) (?:discussed|talked about|mentioned)[^.,;]*[,;\s]*/gi, ""],
    // "From what I remember / recall / understand / know..."
    [/\bFrom what I (?:remember|recall|understand|know)[^.,;]*[,;\s]*/gi, ""],
    // "Last time / Previously / Earlier you..."
    [/\b(?:Last time|Previously|Earlier),? you /gi, "You've been "],
    // "Based on your memories/profile/history/notes..."
    [/\bBased on (?:your |what you)[^.,;]*[,;\s]*/gi, ""],
    // "I've seen / noticed / observed you..."
    [/\bI'?ve (?:seen|noticed|observed) (?:that )?you /gi, "You've been "],
    // "Your notes/profile/memories/history say(s)..."
    [/\bYour (?:notes|profile|memories|history|past entries) (?:say|says|show|indicate)[^.,;]*[,;\s]*/gi, ""],
    // "In our last/previous conversation..."
    [/\bIn (?:our|your) (?:last|previous|earlier) (?:conversation|session|entry)[^.,;]*[,;\s]*/gi, ""],
    // "You've mentioned before..."
    [/\bYou'?ve mentioned before[^.,;]*[,;\s]*/gi, ""],
    // "Looking at your past..."
    [/\b(?:Looking|Going) (?:at|through|over) your (?:past|previous|earlier)[^.,;]*[,;\s]*/gi, ""],
    // "I can see from your..." / "I noticed from..."
    [/\bI (?:can see|noticed|see) (?:from|in) your[^.,;]*[,;\s]*/gi, ""],
    // "As you've shared with me..."
    [/\bAs you'?ve shared (?:with me)?[^.,;]*[,;\s]*/gi, ""],
    // "You once told / wrote / said..."
    [/\bYou once (?:told|wrote|said|shared)[^.,;]*[,;\s]*/gi, ""],
  ];

  for (const [re, rep] of patterns) {
    out = out.replace(re, rep);
  }

  out = out.replace(/\s{2,}/g, " ").replace(/^\s*[,;\s]+/, "").trim();
  if (out.length > 0) {
    out = out[0].toUpperCase() + out.slice(1);
  }
  return out;
}

function colorFor(): { accent: string; soft: string } {
  const options = [
    { accent: "#a78bfa", soft: "#ede9fe" },
    { accent: "#f472b6", soft: "#fce7f3" },
    { accent: "#7c89f5", soft: "#e0e7ff" },
    { accent: "#22d3ee", soft: "#cffafe" },
    { accent: "#fb7185", soft: "#ffe4e6" },
    { accent: "#f59e0b", soft: "#fef3c7" },
  ];
  return options[Math.floor(Math.random() * options.length)];
}

function buildProfileBlock(profile?: Profile): string {
  if (!profile || !profile.enabled) return "";
  const lines: string[] = [];
  if (profile.name) lines.push(`Name: ${profile.name}`);
  if (profile.ageRange) lines.push(`Age range: ${profile.ageRange}`);
  if (profile.happiness) lines.push(`What brings them joy/comfort: ${profile.happiness}`);
  if (profile.struggles)
    lines.push(`What they're struggling with / past hurts: ${profile.struggles}`);
  if (profile.support) lines.push(`The kind of support they want: ${profile.support}`);
  if (lines.length === 0) return "";
  return `\n\nWho they are (use this to personalize, gently and respectfully):\n${lines.join("\n")}`;
}

function shortText(value: string, max = 110): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}...`;
}

function firstPersonalDetail(value: string, max = 55): string {
  const first = value
    .split(/[.,;\n]/)
    .map((p) => p.trim())
    .find(Boolean);
  return first ? shortText(first, max) : "";
}

function buildRecentThoughtsBlock(recentThoughts?: Thought[]): string {
  const recent = (recentThoughts ?? []).slice(0, 5);
  if (recent.length === 0) return "";
  return `\n\nA few recent notes already in their jar (use only for gentle continuity if relevant):\n${recent
    .map((t, i) => `${i + 1}. Mood: ${t.mood}; note: ${shortText(t.text)}`)
    .join("\n")}`;
}

function personalizeFallback(base: Reply, profile?: Profile, memories?: Memory[]): Reply {
  if (!profile || !profile.enabled) return base;

  const name = profile.name.trim();
  const comfort = firstPersonalDetail(profile.happiness);
  const support = profile.support.toLowerCase();

  const importantMemory = memories?.find((m) => m.importance >= 4)?.content;

  let nudge = "You deserve softness here, not pressure; just take the next small breath and begin there.";
  if (importantMemory) {
    nudge = `${importantMemory.split(" ").slice(0, 6).join(" ")} — that's still part of your story. Keep going gently.`;
  } else if (support.includes("practical") || support.includes("tip")) {
    nudge = "For now, choose one tiny next step, then let the rest wait its turn.";
  } else if (support.includes("heard") || support.includes("listen")) {
    nudge = "You do not have to solve it this second; being honest about it already matters.";
  } else if (support.includes("tough")) {
    nudge = "Keep going gently, but do not let this moment decide what you are capable of.";
  } else if (comfort) {
    nudge = `When it feels loud, come back to ${comfort}; comfort is not small, it is a way home.`;
  }

  return {
    ...base,
    label: name ? `For ${name}` : base.label,
    quote: scrubRememberPhrases(`${name ? `${name}, ` : ""}${base.quote} ${nudge}`),
  };
}

interface ReplyContext {
  profile?: Profile;
  recentThoughts?: Thought[];
  memories?: Memory[];
}

function buildMemoriesBlock(memories?: Memory[]): string {
  const mems = (memories ?? []).slice(0, 6);
  if (mems.length === 0) return "";
  return `\n\nImportant things the jar knows about them (use gently; never say "memory", "I remember", "you told me", or "from our last chat"):\n${mems
    .map((m) => {
      const prefix = m.pinned ? "[important] " : "";
      const title = m.title ? `${m.title}: ` : "";
      const stars = m.importance >= 4 ? " (deeply important to them)" : "";
      return `- ${prefix}${title}${m.content}${stars}`;
    })
    .join("\n")}`;
}

async function callGemini(
  text: string,
  context: ReplyContext,
  signal: AbortSignal
): Promise<RawAI | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(
    API_KEY
  )}`;

  const userContent = `The thought they just dropped into the jar:\n"""${text}"""${buildProfileBlock(
    context.profile
  )}${buildRecentThoughtsBlock(context.recentThoughts)}${buildMemoriesBlock(context.memories)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: userContent }] }],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 260,
        responseMimeType: "application/json",
      },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  const out = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return safeParse(out);
}

export interface AIResult {
  reply: Reply;
  source: "ai" | "offline";
  error?: string;
}

/**
 * Generates a personalized reply using the owner-provided key.
 * Falls back to the built-in quote engine on any failure.
 */
export async function generateReply(
  text: string,
  context: ReplyContext = {},
  timeoutMs = 12000
): Promise<AIResult> {
  const fallback = (): Reply => personalizeFallback(getReply(text), context.profile, context.memories);

  if (!AI_AVAILABLE) {
    return { reply: fallback(), source: "offline" };
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const raw = await callGemini(text, context, controller.signal);

    if (!raw || !raw.message || raw.message.trim().length < 2) {
      return { reply: fallback(), source: "offline", error: "Empty response" };
    }

    const c = colorFor();
    // Strip smart quotes + scrub any "I remember" phrasing before showing
    const stripped = raw.message.trim().replace(/^["\u201C\u201D\u201E]|["\u201C\u201D\u201E]$/g, "");
    const cleanedQuote = scrubRememberPhrases(stripped);
    const reply: Reply = {
      mood: (raw.mood || "gentle").toLowerCase().slice(0, 24),
      emoji: (raw.emoji || "💜").slice(0, 4),
      label: (raw.label || "A note for you").slice(0, 40),
      quote: cleanedQuote,
      accent: c.accent,
      soft: c.soft,
    };
    return { reply, source: "ai" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Request failed";
    return { reply: fallback(), source: "offline", error: msg };
  } finally {
    window.clearTimeout(timer);
  }
}

export { SLIP_COLORS };

// ─── Jar-full appreciation letter ───

function buildAppreciationPrompt(count: number, profile?: { name?: string }): string {
  const nameLine = profile?.name ? `Their name is ${profile.name}; you can use it gently.` : "";
  return `You are the warm voice of "Mood Jaar", a cozy jar holding someone's thoughts.
They just filled their jar with ${count} notes. Write ONE warm, personal appreciation letter (3-5 sentences, ~100 words max).

- Mention specific patterns you notice across their notes (e.g., "I've watched you worry about your sister, celebrate the quiet evenings, and carry the foot surgery so gracefully").
- Acknowledge their courage for writing things down and showing up for themselves.
- Make them feel seen, beautiful, and proud — personal, not generic praise.
- End with one soft, hopeful note as they start a fresh jar.
- No emojis. No quotation marks. No clichés. Just a gentle, warm letter.
- Do NOT use phrases like "I remember" or "you told me" — speak as a friend who simply knows them.
${nameLine}`;
}

export async function generateAppreciation(
  thoughts: Thought[],
  profile?: { name?: string },
  timeoutMs = 15000
): Promise<string> {
  const sample = thoughts.slice(0, 20);
  const summary = sample
    .map((t, i) => `${i + 1}. [${t.mood}] ${t.text}`)
    .join("\n");

  const n = thoughts.length;
  const name = profile?.name?.trim();
  const offline = [
    `Look at you${name ? ", " + name : ", love"}, you set down ${n} pieces of your heart. There were heavy days and soft days, moments you didn't think you could name and ones you wanted to hold onto — and you let every one of them be real. That's a beautiful, brave thing. Step lightly into the next chapter. 💛`,
    `${n} thoughts, ${n} small brave acts of showing up. You didn't fix everything — you just held it, honestly, and that's already so much. Be proud of this jar, and of yourself. A fresh jar waits; you're ready. ✨`,
    `Thank you for being honest with yourself ${n} times over. Each note was you choosing not to carry it alone — that's quiet courage. You're doing so much better than you ever let yourself believe. Breathe, and begin again softly.`,
  ];
  const fallbackMsg = offline[Math.floor(Math.random() * offline.length)];

  if (!AI_AVAILABLE) return fallbackMsg;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(
      API_KEY
    )}`;
    const prompt = buildAppreciationPrompt(n, profile);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: prompt }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Here are the notes they dropped (with detected moods):\n\n${summary}\n\nWrite the appreciation letter now.`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.95,
          maxOutputTokens: 360,
        },
      }),
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const data = await res.json();
    const out: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const trimmed = out.trim();
    return trimmed.length > 20 ? scrubRememberPhrases(trimmed) : fallbackMsg;
  } catch {
    return fallbackMsg;
  } finally {
    window.clearTimeout(timer);
  }
}
