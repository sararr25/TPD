import assert from "node:assert/strict";
import {
  validRestaurant,
  validPlace,
  placeCategory,
  selectRoles,
  chipTags,
  anchorCuisines,
  parseLivePassport,
} from "../src/lib/discovery.ts";
import { normalizeEntity, entities, qloo } from "../src/lib/server/qloo.ts";
import {
  selection,
  verifySelection,
  verifySavedSelection,
  swap,
  lookup,
} from "../src/lib/server/discovery-service.ts";
process.env.QLOO_API_KEY = "unit-test-only-not-a-real-credential";
process.env.QLOO_API_URL = "https://hackathon.api.qloo.com";
const uid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const tag = {
  id: "urn:tag:genre:place:restaurant",
  name: "Restaurant",
  type: "urn:tag:genre:place",
};
const make = (n, extra = {}) => ({
  id: uid(n),
  name: `Fictional ${n}`,
  type: "place",
  address: "Synthetic address",
  city: "Paris",
  country: "FR",
  lat: 48.85,
  lon: 2.35,
  price: 2,
  popularity: n / 10,
  tags: [tag],
  closed: false,
  evidence: [],
  ...extra,
});
const ref = make(1),
  a = make(2, { lat: 48.86 }),
  b = make(3, { lat: 48.851 }),
  c = make(4, { popularity: 0.01, lat: 48.87 }),
  outside = make(5, { city: "Other city" });
