import { QUIZ_KEY, type Answers } from "./quiz";
import { LIVE_PASSPORT_KEY } from "./discovery";
import { discovery, type Selection } from "./discovery-client";
import { saveAccountPassport, saveAccountQuiz } from "./account";

// Window event fired after the quiz writes a new Passport. Pages that read the
// Passport from localStorage listen for it (see usePassportVersion).
export const PASSPORT_CHANGED = "tpd:passport-changed";

// The one way the quiz ends, shared by the /passport page and the quiz panel:
// resolve the liked cards into a Passport, keep it on this browser (and on the
// account when signed in), then tell the open page. Errors are thrown, never hidden.
export async function finishQuiz(
  answers: Answers,
  cards: string[],
  signedIn: boolean,
): Promise<Selection[]> {
  const { choices } = await discovery<{ choices: Selection[] }>({ action: "quiz", cards });
  try {
    localStorage.setItem(LIVE_PASSPORT_KEY, JSON.stringify(choices));
    localStorage.setItem(QUIZ_KEY, JSON.stringify(answers));
  } catch {
    throw new Error("Browser storage could not save your Passport. Allow site storage and try again.");
  }
  if (signedIn) {
    await saveAccountPassport(choices);
    await saveAccountQuiz(answers);
  }
  window.dispatchEvent(new Event(PASSPORT_CHANGED));
  return choices;
}
