export type MoodKey = "anxious" | "stressed" | "sad" | "regretful" | "neutral";
export type MethodKey = "breathing" | "grounding" | "journal" | "reframe" | "reassurance";

export const MOODS: { key: MoodKey; label: string; emoji: string; subtitle: string }[] = [
  { key: "anxious",   label: "Anxious",   emoji: "🌊", subtitle: "racing, tight, on edge" },
  { key: "stressed",  label: "Stressed",  emoji: "🌥️", subtitle: "overwhelmed, too much" },
  { key: "sad",       label: "Sad",       emoji: "🌙", subtitle: "low, heavy, tearful" },
  { key: "regretful", label: "Regretful", emoji: "🍂", subtitle: "stuck on the past" },
  { key: "neutral",   label: "Neutral",   emoji: "🌿", subtitle: "checking in, just because" },
];

export const METHOD_LABELS: Record<MethodKey, string> = {
  breathing: "Breathing",
  grounding: "5-4-3-2-1 Grounding",
  journal: "Journaling",
  reframe: "Reframe a thought",
  reassurance: "Gentle reassurance",
};

// Default ordered methods per mood
export const MOOD_METHODS: Record<MoodKey, MethodKey[]> = {
  anxious:   ["breathing", "grounding", "reassurance", "journal", "reframe"],
  stressed:  ["breathing", "journal", "grounding", "reframe", "reassurance"],
  sad:       ["reassurance", "journal", "breathing", "reframe", "grounding"],
  regretful: ["reframe", "journal", "reassurance", "breathing", "grounding"],
  neutral:   ["journal", "breathing", "reframe", "grounding", "reassurance"],
};

export const REASSURANCE: Record<MoodKey, string[]> = {
  anxious: [
    "This wave will pass. You've ridden every one before it.",
    "You're safe in this moment. Your body just needs a slower breath.",
    "Anxiety is a signal, not a sentence. You can listen without obeying.",
  ],
  stressed: [
    "You don't have to carry it all at once. One small thing first.",
    "Pause is productive. Your nervous system needs this minute.",
    "The list will still be there. Right now, just be here.",
  ],
  sad: [
    "It makes sense that you feel this way. You're allowed to feel it.",
    "You don't have to fix it to deserve kindness — especially from yourself.",
    "Sadness is love with nowhere to go. Be tender with it.",
  ],
  regretful: [
    "You did the best you could with what you knew then.",
    "Regret means you care. That's a good thing — even when it hurts.",
    "You can't edit the past, but you're already shaping the next chapter.",
  ],
  neutral: [
    "Checking in is a kind thing to do for yourself.",
    "Stillness is a perfectly valid emotion.",
    "You don't need a reason to take a soft minute.",
  ],
};

export const REFRAME_PROMPTS: Record<MoodKey, string[]> = {
  anxious:   ["What's the worst case — and how would I cope if it happened?", "Is this thought a fact, or a feeling pretending to be one?", "What would I tell a friend feeling exactly this?"],
  stressed:  ["What's the *one* next step — not the whole mountain?", "What can I let go of today, even temporarily?", "Which of these things is actually mine to carry?"],
  sad:       ["What does this feeling need — comfort, rest, or expression?", "Is there one tiny kindness I can offer myself right now?", "What would my most loving self say to me?"],
  regretful: ["What did I *learn* from this that I couldn't have learned any other way?", "What's still in my control going forward?", "Would I judge a friend as harshly as I'm judging myself?"],
  neutral:   ["What's one thing I'm quietly grateful for today?", "What do I want more of this week?", "What's been on the edge of my mind that I haven't named?"],
};

export const moodColor = (m: MoodKey) => `hsl(var(--mood-${m}))`;
