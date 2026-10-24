import { QUIZ_KEY, cleanAnswers, type Answers } from "./quiz";
import { LIVE_PASSPORT_KEY } from "./discovery";
import { discovery, readSelections, type Selection } from "./discovery-client";
import { saveAccountPassport, saveAccountQuiz } from "./account";
export const PASSPORT_CHANGED = "tpd:passport-changed";
export const PASSPORT_OWNER = "beesyde-passport-owner";
type Pending = {
  revision: string;
  choices: Selection[];
  answers: Answers;
  cards: string[];
  passportSaved: boolean;
};
const pendingKey = (owner: string) => `beesyde-passport-pending:${owner}`;
const inflight = new Map<string, Promise<void>>();
const resolved = new Map<string, Selection[]>();
function changed() {
  window.dispatchEvent(new Event(PASSPORT_CHANGED));
}
export function pendingPassport(owner: string): Pending | null {
  try {
    const p = JSON.parse(localStorage.getItem(pendingKey(owner)) || "null");
    if (!p || !Array.isArray(p.choices) || p.choices.length > 5 ||
      !Array.isArray(p.cards) || p.cards.length > 5 || !p.cards.every((c: unknown) => typeof c === "string" && c.length <= 120) ||
      !p.answers || typeof p.answers !== "object" || Array.isArray(p.answers) || typeof p.passportSaved !== "boolean") return null;
    const choices = readSelections(JSON.stringify(p.choices));
    if (choices.length !== p.choices.length) return null;
    return { choices, answers: cleanAnswers(p.answers), cards: p.cards, passportSaved: p.passportSaved, revision: typeof p.revision === "string" ? p.revision : "legacy" };

  } catch {
    return null;
  }
}
export function passportSaving(owner: string) {
  return inflight.has(owner);
}
export function stagePassport(
  owner: string,
  choices: Selection[],
  answers: Answers,
  cards: string[] = [],
) {
  localStorage.setItem(
    pendingKey(owner),
    JSON.stringify({ choices, answers, cards, passportSaved: false, revision: `${Date.now()}:${Math.random()}` }),
  );
  localStorage.setItem(PASSPORT_OWNER, owner);
}
export async function retryPassportSave(owner: string): Promise<void> {
  if (inflight.has(owner)) return inflight.get(owner)!;
  const pending = pendingPassport(owner);
  if (!pending) return;
  const work = (async () => {
    // Yield so the in-flight marker exists before notifying consumers.
    await Promise.resolve();
    changed();
    try {
      if (!pending.passportSaved) {
        await saveAccountPassport(pending.choices, owner);
        pending.passportSaved = true;
        if (pendingPassport(owner)?.revision === pending.revision)
          localStorage.setItem(pendingKey(owner), JSON.stringify(pending));
      }
      if (Object.keys(pending.answers).length)
        await saveAccountQuiz(pending.answers, owner);
      if (pendingPassport(owner)?.revision === pending.revision) localStorage.removeItem(pendingKey(owner));
    } catch {
      throw new Error(
        "Saved on this browser; your account save is incomplete. Try again to finish saving without losing your choices.",
      );
    } finally {
      inflight.delete(owner);
      changed();
    }
  })();
  inflight.set(owner, work);
  return work;
}
export async function finishQuiz(
  answers: Answers,
  cards: string[],
  owner: string | false,
): Promise<Selection[]> {
  const key = JSON.stringify([owner, answers, cards]);
  const pending = owner ? pendingPassport(owner) : null;
  let choices =
    pending &&
    JSON.stringify(pending.cards) === JSON.stringify(cards) &&
    JSON.stringify(pending.answers) === JSON.stringify(answers)
      ? pending.choices
      : resolved.get(key);
  if (!choices) {
    choices = (
      await discovery<{ choices: Selection[] }>({ action: "quiz", cards })
    ).choices;
    resolved.set(key, choices);
  }
  try {
    localStorage.setItem(LIVE_PASSPORT_KEY, JSON.stringify(choices));
    localStorage.setItem(QUIZ_KEY, JSON.stringify(answers));
    if (owner) {
      if (
        !pending ||
        JSON.stringify(pending.cards) !== JSON.stringify(cards) ||
        JSON.stringify(pending.answers) !== JSON.stringify(answers)
      )
        stagePassport(owner, choices, answers, cards);
    } else localStorage.removeItem(PASSPORT_OWNER);
  } catch {
    throw new Error(
      "Browser storage could not save your Passport. Allow site storage and try again.",
    );
  }
  changed();
  if (owner) await retryPassportSave(owner);
  resolved.delete(key);
  return choices;
}

// Deletion must drain this tab's write before deleting the account copy, then
// remove recovery data so it cannot resurrect a deleted Passport.
export async function discardPendingPassport(owner?: string) {
  if (owner) { await inflight.get(owner)?.catch(() => {}); localStorage.removeItem(pendingKey(owner)); }
  if (!owner || localStorage.getItem(PASSPORT_OWNER) === owner) localStorage.removeItem(PASSPORT_OWNER);
  resolved.clear();
}
