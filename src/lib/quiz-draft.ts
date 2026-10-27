import { QUESTIONS, ENTITY_CARDS, cleanAnswers, type Answers } from "./quiz";

export const QUIZ_ORDER = [QUESTIONS.find(q => q.id === "places")!, QUESTIONS.find(q => q.id === "music")!, ...QUESTIONS.filter(q => q.id !== "places" && q.id !== "music")];
const draftKey = (owner: string) => `beesyde-quiz-draft-v1:${owner}`;
const soundKey = "beesyde-quiz-muted-v1";
const maxAge = 7 * 24 * 60 * 60 * 1000;
export type QuizDraft = { step: number; answers: Answers; history: Record<string, boolean[]>; extra: string[] };

// Drafts are browser-only work in progress, never a saved or pending Passport.
export function readQuizDraft(owner: string): QuizDraft | null {
  try {
    const value = JSON.parse(localStorage.getItem(draftKey(owner)) || "null");
    if (!value || value.version !== 1 || !Number.isFinite(value.updatedAt) ||
      value.updatedAt > Date.now() || Date.now() - value.updatedAt > maxAge ||
      !Number.isInteger(value.step) || value.step < 0 || value.step > QUIZ_ORDER.length ||
      !value.answers || typeof value.answers !== "object" || Array.isArray(value.answers) ||
      !value.history || typeof value.history !== "object" || Array.isArray(value.history) ||
      !Array.isArray(value.extra)) return null;
    const answers = cleanAnswers(value.answers), history: Record<string, boolean[]> = {};
    for (const q of QUIZ_ORDER) {
      if (q.kind !== "swipe" || value.history[q.id] === undefined) continue;
      const entries = value.history[q.id];
      if (!Array.isArray(entries) || entries.length > q.cards.length || !entries.every(v => typeof v === "boolean")) return null;
      history[q.id] = entries;
      if (entries.length) answers[q.id] = q.cards.filter((_, i) => entries[i]).map(c => c.id);
      else delete answers[q.id];
    }
    const extra = [...new Set(value.extra.filter((id: unknown): id is string => typeof id === "string" && Object.hasOwn(ENTITY_CARDS, id)))].slice(0, 5) as string[];
    return { step: value.step, answers, history, extra };
  } catch { return null; }
}

export function saveQuizDraft(owner: string, draft: QuizDraft): boolean {
  try {
    localStorage.setItem(draftKey(owner), JSON.stringify({ ...draft, version: 1, updatedAt: Date.now() }));
    return true;
  } catch { return false; }
}

export function deleteQuizDraft(owner: string) { localStorage.removeItem(draftKey(owner)); }
export function readQuizMuted(): boolean {
  try { return localStorage.getItem(soundKey) === "true"; } catch { return false; }
}
export function saveQuizMuted(muted: boolean) {
  try { localStorage.setItem(soundKey, String(muted)); } catch { /* Sound still works for this open quiz. */ }
}
