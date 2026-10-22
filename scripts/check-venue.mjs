import assert from "node:assert/strict";
import {
  assessVenue,
  normalizeName,
  parseAddress,
  unavailableCheck,
} from "../src/lib/venue-check.ts";
import { parseNominatim } from "../src/lib/server/osm.ts";

const at = "2026-10-20T12:00:00.000Z";
const entity = (o = {}) => ({
  id: "00000000-0000-4000-8000-000000000001",
  name: "La Crèmerie",
  type: "urn:entity:place",
  address: "9 Rue des Quatre Vents 75006 Paris France",
  city: "Paris",
  country: "FR",
  lat: 48.8517,
  lon: 2.3378,
  price: 2,
  popularity: 0.5,
  tags: [],
  closed: false,
  evidence: [],
  ...o,
});
const osm = (o = {}) => ({
  osmType: "node",
  osmId: 1,
  name: "La Crèmerie",
  category: "amenity",
  type: "restaurant",
  lat: 48.85168,
  lon: 2.33784,
  houseNumber: "9",
  postcode: "75006",
  ...o,
});

assert.equal(normalizeName("  L'Arpège & Co. "), "l arpege et co");
assert.deepEqual(parseAddress("1-7 Rue Jean Richepin 75116 Paris France"), { from: 1, to: 7, postcode: "75116" });
assert.deepEqual(parseAddress(null), { from: null, to: null, postcode: null });

// Same name, restaurant, same address -> confirmed.
let c = assessVenue(entity(), "restaurant", [osm()], at);
assert.equal(c.status, "confirmed");
assert.equal(c.category, "pass");
assert.equal(c.address, "pass");
assert.equal(c.match.url, "https://www.openstreetmap.org/node/1");
assert(c.match.distanceM < 20);

// The real homonym: the same name near the Qloo point is a cheese shop -> conflict.
c = assessVenue(entity(), "restaurant", [osm({ category: "shop", type: "cheese" })], at);
assert.equal(c.status, "conflict");
assert.equal(c.category, "fail");
assert.match(c.notes[0], /as cheese, rather than a restaurant/);

// House number outside the Qloo range -> address conflict, category still passes.
c = assessVenue(entity(), "restaurant", [osm({ houseNumber: "40" })], at);
assert.equal(c.status, "conflict");
assert.equal(c.category, "pass");
assert.equal(c.address, "fail");
assert.equal(assessVenue(entity({ address: "1-7 Rue X 75006 Paris France" }), "restaurant", [osm({ houseNumber: "5" })], at).address, "pass");

// No address data in OSM -> confirmed on name/category, address unknown.
c = assessVenue(entity(), "restaurant", [osm({ houseNumber: null, postcode: null })], at);
assert.equal(c.status, "confirmed");
assert.equal(c.address, "unknown");

// Same name but too far away, or a different name -> not_found (never "fake").
assert.equal(assessVenue(entity(), "restaurant", [osm({ lat: 48.87 })], at).status, "not_found");
c = assessVenue(entity(), "restaurant", [osm({ name: "Le Comptoir" })], at);
assert.equal(c.status, "not_found");
assert.match(c.notes[0], /not evidence that the place does not exist/);
assert.equal(assessVenue(entity({ lat: null }), "restaurant", [osm()], at).status, "not_found");

// A restaurant and a shop with the same name nearby -> the restaurant is compared.
c = assessVenue(entity(), "restaurant", [osm({ osmId: 2, category: "shop", type: "cheese", lat: 48.8517, lon: 2.3378 }), osm()], at);
assert.equal(c.status, "confirmed");
assert.equal(c.match.osmId, 1);
// Two restaurants with the same name nearby -> ambiguous.
assert.equal(assessVenue(entity(), "restaurant", [osm(), osm({ osmId: 3 })], at).status, "ambiguous");

// Museums accept tourism=museum/gallery, not restaurants.
const rodin = entity({ name: "Musée Rodin", address: "77 Rue de Varenne 75007 Paris France", lat: 48.8547, lon: 2.3159 });
assert.equal(assessVenue(rodin, "museum", [osm({ name: "Musée Rodin", category: "tourism", type: "museum", lat: 48.85475, lon: 2.31587, houseNumber: "77", postcode: "75007" })], at).status, "confirmed");
assert.equal(assessVenue(rodin, "museum", [osm({ name: "Musée Rodin", lat: 48.85475, lon: 2.31587, houseNumber: "77", postcode: "75007" })], at).status, "conflict");

assert.equal(unavailableCheck(at).status, "unavailable");

// Nominatim parsing keeps only well-formed rows and rejects a non-array body.
assert.deepEqual(
  parseNominatim([
    { osm_type: "node", osm_id: 7, name: "X", category: "amenity", type: "cafe", lat: "48.1", lon: "2.1", address: { house_number: "3", postcode: "75001" } },
    { osm_type: "node", osm_id: "bad", name: "Y", category: "amenity", type: "cafe", lat: "48", lon: "2" },
    { osm_type: "way", osm_id: 8, category: "amenity", type: "cafe", lat: "48", lon: "2" },
  ]),
  [{ osmType: "node", osmId: 7, name: "X", category: "amenity", type: "cafe", lat: 48.1, lon: 2.1, houseNumber: "3", postcode: "75001" }],
);
assert.throws(() => parseNominatim({ error: "x" }), /nominatim_invalid_response/);

console.log("venue check: ok");
