// Public snapshot contract: private Saved data must never reach a share link or PNG.
import assert from "node:assert/strict";
import { register } from "node:module";
register("data:text/javascript," + encodeURIComponent(
  `export async function resolve(s,c,n){try{return await n(s,c)}catch(e){if(s.startsWith("."))return n(s+".ts",c);throw e}}`,
));
const { makeSharedTrip, encodeSharedTrip, decodeSharedTrip, validateSharedTrip, MAX_TRIP_CODE } = await import("../src/lib/shared-trip.ts");
const id = "96296410-62eb-408e-96c6-fd60aaaf9216";
const list = {
  id: "private-account-id", name: "Lisbon trip", local: false,
  items: [{ placeId: id, name: "Café & Chá <3", note: "PRIVATE NOTE", token: "PRIVATE TOKEN", address: "PRIVATE ADDRESS", savedAt: "PRIVATE TIME", lat: 38.7, lon: -9.1 }],
};
const snapshot = makeSharedTrip(list);
assert.deepEqual(snapshot, { version: 1, name: "Lisbon trip", places: [{ id, name: "Café & Chá <3", city: "Lisbon" }] });
const encoded = encodeSharedTrip(snapshot);
assert.deepEqual(decodeSharedTrip(encoded), snapshot);
const json = JSON.stringify(snapshot);
for (const privateText of ["PRIVATE", "private-account-id", "note", "token", "address", "savedAt", "lat", "lon"])
  assert.ok(!json.includes(privateText), privateText);
assert.throws(() => validateSharedTrip({ ...snapshot, notes: "private" }));
assert.throws(() => validateSharedTrip({ ...snapshot, places: [{ ...snapshot.places[0], token: "secret" }] }));
assert.throws(() => validateSharedTrip({ ...snapshot, places: [{ ...snapshot.places[0], lat: Infinity }] }));
assert.throws(() => validateSharedTrip({ ...snapshot, places: [{ ...snapshot.places[0], city: "Atlantis" }] }));
assert.throws(() => validateSharedTrip({ ...snapshot, places: [{ ...snapshot.places[0], id: "bad/id" }] }));
assert.throws(() => validateSharedTrip({ ...snapshot, places: [snapshot.places[0], { ...snapshot.places[0], id: id.toUpperCase() }] }));
assert.throws(() => validateSharedTrip({ ...snapshot, places: [] }));
assert.throws(() => validateSharedTrip({ ...snapshot, name: "x".repeat(61) }));
assert.throws(() => decodeSharedTrip("x".repeat(MAX_TRIP_CODE + 1)));
assert.throws(() => decodeSharedTrip("not valid!"));
assert.throws(() => decodeSharedTrip(btoa('{"version":1,"name":"t","places":[],"__proto__":{}}')));
console.log("PASS: trip snapshots preserve Unicode, whitelist public fields, omit all private Saved data, and reject oversized/malformed/duplicate/unsupported records.");