assert(validRestaurant(a, "Paris", 2));
assert(!validRestaurant(outside, "Paris"));
assert(!validRestaurant(make(5, { country: "US" }), "Paris"));
assert(!validRestaurant(make(5, { price: null }), "Paris", 2));
assert(!validRestaurant(make(5, { closed: true }), "Paris"));
assert(!validRestaurant(make(5, { tags: [] }), "Paris"));
const excluded = {
  id: "urn:tag:ambience:qloo:fictional",
  name: "Fictional",
  type: "urn:tag:ambience:qloo",
};
assert(
  !validRestaurant(make(5, { tags: [tag, excluded] }), "Paris", undefined, [
    excluded.id,
  ]),
);
const roles = selectRoles([ref, a, a, b, c], ref, []);
assert.equal(roles.length, 3);
assert.deepEqual(
  roles.map((x) => x.place.id),
  [a.id, b.id, c.id],
);
assert.equal(selectRoles([a], ref, []).length, 1);
// Swap chips (docs/21 A1): a pizzeria's chips start with pizza, drinks last
// and at most one, generic tags dropped, one chip per name.
const t = (type, slug, name) => ({ id: `urn:tag:${type}:${slug}`, name, type: `urn:tag:${type}` });
const pizzeria = make(6, {
  name: "Fictional Pizzeria",
  tags: [
    tag,
    t("offerings:place", "cocktails", "Cocktails"),
    t("offerings:place", "beer", "Beer"),
    t("beverage_offering:qloo", "craft_beer", "Craft beer"),
    t("beverage_offering:qloo", "natural_wine", "Natural wine"),
    t("specialty_dish:place", "pizza", "Pizza"),
    t("ambience:qloo", "casual", "Casual"),
    t("cuisine:qloo", "pizza", "Pizza"),
    t("cuisine:qloo", "italian", "Italian"),
    t("offerings:place", "vegetarian_options", "Vegetarian options"),
  ],
});
const chips = chipTags(pizzeria);
assert.deepEqual(chips.map((c) => c.name), ["Pizza", "Italian", "Casual", "Vegetarian options", "Craft beer"]);
// "Why" (docs/21 A2): shared features, never the starting place or a film
// for a restaurant; one Passport name for a museum.
const film = make(7, { name: "Fictional Film", type: "movie" });
const other = make(8, {
  name: "Fictional Trattoria",
  tags: [tag, t("cuisine:qloo", "pizza", "Pizza"), t("ambience:qloo", "casual", "Casual")],
  evidence: [pizzeria.id.toUpperCase(), film.id.toUpperCase()],
});
const [pick] = selectRoles([other], pizzeria, [pizzeria, film]);
assert.equal(pick.why, "Like Fictional Pizzeria: pizza, casual.");
assert(!pick.why.includes("Fictional Film"));
const museumGenre = { id: "urn:tag:genre:place:museum", name: "Museum", type: "urn:tag:genre:place" };
const [art] = selectRoles(
  [{ ...other, tags: [museumGenre] }],
  { ...pizzeria, name: "Fictional Museum", tags: [museumGenre] },
  [pizzeria, film],
  "museum",
);
assert.equal(art.why, "A close match to Fictional Museum for your taste. Fits your taste for Fictional Film.");
// Swap anchor (docs/21 A3): the cuisine the place's dishes mention most,
// unless the user kept or changed a cuisine.
const fourPs = make(9, {
  tags: [
    tag,
    t("cuisine:qloo", "fusion", "Fusion"),
    t("category:place", "fusion_restaurant", "Fusion restaurant"),
    t("cuisine:qloo", "pizza", "Pizza"),
    t("specialty_dish:place", "cheese_pizza", "Cheese pizza"),
    t("menu_highlight:qloo", "4_cheese_pizza", "4 cheese pizza"),
  ],
});
assert.deepEqual(chipTags(fourPs).map((c) => c.name).slice(0, 2), ["Pizza", "Fusion"]);
const pizzaId = "urn:tag:cuisine:qloo:pizza", fusionId = "urn:tag:cuisine:qloo:fusion";
assert.deepEqual(anchorCuisines(fourPs, [], [], "restaurant").map((c) => c.id), [pizzaId]);
assert.deepEqual(anchorCuisines(fourPs, [fusionId], [], "restaurant").map((c) => c.id), [fusionId]);
assert.deepEqual(anchorCuisines(fourPs, [], [pizzaId], "restaurant").map((c) => c.id), [fusionId]);
assert.deepEqual(anchorCuisines(fourPs, [], [], "museum"), []);
assert.deepEqual(parseLivePassport("null"), []);
assert.equal(parseLivePassport(JSON.stringify([a, a, b])).length, 2);
const normalized = normalizeEntity({
  entity_id: a.id,
  name: a.name,
  types: ["urn:entity:place"],
  location: { lat: 48, lon: 2 },
  properties: {
    address: "Synthetic",
    geocode: { city: "Paris" },
    is_closed: true,
    images: [{ url: "http://insecure.example/a.jpg" }, { url: "https://images.qloo.com/a.jpg" }],
  },
  tags: [{ tag_id: tag.id, name: tag.name, type: tag.type }],
  query: {
    explainability: {
      warning: "unavailable",
      "signal.interests.entities": [{ entity_id: ref.id }],
    },
  },
});
assert(normalized.closed);
assert.equal(normalized.tags[0].id, tag.id);
assert.deepEqual(normalized.evidence, []);
assert.equal(normalized.image, "https://images.qloo.com/a.jpg");
assert.equal(normalizeEntity({ entity_id: a.id, name: a.name }).image, null);
assert.deepEqual(entities({ results: "unexpected" }), []);
const signed = selection(ref);
assert.equal(verifySelection(signed.token).id, ref.id);
assert.throws(() => verifySelection(signed.token + "tampered"));
// Saved lists (docs/22): an expired but genuine selection is accepted only
// when saving to a list; tampering is refused everywhere, and .map() cannot
// pass an index that would relax the expiry for Passports.
const realNow = Date.now;
Date.now = () => realNow() + 3 * 24 * 3600000;
try {
  assert.throws(() => verifySelection(signed.token), (e) => e.code === "expired_selection");
  assert.throws(() => [signed.token, signed.token].map(verifySelection), (e) => e.code === "expired_selection");
  assert.equal(verifySavedSelection(signed.token).id, ref.id);
  assert.throws(() => verifySavedSelection(signed.token + "tampered"), (e) => e.code === "invalid_selection");
} finally {
  Date.now = realNow;
}
assert.throws(
  () => verifySelection(""),
  (e) => e.code === "invalid_selection",
);
await assert.rejects(
  swap(signed.token, [], [], undefined),
  (e) => e.code === "invalid_passport",
);
const passport = [2, 3, 4].map((n) =>
  selection(make(n, { type: "artist", tags: [] })),
);
let calls = 0;
const raw = (e) => ({
  entity_id: e.id,
  name: e.name,
  subtype: "urn:entity:place",
  popularity: e.popularity,
  location: { lat: e.lat, lon: e.lon },
  properties: {
    address: e.address,
    geocode: { city: e.city, country_code: e.country },
    price_level: e.price,
  },
  tags: e.tags,
});
globalThis.fetch = async (url, options) => {
  if (url.hostname === "nominatim.openstreetmap.org") return Response.json([]);
  calls++;
  assert.equal(url.hostname, "hackathon.api.qloo.com");
  assert.equal(options.redirect, "error");
  assert.equal(options.cache, "no-store");
  assert.equal(url.searchParams.get("filter.location.radius"), "0");
  return Response.json({
    results: { entities: [ref, a, a, b, c, outside].map(raw) },
    query: { localities: { filter: [{ name: "Paris" }] } },
  });
};
const params = { "filter.location.radius": "0", test: "synthetic" };
await Promise.all([qloo("/v2/insights", params), qloo("/v2/insights", params)]);
assert.equal(calls, 1);
await qloo("/v2/insights", params);
assert.equal(calls, 1);
const result = await swap(
  signed.token,
  passport.map((s) => s.token),
  [],
  2,
);
assert.equal(result.results.length, 3);
assert(result.results.every((r) => r.place.city === "Paris"));
assert.equal(result.verification, "L0");
assert(result.results.every((r) => r.check.status === "not_found" && r.check.source === "OpenStreetMap"));
await assert.rejects(
  swap(
    signed.token,
    passport.map((s) => s.token),
    [{ tagId: "not-from-reference", mode: "keep" }],
    2,
  ),
  (e) => e.code === "invalid_chips",
);
console.log(
  "PASS: city/category/budget/exclusion filters, distinct roles, signed selections, malformed data, warning handling, cache and in-flight deduplication; no live Qloo calls.",
);

