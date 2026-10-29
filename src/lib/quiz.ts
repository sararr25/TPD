// Passport quiz (docs/16-passport-quiz-draft.md). Pure data and helpers,
// shared by the browser and the server.

// Trait model, no AI: every option nudges a few traits. Four axes are
// bipolar (negative = left word, positive = right word); four are interests.
export const AXES = {
  pace: ["Planner", "Spontaneous"],
  energy: ["Calm", "Lively"],
  spend: ["Thrifty", "Treat-seeker"],
  curiosity: ["Familiar", "Adventurous"],
} as const;
export const INTERESTS = {
  culture: "Culture",
  food: "Food",
  nature: "Nature",
  night: "Nightlife",
} as const;
export type Axis = keyof typeof AXES;
// Keys of QUIZ_ICONS (src/lib/quiz-icons.ts): each interest's illustration.
export const INTEREST_ICON = {
  culture: "🖼️",
  food: "🍜",
  nature: "⛰️",
  night: "🌙",
} as const;
export type Interest = keyof typeof INTERESTS;
export type Traits = Partial<Record<Axis | Interest, number>>;
export type Option = { id: string; label: string; emoji: string; traits?: Traits };
// A card that names a real Qloo entity; checked by name (and year for films).
export type EntityRef = { name: string; type: "artist" | "movie"; year?: string };
export type Card = Option & { note?: string; entity?: EntityRef };
export type Question =
  | { id: string; kind: "slider"; title: string; left: Option; right: Option }
  | { id: string; kind: "this-or-that"; title: string; options: [Option, Option] }
  | { id: string; kind: "pick"; title: string; max: number; options: Option[] }
  | { id: string; kind: "swipe"; title: string; cards: Card[] };
export type Answer = number | string | string[];
export type Answers = Record<string, Answer>;

export const QUIZ_KEY = "beesyde-quiz-v1";
// A this-or-that answer meaning "both, it depends".
export const BOTH = "both";

