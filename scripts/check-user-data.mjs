import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { selection, swap } from "../src/lib/server/discovery-service.ts";
import { hidePlace, unhidePlace, saveToCollection, removeFromCollection, deleteAccount } from "../src/lib/server/user-data.ts";

// Offline: input checks for hidden places, collections and Swap exclusions
// run before the database or Qloo is touched.
process.env.QLOO_API_KEY = "unit-test-only-not-a-real-credential";
delete process.env.DATABASE_URL;
const place = { id: randomUUID(), name: "Le Baratin", type: "urn:entity:place", address: "3 Rue Jouye-Rouve", city: "Paris", country: "France", lat: 48.87, lon: 2.38, price: 2, popularity: 0.9, tags: [] };
const token = selection(place).token;
const code = (c) => (e) => e.code === c;
const forged = token.slice(0, -2) + "xx";
await assert.rejects(hidePlace("u", forged), code("invalid_selection"));
await assert.rejects(hidePlace("u", { id: place.id }), code("invalid_selection")); // a bare ID is not accepted
await assert.rejects(unhidePlace("u", "not-a-uuid"), code("invalid_request"));
await assert.rejects(saveToCollection("u", "", token), code("invalid_collection"));
await assert.rejects(saveToCollection("u", "   ", token), code("invalid_collection"));
await assert.rejects(saveToCollection("u", "x".repeat(61), token), code("invalid_collection"));
await assert.rejects(saveToCollection("u", "Paris", token, "n".repeat(281)), code("invalid_collection"));
await assert.rejects(saveToCollection("u", "Paris", token, 42), code("invalid_collection"));
await assert.rejects(saveToCollection("u", "Paris", forged), code("invalid_selection"));
await assert.rejects(removeFromCollection("u", "nope", place.id), code("invalid_request"));
await assert.rejects(deleteAccount("nope"), code("invalid_request"));
// Valid input reaches the database, which is required.
await assert.rejects(hidePlace("u", token), code("not_configured"));
await assert.rejects(saveToCollection("u", "Paris", token, "Saturday"), code("not_configured"));
// Swap exclusions must be up to 100 Qloo place IDs.
for (const bad of ["x", ["not-a-uuid"], [42], Array.from({ length: 101 }, randomUUID)])
  await assert.rejects(swap("r", [], [], undefined, "restaurant", bad), code("invalid_request"));
console.log("PASS: hidden places, collections and account deletion accept only server-signed places and valid IDs; Swap exclusions are validated.");