// A restaurant selection cannot be reused as a museum reference, even if signed.
const museumTag = { ...tag, id: "urn:tag:genre:place:museum", name: "Museum" };
const museum = make(10, { tags: [museumTag, excluded], price: null });
assert(validPlace(museum, "Paris", "museum"));
assert(!validPlace(a, "Paris", "museum"));
assert(!validPlace(museum, "Paris", "restaurant"));
assert(!validPlace({ ...museum, type: "artist" }, "Paris", "museum"));
assert.equal(placeCategory("hotel"), null);
const museumToken = selection(museum).token;
const tokens = passport.map(s => s.token);
await assert.rejects(swap(signed.token, tokens, [], undefined, "museum"), e => e.code === "invalid_reference");
await assert.rejects(swap(museumToken, tokens, [], 2, "museum"), e => e.code === "invalid_budget");
await assert.rejects(swap(museumToken, tokens, [], undefined, "hotel"), e => e.code === "invalid_category");
await assert.rejects(lookup("Synthetic", "place", true, "hotel"), e => e.code === "invalid_category");
const museums = [11, 12, 13].map(n => make(n, { tags: [museumTag], price: null }));
globalThis.fetch = async (url) => {
  if (url.hostname === "nominatim.openstreetmap.org") return Response.json([]);
  assert.equal(url.searchParams.get("filter.tags"), museumTag.id);
  assert.equal(url.searchParams.get("filter.price_level.max"), null);
  assert.equal(url.searchParams.get("signal.interests.entities"), [museum.id, ...passport.map(s => s.entity.id)].join(","));
  assert.equal(url.searchParams.get("filter.exclude.tags"), excluded.id);
  return Response.json({
    results: { entities: [museum, ...museums, a, make(14, { tags: [museumTag], city: "Other" })].map(raw) },
    query: { localities: { filter: [{ name: "Paris" }] } },
  });
};
const transfer = await swap(museumToken, tokens, [{ tagId: excluded.id, mode: "change" }], undefined, "museum");
assert.equal(transfer.results.length, 3);
assert.equal(transfer.category, "museum");
assert.equal(transfer.discarded, 3);
assert(transfer.results.every(r => r.place.tags.some(t => t.id === museumTag.id)));
assert(!transfer.results[0].different.includes("Qloo price tier"));
console.log("PASS: museum Transfer preserves Passport signals, validates category/reference, rejects restaurant budgets, filters wrong category/city, and selects distinct L0 roles.");
globalThis.fetch = async (url) => {
  // Keep is applied to Qloo's answer, not sent (Qloo ignores it next to entities, docs/18).
  assert.equal(url.searchParams.get("signal.interests.tags"), null);
  assert.equal(url.searchParams.get("filter.exclude.tags"), null);
  return Response.json({ results: { entities: [] }, query: { localities: { filter: [{ name: "Paris" }] } } });
};
const noMatches = await swap(museumToken, tokens, [{ tagId: excluded.id, mode: "keep" }], undefined, "museum");
assert.deepEqual(noMatches.results, []);
assert.equal(noMatches.candidateCount, 0);
globalThis.fetch = async () => Response.json({ results: { entities: museums.map(raw) }, query: {} });
// A distinct request (one hidden place), so the cache cannot answer it.
await assert.rejects(swap(museumToken, tokens, [], undefined, "museum", [uid(99)]), e => e.code === "location_unconfirmed");
// Keep with 3+ matching candidates: every role has the kept feature.
const kept = [21, 22, 23].map(n => make(n, { tags: [museumTag, excluded] }));
globalThis.fetch = async (url) => {
  if (url.hostname === "nominatim.openstreetmap.org") return Response.json([]);
  return Response.json({ results: { entities: [...museums, ...kept].map(raw) }, query: { localities: { filter: [{ name: "Paris" }] } } });
};
// Distinct hidden lists keep these requests out of the cache.
const keptSwap = await swap(museumToken, tokens, [{ tagId: excluded.id, mode: "keep" }], undefined, "museum", [uid(98)]);
assert.equal(keptSwap.keepMatched, 3);
assert.equal(keptSwap.results.length, 3);
assert(keptSwap.results.every(r => r.place.tags.some(t => t.id === excluded.id)));
// Fewer than 3: the matching ones lead, the rest fill in.
globalThis.fetch = async (url) => {
  if (url.hostname === "nominatim.openstreetmap.org") return Response.json([]);
  return Response.json({ results: { entities: [...museums, kept[0]].map(raw) }, query: { localities: { filter: [{ name: "Paris" }] } } });
};
const fewKept = await swap(museumToken, tokens, [{ tagId: excluded.id, mode: "keep" }], undefined, "museum", [uid(97)]);
assert.equal(fewKept.keepMatched, 1);
assert.equal(fewKept.results[0].place.id, kept[0].id);
console.log("PASS: museum Keep filters Qloo's answer locally (all roles when 3+ match, first otherwise), empty responses remain empty, and unconfirmed localities fail closed.");