export const QUESTIONS: Question[] = [
  {
    id: "planning",
    kind: "slider",
    title: "Your ideal day abroad",
    left: { id: "planned", label: "Every hour planned", emoji: "🗓️", traits: { pace: -1 } },
    right: { id: "improvised", label: "Wake up and see", emoji: "🎲", traits: { pace: 1 } },
  },
  {
    id: "base",
    kind: "this-or-that",
    title: "Where do you wake up?",
    options: [
      { id: "central", label: "Tiny flat above a market", emoji: "🏙️", traits: { energy: 0.5, culture: 0.5, food: 0.5 } },
      { id: "remote", label: "Quiet guesthouse out of town", emoji: "🌿", traits: { energy: -0.5, nature: 1 } },
    ],
  },
  {
    id: "crowds",
    kind: "slider",
    title: "Crowds",
    left: { id: "buzz", label: "Love the buzz", emoji: "🎉", traits: { energy: 1, night: 0.5 } },
    right: { id: "quiet", label: "Empty streets only", emoji: "🤫", traits: { energy: -1 } },
  },
  {
    id: "first-night",
    kind: "this-or-that",
    title: "First evening in a new city",
    options: [
      { id: "wander", label: "Walk until something catches my eye", emoji: "🚶", traits: { pace: 1, curiosity: 0.5 } },
      { id: "booked", label: "The table I booked weeks ago", emoji: "📅", traits: { pace: -1, food: 1 } },
    ],
  },
  {
    id: "budget",
    kind: "slider",
    title: "Spend",
    left: { id: "thrifty", label: "Street food & hostels", emoji: "🎒", traits: { spend: -1 } },
    right: { id: "treat", label: "Treat myself", emoji: "🥂", traits: { spend: 1 } },
  },
  {
    id: "music",
    kind: "swipe",
    title: "Would this be on your trip playlist?",
    cards: [
      { id: "khruangbin", label: "Khruangbin", emoji: "🎸", note: "Psychedelic funk", entity: { name: "Khruangbin", type: "artist" }, traits: { culture: 0.5, curiosity: 0.5 } },
      { id: "nina-simone", label: "Nina Simone", emoji: "🎹", note: "Soul & jazz", entity: { name: "Nina Simone", type: "artist" }, traits: { culture: 1 } },
      { id: "daft-punk", label: "Daft Punk", emoji: "🤖", note: "French electronic", entity: { name: "Daft Punk", type: "artist" }, traits: { night: 1 } },
      { id: "bad-bunny", label: "Bad Bunny", emoji: "🐰", note: "Reggaeton", entity: { name: "Bad Bunny", type: "artist" }, traits: { night: 1, energy: 0.5 } },
    ],
  },
  {
    id: "food-adventure",
    kind: "slider",
    title: "On the menu",
    left: { id: "known", label: "Something I recognise", emoji: "🍝", traits: { curiosity: -1 } },
    right: { id: "local", label: "Whatever the locals order", emoji: "🦗", traits: { curiosity: 1, food: 1 } },
  },
  {
    id: "films",
    kind: "swipe",
    title: "Would you watch it again?",
    cards: [
      { id: "before-sunrise", label: "Before Sunrise", emoji: "🚆", note: "1995", entity: { name: "Before Sunrise", type: "movie", year: "1995" }, traits: { pace: 0.5, culture: 0.5 } },
      { id: "in-the-mood-for-love", label: "In the Mood for Love", emoji: "🌧️", note: "2000", entity: { name: "In the Mood for Love", type: "movie", year: "2000" }, traits: { culture: 1 } },
      { id: "amelie", label: "Amélie", emoji: "🥐", note: "2001", entity: { name: "Amélie", type: "movie", year: "2001" }, traits: { culture: 0.5, food: 0.5 } },
      { id: "mad-max", label: "Mad Max: Fury Road", emoji: "🔥", note: "2015", entity: { name: "Mad Max: Fury Road", type: "movie", year: "2015" }, traits: { energy: 0.5, curiosity: 0.5 } },
    ],
  },
  {
    id: "dinner",
    kind: "this-or-that",
    title: "Dinner tonight",
    options: [
      { id: "noodles", label: "Plastic stool, best noodles in town", emoji: "🍜", traits: { food: 1, spend: -0.5, curiosity: 0.5 } },
      { id: "wine-bar", label: "Natural wine bar, small plates", emoji: "🍷", traits: { food: 1, spend: 0.5, night: 0.5 } },
    ],
  },
  {
    id: "company",
    kind: "slider",
    title: "Company",
    left: { id: "alone", label: "Alone with my thoughts", emoji: "🧘", traits: { energy: -1 } },
    right: { id: "crowd", label: "The more the merrier", emoji: "👯", traits: { energy: 1 } },
  },
  {
    id: "places",
    kind: "pick",
    title: "Which would you walk into?",
    max: 3,
    options: [
      { id: "bookstore", label: "Bookstore", emoji: "📚", traits: { culture: 1 } },
      { id: "gallery", label: "Small gallery", emoji: "🖼️", traits: { culture: 1 } },
      { id: "vintage", label: "Vintage shop", emoji: "🛍️", traits: { culture: 0.5, curiosity: 0.5 } },
      { id: "jazz-club", label: "Jazz club", emoji: "🎷", traits: { night: 1, culture: 0.5 } },
      { id: "park", label: "Park", emoji: "🌳", traits: { nature: 1 } },
      { id: "museum", label: "Big museum", emoji: "🏛️", traits: { culture: 1, curiosity: -0.5 } },
      { id: "cafe", label: "Café", emoji: "☕", traits: { food: 0.5, energy: -0.5 } },
      { id: "brewery", label: "Brewery", emoji: "🍺", traits: { night: 0.5, food: 0.5 } },
    ],
  },
  {
    id: "rhythm",
    kind: "slider",
    title: "Your rhythm",
    left: { id: "sunrise", label: "Up for the sunrise", emoji: "🌅", traits: { nature: 0.5, night: -1 } },
    right: { id: "midnight", label: "Out past midnight", emoji: "🌙", traits: { night: 1 } },
  },
  {
    id: "afternoon",
    kind: "this-or-that",
    title: "A free afternoon",
    options: [
      { id: "trail", label: "A trail with a view at the end", emoji: "⛰️", traits: { nature: 1 } },
      { id: "neighbourhood", label: "A neighbourhood I've never heard of", emoji: "🏘️", traits: { culture: 1, curiosity: 0.5 } },
    ],
  },
  {
    id: "playlist",
    kind: "this-or-that",
    title: "Two playlists for the trip",
    options: [
      { id: "soul", label: "Soul, jazz, bossa nova", emoji: "🎺", traits: { culture: 0.5, energy: -0.5 } },
      { id: "electronic", label: "Electronic, indie, hip-hop", emoji: "🎛️", traits: { night: 1, energy: 0.5 } },
    ],
  },
  {
    id: "rainy",
    kind: "pick",
    title: "It rains all afternoon. You…",
    max: 2,
    options: [
      { id: "cinema", label: "Find an old cinema", emoji: "🎬", traits: { culture: 1 } },
      { id: "cooking", label: "Join a cooking class", emoji: "🥟", traits: { food: 1, curiosity: 0.5 } },
      { id: "spa", label: "Book a spa", emoji: "♨️", traits: { spend: 1, energy: -1 } },
      { id: "records", label: "Dig in a record shop", emoji: "💿", traits: { culture: 0.5, night: 0.5 } },
      { id: "cafe-book", label: "Café and a book", emoji: "📖", traits: { energy: -1, culture: 0.5 } },
      { id: "walk-anyway", label: "Walk anyway", emoji: "☔", traits: { nature: 1, curiosity: 0.5 } },
    ],
  },
  {
    id: "backpack",
    kind: "pick",
    title: "Your backpack for one week",
    max: 3,
    options: [
      { id: "film-camera", label: "Film camera", emoji: "📷", traits: { culture: 0.5, curiosity: 0.5 } },
      { id: "novel", label: "A novel", emoji: "📖", traits: { culture: 0.5, energy: -0.5 } },
      { id: "headphones", label: "Headphones", emoji: "🎧", traits: { night: 0.5 } },
      { id: "boots", label: "Hiking boots", emoji: "🥾", traits: { nature: 1 } },
      { id: "outfit", label: "A nice outfit", emoji: "👗", traits: { night: 0.5, spend: 0.5 } },
      { id: "map", label: "Paper map", emoji: "🗺️", traits: { pace: -0.5, curiosity: 0.5 } },
      { id: "sunscreen", label: "Sunscreen", emoji: "🧴", traits: { nature: 0.5 } },
      { id: "sketchbook", label: "Sketchbook", emoji: "📓", traits: { culture: 1 } },
    ],
  },
  {
    id: "only-one",
    kind: "this-or-that",
    title: "You can only leave with…",
    options: [
      { id: "headphones", label: "Your headphones", emoji: "🎧", traits: { night: 0.5 } },
      { id: "book", label: "One book", emoji: "📚", traits: { culture: 0.5 } },
    ],
  },
  {
    id: "openness",
    kind: "swipe",
    title: "Would you do it?",
    cards: [
      { id: "ask-local", label: "Ask a local where they eat", emoji: "🗣️", traits: { curiosity: 1, food: 0.5 } },
      { id: "get-lost", label: "Get lost on purpose", emoji: "🧭", traits: { curiosity: 1, pace: 1 } },
      { id: "bar-counter", label: "Eat alone at the bar counter", emoji: "🍣", traits: { curiosity: 0.5, food: 0.5 } },
      { id: "sunrise-hike", label: "Set a 5am alarm for a hike", emoji: "🥾", traits: { nature: 1, pace: -0.5 } },
      { id: "strangers-party", label: "Join a stranger's party", emoji: "🎊", traits: { curiosity: 1, energy: 1, night: 1 } },
    ],
  },
];

