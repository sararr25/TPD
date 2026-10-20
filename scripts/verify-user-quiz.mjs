// Live check of the account quiz answers against DATABASE_URL with a temporary
// neon_auth user. Deleting that user must also delete its answers (cascade).
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { readUserQuiz, saveUserQuiz, deleteUserQuiz } from "../src/lib/server/user-quiz.ts";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
const sql = neon(process.env.DATABASE_URL);
const userId = randomUUID();
await sql.query(`INSERT INTO neon_auth."user" (id, name, email, "emailVerified") VALUES ($1, 'verify', $2, false)`, [userId, `verify-${userId}@example.invalid`]);
try {
  assert.equal(await readUserQuiz(userId), null);
  const answers = { music: ["khruangbin", "nina-simone"], planning: 2, places: ["cafe"] };
  await saveUserQuiz(userId, answers);
  assert.deepEqual(await readUserQuiz(userId), { planning: 2, music: ["khruangbin", "nina-simone"], places: ["cafe"] });
  await saveUserQuiz(userId, { crowds: 5 });
  assert.deepEqual(await readUserQuiz(userId), { crowds: 5 }); // replaced, not merged
  await deleteUserQuiz(userId);
  assert.equal(await readUserQuiz(userId), null);
  await saveUserQuiz(userId, answers);
} finally {
  await sql.query(`DELETE FROM neon_auth."user" WHERE id = $1`, [userId]);
}
const left = await sql.query("SELECT count(*)::int AS n FROM user_quiz WHERE user_id = $1", [userId]);
assert.equal(left[0].n, 0);
console.log("PASS: account quiz save, read, replace, delete, and removal with the user.");
