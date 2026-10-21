import "server-only";
import { cleanFeedback, type Feedback } from "../feedback.ts";
import { db } from "./user-passport.ts";
import { DiscoveryError } from "./qloo.ts";

// The signed-in user's gradual feedback (table user_feedback). Stored only as
// cleanFeedback returns it; anything malformed is refused, not trimmed.
export async function readUserFeedback(userId: string): Promise<Feedback | null> {
  const rows = await db().query("SELECT feedback FROM user_feedback WHERE user_id = $1", [userId]);
  return rows.length ? cleanFeedback(rows[0].feedback) : null;
}

export async function saveUserFeedback(userId: string, feedback: unknown) {
  const clean = cleanFeedback(feedback);
  if (!feedback || typeof feedback !== "object" || JSON.stringify(clean) !== JSON.stringify(feedback))
    throw new DiscoveryError("invalid_feedback", 400);
  await db().query(
    `INSERT INTO user_feedback (user_id, feedback, updated_at) VALUES ($1, $2, now())
     ON CONFLICT (user_id) DO UPDATE SET feedback = excluded.feedback, updated_at = now()`,
    [userId, JSON.stringify(clean)],
  );
}

export async function deleteUserFeedback(userId: string) {
  await db().query("DELETE FROM user_feedback WHERE user_id = $1", [userId]);
}