export const SLIDER_STOPS = 5;
export const MIN_ENTITIES = 3;
export const MAX_ENTITIES = 10;

// Every card that stands for a Qloo entity, by card id.
export const ENTITY_CARDS: Record<string, Card & { entity: EntityRef }> =
  Object.fromEntries(
    QUESTIONS.flatMap((q) => (q.kind === "swipe" ? q.cards : []))
      .filter((c): c is Card & { entity: EntityRef } => !!c.entity)
      .map((c) => [c.id, c]),
  );

// Keeps only answers that fit the current questions.
export function cleanAnswers(value: unknown): Answers {
  if (!value || typeof value !== "object") return {};
  const raw = value as Record<string, unknown>;
  const out: Answers = {};
  for (const q of QUESTIONS) {
    const a = raw[q.id];
    if (q.kind === "slider") {
      if (Number.isInteger(a) && (a as number) >= 1 && (a as number) <= SLIDER_STOPS)
        out[q.id] = a as number;
    } else if (q.kind === "this-or-that") {
      if (a === BOTH || q.options.some((o) => o.id === a)) out[q.id] = a as string;
    } else if (Array.isArray(a)) {
      const ids = (q.kind === "pick" ? q.options : q.cards).map((o) => o.id);
      const kept = [...new Set(a)].filter(
        (x): x is string => typeof x === "string" && ids.includes(x),
      );
      out[q.id] = q.kind === "pick" ? kept.slice(0, q.max) : kept;
    }
  }
  return out;
}