// Category cleaning (docs/18): hotels, shops-only, schools and canteens are not restaurants.
{
  const { offCategory } = await import("../src/lib/discovery.ts");
  const place = (...ids) => ({ tags: ids.map((id) => ({ id })) });
  const g = (x) => "urn:tag:genre:place:" + x;
  assert.equal(offCategory(place(g("restaurant"), g("restaurant:french")), "restaurant"), false);
  assert.equal(offCategory(place(g("restaurant"), g("hotel")), "restaurant"), true);
  assert.equal(offCategory(place(g("restaurant"), g("toy_store")), "restaurant"), true);
  assert.equal(offCategory(place(g("restaurant"), g("restaurant:cafeteria")), "restaurant"), true);
  assert.equal(offCategory(place(g("restaurant"), g("restaurant:cafeteria"), g("restaurant:vietnamese")), "restaurant"), false);
  assert.equal(offCategory(place(g("restaurant"), g("shopping"), g("market")), "restaurant"), false);
  assert.equal(offCategory(place(g("museum"), g("hotel")), "museum"), false);
}

// Swap cities (docs/17 D1): country must match and the place's city must be one the city accepts.
{
  const { inCity, swapCity } = await import("../src/lib/discovery.ts");
  assert.equal(swapCity("Tokyo"), "Tokyo");
  assert.equal(swapCity("Atlantis"), null);
  assert.equal(swapCity("toString"), null);
  assert.equal(inCity({ city: "Paris", country: "FR" }, "Paris"), true);
  assert.equal(inCity({ city: "Paris", country: "US" }, "Paris"), false);
  assert.equal(inCity({ city: "Shibuya", country: "JP" }, "Tokyo"), true);
  assert.equal(inCity({ city: "Chūō", country: "JP" }, "Tokyo"), true);
  assert.equal(inCity({ city: "Yokohama", country: "JP" }, "Tokyo"), false);
  assert.equal(inCity({ city: "Hà Nội", country: "VN" }, "Hanoi"), true);
  assert.equal(inCity({ city: "Lordelo do Ouro e Massarelos", country: "PT" }, "Porto"), true);
  assert.equal(inCity({ city: "Sintra (Santa Maria e São Miguel)", country: "PT" }, "Lisbon"), false);
  assert.equal(inCity({ city: "East Hampton", country: "US" }, "New York"), false);
}

// Explore (docs/17 D2): category tag, city, address and coordinates required; bars use restaurant cleaning.
{
  const { explorePlace, exploreCategory } = await import("../src/lib/discovery.ts");
  assert.equal(exploreCategory("bar"), "bar");
  assert.equal(exploreCategory("neighbourhood"), "neighbourhood");
  assert.equal(exploreCategory("toString"), null);
  const base = { type: "place", closed: false, city: "Shibuya", country: "JP", lat: 35.6, lon: 139.7, address: "1-1 Shibuya", price: 2, popularity: 0.5, evidence: [] };
  const tags = (...ids) => ids.map((id) => ({ id, name: id, type: "x" }));
  assert.equal(explorePlace({ ...base, tags: tags("urn:tag:category:place:bar") }, "Tokyo", "bar"), true);
  assert.equal(explorePlace({ ...base, tags: tags("urn:tag:category:place:bar", "urn:tag:genre:place:hotel") }, "Tokyo", "bar"), false);
  assert.equal(explorePlace({ ...base, tags: tags("urn:tag:genre:place:hotel") }, "Tokyo", "hotel"), true);
  assert.equal(explorePlace({ ...base, address: null, tags: tags("urn:tag:genre:place:hotel") }, "Tokyo", "hotel"), false);
  assert.equal(explorePlace({ ...base, tags: tags("urn:tag:genre:place:museum") }, "Osaka", "museum"), false);
}

