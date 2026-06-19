import type { Reply } from "../types";

export const SLIP_COLORS = [
  "#fda4af",
  "#f0abfc",
  "#a5b4fc",
  "#67e8f9",
  "#86efac",
  "#fde047",
  "#fdba74",
  "#f9a8d4",
  "#c4b5fd",
  "#7dd3fc",
  "#bef264",
  "#fca5a5",
];

interface MoodDef {
  mood: string;
  emoji: string;
  label: string;
  accent: string;
  soft: string;
  keywords: string[];
  quotes: string[];
}

const MOODS: MoodDef[] = [
  {
    mood: "sad",
    emoji: "🌧️",
    label: "When it feels heavy",
    accent: "#7c89f5",
    soft: "#e0e7ff",
    keywords: [
      "sad",
      "down",
      "cry",
      "crying",
      "tears",
      "hurt",
      "broken",
      "heartbroken",
      "depress",
      "unhappy",
      "miserable",
      "grief",
      "empty",
      "numb",
      "hopeless",
      "worthless",
      "blue",
      "rainy",
      "ruin",
    ],
    quotes: [
      "Feelings are like weather — they roll in, and they always roll out again.",
      "It's okay to not be okay. Even the sky cries sometimes, and look how it clears.",
      "Your sadness isn't a burden. It's a sign you've loved, tried, and cared deeply.",
      "This heavy moment isn't your whole story. Be gentle with yourself today.",
      "Tears aren't weakness — they're your soul breathing out so it can breathe in again.",
    ],
  },
  {
    mood: "anxious",
    emoji: "🍃",
    label: "When your mind won't rest",
    accent: "#a78bfa",
    soft: "#ede9fe",
    keywords: [
      "anxious",
      "anxiety",
      "worry",
      "worried",
      "nervous",
      "scared",
      "afraid",
      "stress",
      "stressed",
      "panic",
      "overwhelm",
      "overwhelmed",
      "fear",
      "dread",
      "restless",
      "uneasy",
      "racing",
      "tense",
    ],
    quotes: [
      "You've survived every single hard day so far. That's a perfect record.",
      "Breathe in for four, hold for seven, out for eight. You are safe right now.",
      "Worry borrows trouble from a future that may never arrive. Come back to this calm moment.",
      "You don't have to figure it all out today. One small step is more than enough.",
      "Anxiety is loud, but it isn't the truth. You're okay in this very moment.",
    ],
  },
  {
    mood: "angry",
    emoji: "🔥",
    label: "When it's all too much",
    accent: "#fb7185",
    soft: "#ffe4e6",
    keywords: [
      "angry",
      "anger",
      "mad",
      "furious",
      "frustrat",
      "annoyed",
      "irritated",
      "rage",
      "hate",
      "resent",
      "pissed",
      "unfair",
    ],
    quotes: [
      "Feel the anger, then let it pass like a wave. You're bigger than the feeling.",
      "Peace is power. Choose your calm over the chaos around you.",
      "Your frustration means you care. Channel it — gently, and on your own terms.",
      "Breathe. Not everything deserves your energy. Save it for what you love.",
    ],
  },
  {
    mood: "tired",
    emoji: "🌙",
    label: "When you're running on empty",
    accent: "#f59e0b",
    soft: "#fef3c7",
    keywords: [
      "tired",
      "exhaust",
      "sleepy",
      "drained",
      "burnt out",
      "burnout",
      "weary",
      "fatigue",
      "no energy",
      "sleepless",
      "overworked",
      "can't keep up",
    ],
    quotes: [
      "Rest isn't a reward you earn — it's a need you already deserve.",
      "You're allowed to pause. The world will wait while you catch your breath.",
      "Even the moon rests before it shines again. Be kind to your tired self.",
      "'Done for today' is a full sentence. You've done enough. Truly.",
    ],
  },
  {
    mood: "lonely",
    emoji: "🫂",
    label: "When you feel unseen",
    accent: "#818cf8",
    soft: "#e0e7ff",
    keywords: [
      "lonely",
      "alone",
      "no one",
      "nobody",
      "isolated",
      "left out",
      "ignored",
      "unloved",
      "invisible",
      "missed",
    ],
    quotes: [
      "You are more loved than your loneliest moment lets you believe.",
      "Even when it feels like no one's there, this little jar is holding space for you.",
      "Your presence matters. Somewhere, someone is quietly glad you exist.",
      "Loneliness is temporary company. You are absolutely worth reaching for.",
    ],
  },
  {
    mood: "confused",
    emoji: "🧭",
    label: "When the path feels unclear",
    accent: "#22d3ee",
    soft: "#cffafe",
    keywords: [
      "confused",
      "stuck",
      "lost",
      "unsure",
      "don't know",
      "dont know",
      "decision",
      "uncertain",
      "doubt",
      "overthinking",
      "what if",
      "can't decide",
      "torn",
      "direction",
    ],
    quotes: [
      "Not knowing yet is part of the journey. Clarity comes to those who keep walking.",
      "You don't need the whole map — just the next small step.",
      "Confusion means you're growing. The old answer no longer fits the new you.",
      "Trust the pause. Some doors open slowly, and on purpose.",
    ],
  },
  {
    mood: "grateful",
    emoji: "🌸",
    label: "When your heart is full",
    accent: "#f472b6",
    soft: "#fce7f3",
    keywords: ["grateful", "thankful", "blessed", "appreciate", "lucky", "gratitude"],
    quotes: [
      "Gratitude turns what you already have into more than enough.",
      "Notice the small good things — they quietly add up to a beautiful life.",
      "There's magic in ordinary moments, especially when you look for it.",
      "A thankful heart is a happy heart. Keep collecting the light.",
    ],
  },
  {
    mood: "happy",
    emoji: "☀️",
    label: "When you're glowing",
    accent: "#f59e0b",
    soft: "#fef9c3",
    keywords: [
      "happy",
      "joy",
      "joyful",
      "excited",
      "love",
      "good day",
      "amazing",
      "wonderful",
      "content",
      "proud",
      "smile",
      "laugh",
      "celebrate",
      "achieved",
      "win",
    ],
    quotes: [
      "Hold onto this feeling — you deserve every bit of this joy.",
      "Happiness shared is happiness doubled. Let it spill over a little.",
      "You're shining today. Please don't dim it for anyone.",
      "Savour this. Joy is a visitor well worth making welcome.",
    ],
  },
];

const DEFAULT_MOOD: MoodDef = {
  mood: "gentle",
  emoji: "💛",
  label: "A little something for you",
  accent: "#f59e0b",
  soft: "#fef3c7",
  keywords: [],
  quotes: [
    "Whatever you're feeling, it's valid — and it's temporary. You've got this.",
    "Small steps still move you forward. Be proud of simply showing up today.",
    "You're doing better than you think you are. Really.",
    "Be the kind of friend to yourself that you are to others.",
    "A thought shared is a thought lightened. You're already taking care of you.",
    "You are enough — exactly as you are, right in this moment.",
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getReply(rawText: string): Reply {
  const text = ` ${rawText.toLowerCase().replace(/[^a-z\s']/g, " ")} `;
  let best: MoodDef | null = null;
  let bestScore = 0;

  for (const m of MOODS) {
    let score = 0;
    for (const k of m.keywords) {
      if (text.includes(` ${k} `)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }

  const base = best ?? DEFAULT_MOOD;
  return {
    mood: base.mood,
    emoji: base.emoji,
    label: base.label,
    accent: base.accent,
    soft: base.soft,
    quote: pick(base.quotes),
  };
}
