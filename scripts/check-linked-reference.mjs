import assert from "node:assert/strict";
import { lookup, verifySelection } from "../src/lib/server/discovery-service.ts";

// A suggested place can exist by ID without appearing in name-search results.
process.env.QLOO_API_KEY = "synthetic-linked-reference-test";
process.env.QLOO_API_URL = "https://hackathon.api.qloo.com";
delete process.env.DATABASE_URL;
const id = "00000000-0000-4000-8000-000000000991";
const calls = [];
globalThis.fetch = async (url) => {
  calls.push(url.pathname);
  assert.equal(url.hostname, "hackathon.api.qloo.com");
  return Response.json({ results: { entities: url.pathname === "/entities" ? [{
    entity_id: id, name: "Synthetic Gardens", subtype: "urn:entity:place",
    location: { lat: 38.72, lon: -9.14 },
    properties: { address: "Synthetic street, Lisbon", geocode: { city: "Lisbon", country_code: "PT" } },
    tags: [{ id: "urn:tag:genre:place:restaurant", name: "Restaurant", type: "urn:tag:genre:place" }],
  }] : [] } });
};
const result = await lookup("Synthetic Gardens", "place", true, "restaurant", "Lisbon", id);
assert.equal(result.choices.length, 1, "A linked suggested place must remain available when name search is empty");
assert.equal(verifySelection(result.choices[0].token).id, id);
assert.deepEqual(calls, ["/entities"], "Linked references must use their identity, without a name search");
const wrongCity = await lookup("Synthetic Gardens", "place", true, "restaurant", "Paris", id);
assert.equal(wrongCity.choices.length, 0, "An ID must not bypass the city boundary");
const wrongCategory = await lookup("Synthetic Gardens", "place", true, "museum", "Lisbon", id);
assert.equal(wrongCategory.choices.length, 0, "An ID must not bypass category eligibility");
await assert.rejects(lookup("Synthetic Gardens", "place", true, "restaurant", "Lisbon", "bad-id"), e => e.code === "invalid_reference");
console.log("PASS: linked identity survives empty name search; city/category boundaries and invalid IDs remain enforced; no live provider calls.");
