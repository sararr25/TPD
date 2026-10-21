// Gradual feedback (docs/17 D3), no AI. Each "Yes" / "Not for me" is a vote
// on a place and its taste tags. One vote is a weak signal: it only nudges the
// order of results. When STRONG votes agree on the same tag it becomes a strong
// signal: an excluded tag is sent to Qloo; a preferred tag moves the places
// that carry it to the top (Qloo ignores signal.interests.tags next to entity
// signals, checked live 21 Oct, docs/18). Strong signals are shown on the
// Passport, where the user can undo them. Shared by the browser and the server.
import type { Entity } from "./discovery.ts";

export const FEEDBACK_KEY = "beesyde-feedback-v1";
export const STRONG = 5;
export const MAX_VOTES = 100;
const MAX_TAGS = 6;
const MAX_WEAK = 40;
const MAX_NUDGE = 3;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TAG_ID = /^urn:tag:[a-z0-9_.:-]{1,120}$/;
// Tags that describe taste (cuisine, ambience, offerings…), not the kind of place.
const TASTE_TAG = /^urn:tag:(cuisine:place|ambience:qloo|offerings:place|beverage_offering:qloo|interests:qloo|decor:qloo|activity_type:qloo)$/;

export type FeedbackTag = { id: string; name: string };
export type Vote = { id: string; name: string; vote: 1 | -1; tags: FeedbackTag[] };
export type Feedback = { votes: Vote[]; dismissed: string[] };

const text = (v: unknown, max: number) => (typeof v === "string" && v.length <= max ? v : null);

// Keeps only well-formed votes (last vote per place wins, newest MAX_VOTES).
export function cleanFeedback(value: unknown): Feedback {
  if (!value || typeof value !== "object") return { votes: [], dismissed: [] };
  const raw = value as Record<string, unknown>;
  const byPlace = new Map<string, Vote>();
  for (const v of Array.isArray(raw.votes) ? raw.votes : []) {
    if (!v || typeof v !== "object") continue;
    const id = text(v.id, 36), name = text(v.name, 200);
    if (!id || !UUID.test(id) || !name || (v.vote !== 1 && v.vote !== -1)) continue;
    const tags = (Array.isArray(v.tags) ? v.tags : [])
      .filter((t: unknown): t is FeedbackTag => {
        const tag = t as FeedbackTag;
        return !!text(tag?.id, 130) && TAG_ID.test(tag.id) && !!text(tag?.name, 120);
      })
      .slice(0, MAX_TAGS)
      .map((t: FeedbackTag) => ({ id: t.id, name: t.name }));
    byPlace.delete(id);
    byPlace.set(id, { id, name, vote: v.vote, tags });
  }
  const dismissed = [
    ...new Set(
      (Array.isArray(raw.dismissed) ? raw.dismissed : []).filter(
        (d): d is string => typeof d === "string" && TAG_ID.test(d),
      ),
    ),
  ].slice(0, 200);
  return { votes: [...byPlace.values()].slice(-MAX_VOTES), dismissed };
}

export function parseFeedback(raw: string | null): Feedback {
  try {
    return cleanFeedback(JSON.parse(raw ?? "null"));
  } catch {
    return { votes: [], dismissed: [] };
  }
}

export function voteFor(place: Entity, vote: 1 | -1): Vote {
  return {
    id: place.id,
    name: place.name,
    vote,
    tags: place.tags
      .filter((t) => TASTE_TAG.test(t.type))
      .slice(0, MAX_TAGS)
      .map((t) => ({ id: t.id, name: t.name })),
  };
}

export function addVote(fb: Feedback, vote: Vote): Feedback {
  return cleanFeedback({ ...fb, votes: [...fb.votes.filter((v) => v.id !== vote.id), vote] });
}

// Undo (docs/22 F7, F8): forget the vote for one place.
export function removeVote(fb: Feedback, id: string): Feedback {
  return cleanFeedback({ ...fb, votes: fb.votes.filter((v) => v.id !== id) });
}

