// Live check of the account feedback (D3) against DATABASE_URL with a temporary
// neon_auth user. Deleting that user must also delete its feedback (cascade).
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { readUserFeedback, saveUserFeedback, deleteUserFeedback } from "../src/lib/server/user-feedback.ts";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
const sql = neon(process.env.DATABASE_URL);
const userId = randomUUID();
await sql.query(`INSERT INTO neon_auth."user" (id, name, email, "emailVerified") VALUES ($1, 'verify', $2, false)`, [userId, `verify-${userId}@example.invalid`]);
const feedback = {
  votes: [{ id: randomUUID(), name: "Test place", vote: 1, tags: [{ id: "urn:tag:offerings:place:natural_wine", name: "Natural wine" }] }],
  dismissed: [],
};
try {
  assert.equal(await readUserFeedback(userId), null);
  await saveUserFeedback(userId, feedback);
  assert.deepEqual(await readUserFeedback(userId), feedback);
  const undone = { ...feedback, dismissed: ["urn:tag:offerings:place:natural_wine"] };
  await saveUserFeedback(userId, undone);
  assert.deepEqual(await readUserFeedback(userId), undone); // replaced, not merged
  await deleteUserFeedback(userId);
  assert.equal(await readUserFeedback(userId), null);
  await saveUserFeedback(userId, feedback);
} finally {
  await sql.query(`DELETE FROM neon_auth."user" WHERE id = $1`, [userId]);
}
const left = await sql.query("SELECT count(*)::int AS n FROM user_feedback WHERE user_id = $1", [userId]);
assert.equal(left[0].n, 0);
console.log("PASS: account feedback save, read, replace, delete, and removal with the user.");