export function parseQuiz(raw: string | null): Answers {
  try {
    return cleanAnswers(JSON.parse(raw ?? "null"));
  } catch {
    return {};
  }
}

// Browser only: the stored quiz answers, used to steer Swap and Explore (C7).
// Unreadable storage means no steering.
export function readStoredQuiz(): Answers {
  try {
    return parseQuiz(localStorage.getItem(QUIZ_KEY));
  } catch {
    return {};
  }
}

// Entity cards the user swiped right on, in quiz order.
export function likedEntities(answers: Answers): string[] {
  return QUESTIONS.flatMap((q) =>
    q.kind === "swipe" && Array.isArray(answers[q.id])
      ? (answers[q.id] as string[]).filter((id) => id in ENTITY_CARDS)
      : [],
  );
}

// Plain-language profile, one line per answered question: kept for Claude.
export function profileLines(answers: Answers): string[] {
  const label = (options: Option[], ids: string[]) =>
    ids.map((id) => options.find((o) => o.id === id)?.label).filter(Boolean).join(", ");
  return QUESTIONS.flatMap((q) => {
    const a = answers[q.id];
    if (a === undefined) return [];
    if (q.kind === "slider")
      return [`${q.title}: ${a}/${SLIDER_STOPS} (1 = ${q.left.label}, ${SLIDER_STOPS} = ${q.right.label})`];
    if (q.kind === "this-or-that")
      return [`${q.title}: ${a === BOTH ? `both (${label(q.options, q.options.map((o) => o.id))})` : label(q.options, [a as string])}`];
    if (q.kind === "pick") return [`${q.title}: ${label(q.options, a as string[]) || "none"}`];
    return [`${q.title}: yes to ${label(q.cards, a as string[]) || "none"}`];
  });
}

// The profile the Passport shows: axes from 0 (left word) to 100 (right
// word), interests as a share of the strongest one, and a traveller type.
export type Profile = {
  axes: Record<Axis, number>;
  interests: Record<Interest, number>;
  title: string;
  motto: string;
  answered: number;
};

const NOUN: Record<Interest, string> = {
  culture: "Flâneur",
  food: "Taste Hunter",
  nature: "Wanderer",
  night: "Night Owl",
};
const ADJECTIVE: Record<Axis, [string, string]> = {
  pace: ["Methodical", "Spontaneous"],
  energy: ["Slow", "Social"],
  spend: ["Scrappy", "Refined"],
  curiosity: ["Classic", "Curious"],
};

