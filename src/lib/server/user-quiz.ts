import "server-only";
import { cleanAnswers, type Answers } from "../quiz.ts";
import { db } from "./user-passport.ts";
import { DiscoveryError } from "./qloo.ts";

// The signed-in user's Passport quiz answers (table user_quiz). Only answers
// that fit the current questions are accepted, unchanged.
export async function readUserQuiz(userId: string): Promise<Answers | null> {
  const rows = await db().query("SELECT answers FROM user_quiz WHERE user_id = $1", [userId]);
  return rows.length ? cleanAnswers(rows[0].answers) : null;
}

export async function saveUserQuiz(userId: string, answers: unknown) {
  const clean = cleanAnswers(answers);
  const raw = answers as Record<string, unknown>;
  if (
    !answers ||
    typeof answers !== "object" ||
    Array.isArray(answers) ||
    !Object.keys(clean).length ||
    Object.keys(raw).length !== Object.keys(clean).length ||
    Object.entries(clean).some(([k, v]) => JSON.stringify(v) !== JSON.stringify(raw[k]))
  )
    throw new DiscoveryError("invalid_quiz", 400);
  await db().query(
    `INSERT INTO user_quiz (user_id, answers, updated_at) VALUES ($1, $2, now())
     ON CONFLICT (user_id) DO UPDATE SET answers = excluded.answers, updated_at = now()`,
    [userId, JSON.stringify(clean)],
  );
}

export async function deleteUserQuiz(userId: string) {
  await db().query("DELETE FROM user_quiz WHERE user_id = $1", [userId]);
}