// Neighbourhoods (docs/18): only localities under the city proper, Latin-script, not counties or boards;
// ranked by the nearest centre of the Passport's places.
{
  const { isNeighbourhood, rankNeighbourhoods, withoutParents } = await import("../src/lib/discovery.ts");
  const loc = (name, ancestors) => ({ name, properties: { ancestors: ancestors.map(([n, l]) => ({ name: n, admin_level: l })) } });
  assert.equal(isNeighbourhood(loc("Le Marais", [["Paris", 8], ["Paris", 7]]), "Paris"), true);
  assert.equal(isNeighbourhood(loc("Paris", [["Paris", 7], ["Paris", 6]]), "Paris"), false);
  assert.equal(isNeighbourhood(loc("Sintra", [["Lisboa", 6]]), "Lisbon"), false);
  assert.equal(isNeighbourhood(loc("Belém", [["Lisboa", 7], ["Lisboa", 6]]), "Lisbon"), true);
  assert.equal(isNeighbourhood(loc("Kings County", [["New York", 5]]), "New York"), false);
  assert.equal(isNeighbourhood(loc("Midtown South Community Council", [["New York", 5]]), "New York"), false);
  assert.equal(isNeighbourhood(loc("Manhattan Community Board 5", [["New York", 5]]), "New York"), false);
  assert.equal(isNeighbourhood(loc("SoHo", [["Manhattan", 7], ["New York", 5]]), "New York"), true);
  assert.equal(isNeighbourhood(loc("Shibuya-ku", [["武蔵国", 4]]), "Tokyo"), true);
  assert.equal(isNeighbourhood(loc("Hachioji", [["武蔵国", 4]]), "Tokyo"), false);
  assert.equal(isNeighbourhood(loc("Marunouchi", [["千代田区", 7]]), "Tokyo"), true);
  assert.equal(isNeighbourhood(loc("大阪城", [["中央区", 8], ["大阪市", 7]]), "Osaka"), false);
  assert.equal(isNeighbourhood(loc("Hoàn Kiếm", [["Hà Nội", 4]]), "Hanoi"), true);
  const at = (id, name, lat, lon) => ({ id, name, lat, lon });
  const hoods = [at("A", "North", 48.88, 2.34), at("B", "South", 48.83, 2.34)];
  const ranked = rankNeighbourhoods(hoods, [
    [at("1", "p1", 48.831, 2.34), at("2", "p2", 48.881, 2.34)],
    [at("3", "p3", 48.832, 2.341), at("4", "far", 40, 2)],
  ]);
  assert.deepEqual(ranked.map((r) => r.hood.id), ["B", "A"]);
  assert.deepEqual(ranked[0].near, ["p1", "p3"]);
  assert.deepEqual(rankNeighbourhoods(hoods, [[at("1", "p1", 48.831, 2.34)], [at("1", "p1", 48.831, 2.34)]])[0].near, ["p1"]);
  assert.deepEqual(rankNeighbourhoods(hoods, [[at("4", "far", 40, 2)]]), []);
  // Baseline: everyone's places sit in South, so this Passport's extra places in North rank first.
  const lift = rankNeighbourhoods(
    hoods,
    [[at("1", "s1", 48.831, 2.34), at("2", "s2", 48.832, 2.34), at("3", "n1", 48.881, 2.34)]],
    [[at("1", "s1", 48.831, 2.34), at("2", "s2", 48.832, 2.34), at("5", "s3", 48.833, 2.34)]],
  );
  assert.deepEqual(lift.map((r) => r.hood.id), ["A", "B"]);
  const lv = (name, level, ancestors = []) => ({ name, properties: { admin_level: level, ancestors: ancestors.map(([n, l]) => ({ name: n, admin_level: l })) } });
  assert.deepEqual(
    withoutParents([lv("Manhattan", 7), lv("SoHo", 10, [["Manhattan", 7]]), lv("Queens", 7), lv("Manhattan", 6)]).map((l) => `${l.name}${l.properties.admin_level}`),
    ["SoHo10", "Queens7", "Manhattan6"],
  );
  console.log("PASS: neighbourhoods keep only localities under the city proper and rank by the Passport's nearby places.");
}