// Presentation completeness only: skipped questions do not become answers.
export function quizCompletion(answers: Answers) {
  const answered = Object.keys(cleanAnswers(answers)).length;
  return { answered, total: QUESTIONS.length, partial: answered < QUESTIONS.length };
}
export function buildProfile(answers: Answers): Profile | null {
  const sum: Record<string, number> = {};
  const add = (t: Traits | undefined, weight: number) => {
    for (const [k, v] of Object.entries(t ?? {})) sum[k] = (sum[k] ?? 0) + v * weight;
  };
  let answered = 0;
  for (const q of QUESTIONS) {
    const a = answers[q.id];
    if (a === undefined) continue;
    answered++;
    if (q.kind === "slider") {
      const p = ((a as number) - 1) / (SLIDER_STOPS - 1);
      add(q.left.traits, 1 - p);
      add(q.right.traits, p);
    } else if (q.kind === "this-or-that") {
      for (const o of q.options) if (a === BOTH || a === o.id) add(o.traits, a === BOTH ? 0.5 : 1);
    } else {
      const list = q.kind === "pick" ? q.options : q.cards;
      for (const o of list) if ((a as string[]).includes(o.id)) add(o.traits, 1);
    }
  }
  if (!answered) return null;
  const axes = Object.fromEntries(
    (Object.keys(AXES) as Axis[]).map((k) => [
      k,
      Math.round(50 + 50 * Math.max(-1, Math.min(1, (sum[k] ?? 0) / 3))),
    ]),
  ) as Record<Axis, number>;
  const keys = Object.keys(INTERESTS) as Interest[];
  const top = Math.max(1, ...keys.map((k) => sum[k] ?? 0));
  const interests = Object.fromEntries(
    keys.map((k) => [k, Math.round((100 * Math.max(0, sum[k] ?? 0)) / top)]),
  ) as Record<Interest, number>;
  const ranked = [...keys].sort((x, y) => interests[y] - interests[x]);
  // The axis furthest from the middle names the adjective.
  const strongest = (Object.keys(AXES) as Axis[]).sort(
    (x, y) => Math.abs(axes[y] - 50) - Math.abs(axes[x] - 50),
  )[0];
  const adjective = ADJECTIVE[strongest][axes[strongest] >= 50 ? 1 : 0];
  const word = (k: Axis) =>
    axes[k] >= 60 ? AXES[k][1] : axes[k] <= 40 ? AXES[k][0] : null;
  const motto = [
    ...(Object.keys(AXES) as Axis[]).map(word).filter(Boolean),
    `${INTERESTS[ranked[0]]} first, ${INTERESTS[ranked[1]].toLowerCase()} close behind`,
  ].join(" · ");
  return { axes, interests, title: `The ${adjective} ${NOUN[ranked[0]]}`, motto, answered };
}

// Profile → Qloo parameters (C7, docs/17). Only the axes that are clearly
// leaning one way change anything; a neutral profile sends nothing.
// Popularity is Qloo's 0–1 percentile; price level is 1–4. Museums get
// nothing (too few per city, docs/18) and hotels no price (Qloo has none).
export function qlooParams(
  profile: Profile | null,
  category: "restaurant" | "bar" | "cafe" | "museum" | "hotel",
): Record<string, string> {
  if (!profile || category === "museum") return {};
  const withPrice = category === "restaurant" || category === "bar" || category === "cafe";
  const { energy, curiosity, spend } = profile.axes;
  const out: Record<string, string> = {};
  // Calm or adventurous people get fewer of the most popular places.
  const away = Math.max((50 - energy) / 50, (curiosity - 50) / 50);
  if (away >= 0.2) out["filter.popularity.max"] = (1 - 0.3 * away).toFixed(2);
  // Familiar-leaning people keep well-known places.
  else if (curiosity <= 35) out["filter.popularity.min"] = "0.8";
  if (withPrice && spend <= 35) out["filter.price_level.max"] = "2";
  if (withPrice && spend >= 65) out["filter.price_level.min"] = "3";
  return out;
}