type Score = { id: string; name: string; yes: number; no: number };
export function tagScores(fb: Feedback): Score[] {
  const scores = new Map<string, Score>();
  for (const v of fb.votes)
    for (const t of v.tags) {
      const s = scores.get(t.id) ?? { id: t.id, name: t.name, yes: 0, no: 0 };
      if (v.vote === 1) s.yes++;
      else s.no++;
      scores.set(t.id, s);
    }
  return [...scores.values()];
}

// Strong = at least STRONG agreeing votes and twice the opposite ones.
export function strongSignals(fb: Feedback) {
  const live = tagScores(fb).filter((s) => !fb.dismissed.includes(s.id));
  return {
    keep: live.filter((s) => s.yes >= STRONG && s.yes >= 2 * s.no).sort((a, b) => b.yes - a.yes).slice(0, 5),
    avoid: live.filter((s) => s.no >= STRONG && s.no >= 2 * s.yes).sort((a, b) => b.no - a.no).slice(0, 5),
  };
}

// What the browser sends with Explore and Swap: tag ids only, small.
export type FeedbackSignal = { keep: string[]; avoid: string[]; weak: Record<string, number> };
export function feedbackSignal(fb: Feedback): FeedbackSignal {
  const strong = strongSignals(fb);
  const strongIds = new Set([...strong.keep, ...strong.avoid].map((s) => s.id));
  const weak: Record<string, number> = {};
  for (const s of tagScores(fb)
    .filter((s) => !strongIds.has(s.id) && !fb.dismissed.includes(s.id) && s.yes !== s.no)
    .sort((a, b) => Math.abs(b.yes - b.no) - Math.abs(a.yes - a.no))
    .slice(0, MAX_WEAK))
    weak[s.id] = Math.max(-(STRONG - 1), Math.min(STRONG - 1, s.yes - s.no));
  return { keep: strong.keep.map((s) => s.id), avoid: strong.avoid.map((s) => s.id), weak };
}

// Server side: accept only the compact shape above.
export function cleanSignal(value: unknown): FeedbackSignal {
  const empty = { keep: [], avoid: [], weak: {} };
  if (!value || typeof value !== "object") return empty;
  const raw = value as Record<string, unknown>;
  const ids = (v: unknown) =>
    Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string" && TAG_ID.test(x)))].slice(0, 5) : [];
  const weak: Record<string, number> = {};
  if (raw.weak && typeof raw.weak === "object" && !Array.isArray(raw.weak))
    for (const [k, v] of Object.entries(raw.weak).slice(0, MAX_WEAK))
      if (TAG_ID.test(k) && Number.isInteger(v) && Math.abs(v as number) < STRONG && v !== 0) weak[k] = v as number;
  return { keep: ids(raw.keep), avoid: ids(raw.avoid), weak };
}

// Strong "less" → Qloo parameter (strong "more" is applied by nudge).
export function feedbackParams(signal: FeedbackSignal): Record<string, string> {
  return signal.avoid.length ? { "filter.exclude.tags": signal.avoid.join(",") } : {};
}

// Places with a strong "more" tag come first; weak signals then move a place
// at most a few positions up or down. Order is stable otherwise.
export function nudge<T extends { tags: { id: string }[] }>(places: T[], signal: FeedbackSignal): T[] {
  if (!Object.keys(signal.weak).length && !signal.keep.length) return places;
  const preferred = (p: T) => p.tags.some((t) => signal.keep.includes(t.id));
  return places
    .map((p, i) => {
      const score = p.tags.reduce((n, t) => n + (signal.weak[t.id] ?? 0), 0);
      const shift = Math.max(-MAX_NUDGE, Math.min(MAX_NUDGE, score));
      // The extra half step makes a nudged place pass the one it ties with.
      return { p, top: preferred(p), key: i - shift - Math.sign(shift) / 2 };
    })
    .sort((a, b) => Number(b.top) - Number(a.top) || a.key - b.key)
    .map((x) => x.p);
}
