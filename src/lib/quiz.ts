// Passport quiz (docs/16-passport-quiz-draft.md). Pure data and helpers,
// shared by the browser and the server.

export type Option = { id: string; label: string; emoji: string };
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

export const QUESTIONS: Question[] = [
  {
    id: "planning",
    kind: "slider",
    title: "Your ideal day abroad",
    left: { id: "planned", label: "Every hour planned", emoji: "🗓️" },
    right: { id: "improvised", label: "Wake up and see", emoji: "🎲" },
  },
  {
    id: "base",
    kind: "this-or-that",
    title: "Where do you wake up?",
    options: [
      { id: "central", label: "Tiny flat above a market", emoji: "🏙️" },
      { id: "remote", label: "Quiet guesthouse out of town", emoji: "🌿" },
    ],
  },
  {
    id: "crowds",
    kind: "slider",
    title: "Crowds",
    left: { id: "buzz", label: "Love the buzz", emoji: "🎉" },
    right: { id: "quiet", label: "Empty streets only", emoji: "🤫" },
  },
  {
    id: "budget",
    kind: "slider",
    title: "Spend",
    left: { id: "thrifty", label: "Street food & hostels", emoji: "🎒" },
    right: { id: "treat", label: "Treat myself", emoji: "🥂" },
  },
  {
    id: "music",
    kind: "swipe",
    title: "Would this be on your trip playlist?",
    cards: [
      { id: "khruangbin", label: "Khruangbin", emoji: "🎸", note: "Psychedelic funk", entity: { name: "Khruangbin", type: "artist" } },
      { id: "nina-simone", label: "Nina Simone", emoji: "🎹", note: "Soul & jazz", entity: { name: "Nina Simone", type: "artist" } },
      { id: "daft-punk", label: "Daft Punk", emoji: "🤖", note: "French electronic", entity: { name: "Daft Punk", type: "artist" } },
      { id: "bad-bunny", label: "Bad Bunny", emoji: "🐰", note: "Reggaeton", entity: { name: "Bad Bunny", type: "artist" } },
    ],
  },
  {
    id: "films",
    kind: "swipe",
    title: "Would you watch it again?",
    cards: [
      { id: "before-sunrise", label: "Before Sunrise", emoji: "🚆", note: "1995", entity: { name: "Before Sunrise", type: "movie", year: "1995" } },
      { id: "in-the-mood-for-love", label: "In the Mood for Love", emoji: "🌧️", note: "2000", entity: { name: "In the Mood for Love", type: "movie", year: "2000" } },
      { id: "amelie", label: "Amélie", emoji: "🥐", note: "2001", entity: { name: "Amélie", type: "movie", year: "2001" } },
      { id: "mad-max", label: "Mad Max: Fury Road", emoji: "🔥", note: "2015", entity: { name: "Mad Max: Fury Road", type: "movie", year: "2015" } },
    ],
  },
  {
    id: "dinner",
    kind: "this-or-that",
    title: "Dinner tonight",
    options: [
      { id: "noodles", label: "Plastic stool, best noodles in town", emoji: "🍜" },
      { id: "wine-bar", label: "Natural wine bar, small plates", emoji: "🍷" },
    ],
  },
  {
    id: "places",
    kind: "pick",
    title: "Which would you walk into?",
    max: 3,
    options: [
      { id: "bookstore", label: "Bookstore", emoji: "📚" },
      { id: "gallery", label: "Small gallery", emoji: "🖼️" },
      { id: "vintage", label: "Vintage shop", emoji: "🛍️" },
      { id: "jazz-club", label: "Jazz club", emoji: "🎷" },
      { id: "park", label: "Park", emoji: "🌳" },
      { id: "museum", label: "Big museum", emoji: "🏛️" },
      { id: "cafe", label: "Café", emoji: "☕" },
      { id: "brewery", label: "Brewery", emoji: "🍺" },
    ],
  },
  {
    id: "playlist",
    kind: "this-or-that",
    title: "Two playlists for the trip",
    options: [
      { id: "soul", label: "Soul, jazz, bossa nova", emoji: "🎺" },
      { id: "electronic", label: "Electronic, indie, hip-hop", emoji: "🎛️" },
    ],
  },
  {
    id: "backpack",
    kind: "pick",
    title: "Your backpack for one week",
    max: 3,
    options: [
      { id: "film-camera", label: "Film camera", emoji: "📷" },
      { id: "novel", label: "A novel", emoji: "📖" },
      { id: "headphones", label: "Headphones", emoji: "🎧" },
      { id: "boots", label: "Hiking boots", emoji: "🥾" },
      { id: "outfit", label: "A nice outfit", emoji: "👗" },
      { id: "map", label: "Paper map", emoji: "🗺️" },
      { id: "sunscreen", label: "Sunscreen", emoji: "🧴" },
      { id: "sketchbook", label: "Sketchbook", emoji: "📓" },
    ],
  },
  {
    id: "only-one",
    kind: "this-or-that",
    title: "You can only leave with…",
    options: [
      { id: "headphones", label: "Your headphones", emoji: "🎧" },
      { id: "book", label: "One book", emoji: "📚" },
    ],
  },
  {
    id: "openness",
    kind: "swipe",
    title: "Would you do it?",
    cards: [
      { id: "ask-local", label: "Ask a local where they eat", emoji: "🗣️" },
      { id: "get-lost", label: "Get lost on purpose", emoji: "🧭" },
      { id: "strangers-party", label: "Join a stranger's party", emoji: "🎊" },
    ],
  },
];

export const SLIDER_STOPS = 5;
export const MIN_ENTITIES = 3;
export const MAX_ENTITIES = 5;

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
      if (q.options.some((o) => o.id === a)) out[q.id] = a as string;
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
    if (q.kind === "this-or-that") return [`${q.title}: ${label(q.options, [a as string])}`];
    if (q.kind === "pick") return [`${q.title}: ${label(q.options, a as string[]) || "none"}`];
    return [`${q.title}: yes to ${label(q.cards, a as string[]) || "none"}`];
  });
}
