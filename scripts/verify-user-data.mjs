// Live check of hidden places, collections and account deletion against
// DATABASE_URL with a temporary neon_auth user. Deleting the account must
// remove every row that belonged to it (foreign keys cascade).
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { selection } from "../src/lib/server/discovery-service.ts";
import { saveUserPassport } from "../src/lib/server/user-passport.ts";
import {
  listHidden, hidePlace, unhidePlace,
  listCollections, saveToCollection, removeFromCollection, deleteCollection,
  deleteAccount,
} from "../src/lib/server/user-data.ts";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
const sql = neon(process.env.DATABASE_URL);
const userId = randomUUID();
const place = (name) => ({ id: randomUUID(), name, type: "urn:entity:place", address: name + ", Paris", city: "Paris", country: "France", lat: 48.86, lon: 2.35, price: 2, popularity: 0.5, tags: [] });
const [a, b, c] = ["Le Baratin", "Clamato", "Chez Aline"].map((n) => selection(place(n)));
await sql.query(`INSERT INTO neon_auth."user" (id, name, email, "emailVerified") VALUES ($1, 'verify', $2, false)`, [userId, `verify-${userId}@example.invalid`]);
try {
  // Hidden places
  assert.deepEqual(await listHidden(userId), []);
  await hidePlace(userId, a.token);
  await hidePlace(userId, a.token); // twice is fine
  await hidePlace(userId, b.token);
  assert.deepEqual((await listHidden(userId)).map((h) => h.name), ["Le Baratin", "Clamato"]);
  await unhidePlace(userId, b.entity.id);
  assert.deepEqual((await listHidden(userId)).map((h) => h.id), [a.entity.id]);

  // Collections: same name reuses the collection, saving again updates the note
  await saveToCollection(userId, "Paris, October", a.token, "Saturday lunch");
  await saveToCollection(userId, " Paris, October ", b.token, "");
  await saveToCollection(userId, "Paris, October", a.token, "Book first");
  await saveToCollection(userId, "Next time", c.token);
  let list = await listCollections(userId);
  assert.deepEqual(list.map((x) => x.name), ["Paris, October", "Next time"]);
  assert.deepEqual(list[0].items.map((i) => [i.name, i.note]), [["Le Baratin", "Book first"], ["Clamato", null]]);
  assert.equal(list[0].items[0].address, "Le Baratin, Paris");
  assert.match(list[0].items[0].savedAt, /^\d{4}-\d{2}-\d{2}T/);
  await removeFromCollection(userId, list[0].id, b.entity.id);
  // Another user cannot touch these rows
  await removeFromCollection(randomUUID(), list[0].id, a.entity.id);
  await deleteCollection(randomUUID(), list[1].id);
  list = await listCollections(userId);
  assert.deepEqual(list.map((x) => x.items.length), [1, 1]);
  await deleteCollection(userId, list[1].id);
  assert.equal((await listCollections(userId)).length, 1);

  // Account deletion removes everything
  await saveUserPassport(userId, [a.token, b.token, c.token]);
  await deleteAccount(userId);
} finally {
  await sql.query(`DELETE FROM neon_auth."user" WHERE id = $1`, [userId]);
}
const [left] = await sql.query(
  `SELECT (SELECT count(*) FROM neon_auth."user" WHERE id = $1)::int AS users,
          (SELECT count(*) FROM user_passport WHERE user_id = $1)::int AS passports,
          (SELECT count(*) FROM user_hidden_place WHERE user_id = $1)::int AS hidden,
          (SELECT count(*) FROM collection WHERE user_id = $1)::int AS collections`,
  [userId],
);
assert.deepEqual(left, { users: 0, passports: 0, hidden: 0, collections: 0 });
console.log("PASS: hidden places, collections (reuse, note update, remove, ownership) and account deletion with full cascade.");
