// Live check of the account Passport against DATABASE_URL with a temporary
// neon_auth user. Deleting that user must also delete its Passport (cascade).
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { selection, verifySelection } from "../src/lib/server/discovery-service.ts";
import { readUserPassport, saveUserPassport, deleteUserPassport } from "../src/lib/server/user-passport.ts";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
const sql = neon(process.env.DATABASE_URL);
const userId = randomUUID();
const entity = (name) => ({ id: randomUUID(), name, type: "urn:entity:artist", address: null, city: null, country: null, lat: null, lon: null, price: null, popularity: null, tags: [] });
await sql.query(`INSERT INTO neon_auth."user" (id, name, email, "emailVerified") VALUES ($1, 'verify', $2, false)`, [userId, `verify-${userId}@example.invalid`]);
try {
  assert.equal(await readUserPassport(userId), null);
  const picks = ["Khruangbin", "Nina Simone", "Patti Smith"].map((n) => selection(entity(n)));
  await saveUserPassport(userId, picks.map((s) => s.token));
  const saved = await readUserPassport(userId);
  assert.deepEqual(saved.passport.map((s) => s.entity.name), ["Khruangbin", "Nina Simone", "Patti Smith"]);
  assert.match(saved.updatedAt, /^\d{4}-\d{2}-\d{2}T/);
  for (const s of saved.passport) assert.equal(verifySelection(s.token).id, s.entity.id); // freshly signed
  await saveUserPassport(userId, picks.slice(1).map((s) => s.token));
  assert.equal((await readUserPassport(userId)).passport.length, 2); // replaced, not appended
  await deleteUserPassport(userId);
  assert.equal(await readUserPassport(userId), null);
  await saveUserPassport(userId, picks.map((s) => s.token));
} finally {
  await sql.query(`DELETE FROM neon_auth."user" WHERE id = $1`, [userId]);
}
const left = await sql.query("SELECT count(*)::int AS n FROM user_passport WHERE user_id = $1", [userId]);
assert.equal(left[0].n, 0);
console.log("PASS: account Passport save, read (re-signed), replace, delete, and removal with the user.");
