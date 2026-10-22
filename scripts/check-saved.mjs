// Notes can be added after saving (#16): setNote edits a device list in place.
import assert from "node:assert/strict";
import { register } from "node:module";
// src/ imports are extensionless; resolve them to .ts for this check.
register(
  "data:text/javascript," +
    encodeURIComponent(
      `export async function resolve(s, c, n) { try { return await n(s, c); } catch (e) { if (s.startsWith(".")) return n(s + ".ts", c); throw e; } }`,
    ),
);
const store = new Map();
globalThis.localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
const { addToList, setNote, readLocalLists, LISTS_KEY } = await import("../src/lib/saved.ts");
const place = { id: "p1", name: "Time Out Market", address: "Lisbon", lat: 1, lon: 2 };
await addToList("Lisbon trip", place, "tok", "", false);
let lists = readLocalLists(store.get(LISTS_KEY));
assert.equal(lists[0].items[0].note, null);
await setNote(lists[0], place, "tok", " book for Saturday ");
lists = readLocalLists(store.get(LISTS_KEY));
assert.equal(lists[0].items[0].note, "book for Saturday");
await setNote(lists[0], place, "tok", "");
assert.equal(readLocalLists(store.get(LISTS_KEY))[0].items[0].note, null);
await assert.rejects(setNote(lists[0], place, "tok", "x".repeat(281)));
console.log("saved ok");
