import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { selection } from "../src/lib/server/discovery-service.ts";
import { saveUserPassport, readUserPassport } from "../src/lib/server/user-passport.ts";

// Offline: input checks run before the database is touched.
process.env.QLOO_API_KEY = "unit-test-only-not-a-real-credential";
delete process.env.DATABASE_URL;
const entity = (name) => ({ id: randomUUID(), name, type: "urn:entity:artist", address: null, city: null, country: null, lat: null, lon: null, price: null, popularity: null, tags: [] });
const tokens = ["A", "B", "C", "D", "E", "F"].map((n) => selection(entity(n)).token);
const code = (c) => (e) => e.code === c;
await assert.rejects(saveUserPassport("u", tokens), code("invalid_passport")); // more than 5
await assert.rejects(saveUserPassport("u", "nope"), code("invalid_passport"));
await assert.rejects(saveUserPassport("u", [tokens[0], tokens[0]]), code("invalid_passport")); // duplicate
const [body, sig] = tokens[0].split(".");
await assert.rejects(saveUserPassport("u", [body + "." + sig.slice(1) + "x"]), code("invalid_selection")); // not signed by us
// Valid input reaches the database, which is required (no silent fallback).
await assert.rejects(saveUserPassport("u", tokens.slice(0, 3)), (e) => e.code === "not_configured" && e.status === 503);
await assert.rejects(readUserPassport("u"), code("not_configured"));
console.log("PASS: account Passport accepts only up to 5 distinct server-signed choices and requires the database.");
