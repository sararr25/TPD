import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  UUID,
  selectRoles,
  validPlace,
  placeCategory,
  swapCity,
  CITIES,
  exploreCategory,
  explorePlace,
  isNeighbourhood,
  withoutParents,
  rankNeighbourhoods,
  HOOD_SOURCES,
  type ExplorePlaceCategory,
  type Locality,
  EXPLORE_TAGS,
  type PlaceCategory,
  type Entity,
  type Choice,
} from "../discovery.ts";
import {
  qloo,
  entities,
  normalizeEntity,
  localityMatches,
  searchEntities,
  DiscoveryError,
} from "./qloo.ts";
import { checkVenues } from "./osm.ts";
import { cleanSignal, feedbackParams, nudge } from "../feedback.ts";
import { ENTITY_CARDS, MAX_ENTITIES, cleanAnswers, buildProfile, qlooParams } from "../quiz.ts";
export type Selection = { entity: Entity; token: string };
const CHIP_TYPE =
  /^urn:tag:(ambience:qloo|cuisine:place|offerings:place|beverage_offering:qloo)$/;
export function chipTags(e: Entity, category: PlaceCategory = "restaurant") {
  const pattern =
    category === "museum"
      ? /^urn:tag:(ambience:qloo|interests:qloo|decor:qloo|activity_type:qloo|visit_intent:qloo)$/
      : CHIP_TYPE;
  return e.tags.filter((t) => pattern.test(t.type)).slice(0, 6);
}
function sign(body: string) {
  if (!process.env.QLOO_API_KEY)
    throw new DiscoveryError("not_configured", 503);
  return createHmac("sha256", process.env.QLOO_API_KEY)
    .update("tpd-selection-v1|" + body)
    .digest("base64url");
}
export function selection(entity: Entity): Selection {
  const body = Buffer.from(
    JSON.stringify({ entity, expires: Date.now() + 24 * 3600000 }),
  ).toString("base64url");
  return { entity, token: body + "." + sign(body) };
}
export function verifySelection(value: unknown): Entity {
  if (typeof value !== "string" || value.length > 20000)
    throw new DiscoveryError("invalid_selection", 400);
  const [body, signature, ...rest] = value.split(".");
  if (
    !body ||
    !signature ||
    !/^[A-Za-z0-9_-]+$/.test(body) ||
    !/^[A-Za-z0-9_-]+$/.test(signature)
  )
    throw new DiscoveryError("invalid_selection", 400);
  const expected = Buffer.from(sign(body));
  const supplied = Buffer.from(signature || "");
  if (
    rest.length ||
    expected.length !== supplied.length ||
    !timingSafeEqual(expected, supplied)
  )
    throw new DiscoveryError("invalid_selection", 400);
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString());
    if (data.expires < Date.now() || !UUID.test(data.entity?.id)) throw Error();
    return data.entity as Entity;
  } catch {
    throw new DiscoveryError("expired_selection", 400);
  }
}
export async function lookup(
  query: string,
  type: string,
  reference = false,
  categoryValue: unknown = "restaurant",
  cityValue: unknown = "Paris",
) {
  const category = placeCategory(categoryValue);
  if (!category) throw new DiscoveryError("invalid_category", 400);
  const city = swapCity(cityValue);
  if (!city) throw new DiscoveryError("invalid_city", 400);
  // A reference is searched inside its city ("Le Baratin Paris").
  const result = await searchEntities(reference ? `${query} ${city}` : query, type);
  const values = reference
    ? result.entities.filter((e) => validPlace(e, city, category))
    : result.entities;
  return {
    choices: values.map((e) =>
      selection(
        reference
          ? {
              ...e,
              tags: [
                ...e.tags.filter(
                  (t) => t.id === `urn:tag:genre:place:${category}`,
                ),
                ...chipTags(e, category),
              ],
            }
          : { ...e, tags: [], evidence: [] },
      ),
    ),
    checkedAt: result.checkedAt,
  };
}
export async function guest(profile:unknown=0) {
  if(profile!==0&&profile!==1)throw new DiscoveryError("invalid_profile",400);
  const choices: Selection[] = [];
  const profiles = [ [["Khruangbin","artist"],["Nina Simone","artist"],["Before Sunrise","movie"]], [["Khruangbin","artist"],["Nina Simone","artist"],["Patti Smith","artist"]] ];
  for (const [query, type] of profiles[profile]) {
    const found = await lookup(query, type);
    const exact = found.choices.filter(
      (c) =>
        c.entity.name.toLowerCase() === query.toLowerCase() &&
        (type !== "movie" || c.entity.context === "1995"),
    );
    if (exact.length !== 1) throw new DiscoveryError("guest_unresolved", 503);
    choices.push(exact[0]);
  }
  return { choices };
}
// Passport quiz: the entity cards the user liked become signed Qloo entities.
// A card counts only when Qloo returns exactly one entity with that name
// (and that year, for films).
export async function quiz(cards: unknown) {
  if (
    !Array.isArray(cards) ||
    cards.length < 1 ||
    cards.length > MAX_ENTITIES ||
    new Set(cards).size !== cards.length ||
    !cards.every((id) => typeof id === "string" && Object.hasOwn(ENTITY_CARDS, id))
  )
    throw new DiscoveryError("invalid_request", 400);
  const choices: Selection[] = [];
  for (const id of cards as string[]) {
    const { name, type, year } = ENTITY_CARDS[id].entity;
    const found = await lookup(name, type);
    const exact = found.choices.filter(
      (c) =>
        c.entity.name.toLowerCase() === name.toLowerCase() &&
        (!year || c.entity.context === year),
    );
    if (exact.length !== 1) throw new DiscoveryError("quiz_unresolved", 503);
    choices.push(exact[0]);
  }
  return { choices };
}
export async function swap(
  referenceToken: unknown,
  passportTokens: unknown,
  values: unknown,
  maxPrice: unknown,
  categoryValue: unknown = "restaurant",
  excludeValue: unknown = [],
  quizValue: unknown = {},
  cityValue: unknown = "Paris",
  feedbackValue: unknown = {},
) {
  const category = placeCategory(categoryValue);
  const city = swapCity(cityValue);
  if (!city) throw new DiscoveryError("invalid_city", 400);
  // Places the user marked "Not for me" (E06), as Qloo place IDs.
  if (
    !Array.isArray(excludeValue) ||
    excludeValue.length > 100 ||
    !excludeValue.every((id) => typeof id === "string" && UUID.test(id))
  )
    throw new DiscoveryError("invalid_request", 400);
  const hidden = new Set<string>(excludeValue);
  if (!category) throw new DiscoveryError("invalid_category", 400);
  const ref = verifySelection(referenceToken);
  if (!validPlace(ref, city, category))
    throw new DiscoveryError("invalid_reference", 400);
  if (
    !Array.isArray(passportTokens) ||
    passportTokens.length < 3 ||
    passportTokens.length > 5
  )
    throw new DiscoveryError("invalid_passport", 400);
  const passport = passportTokens.map(verifySelection);
  if (new Set(passport.map((e) => e.id)).size !== passport.length)
    throw new DiscoveryError("invalid_passport", 400);
  if (!Array.isArray(values) || values.length > 6)
    throw new DiscoveryError("invalid_chips", 400);
  const allowed = new Set(chipTags(ref, category).map((t) => t.id));
  const choices: Choice[] = [];
  for (const value of values) {
    if (
      !value ||
      typeof value !== "object" ||
      !allowed.has(value.tagId) ||
      !["keep", "change", "ignore"].includes(value.mode) ||
      choices.some((c) => c.tagId === value.tagId)
    )
      throw new DiscoveryError("invalid_chips", 400);
    choices.push(value);
  }
  if (
    maxPrice !== undefined &&
    (category !== "restaurant" ||
      !Number.isInteger(maxPrice) ||
      Number(maxPrice) < 1 ||
      Number(maxPrice) > 4)
  )
    throw new DiscoveryError("invalid_budget", 400);
  const keep = choices.filter((c) => c.mode === "keep").map((c) => c.tagId),
    change = choices.filter((c) => c.mode === "change").map((c) => c.tagId);
  const signals = [ref, ...passport];
  const params: Record<string, string> = {
    "filter.type": "urn:entity:place",
    "filter.location.query": city,
    "filter.location.radius": "0",
    "filter.tags": `urn:tag:genre:place:${category}`,
    "filter.exclude.entities": [ref.id, ...hidden].join(","),
    "signal.interests.entities": signals.map((e) => e.id).join(","),
    "feature.explainability": "true",
    take: "20",
  };
  // Strong "less" feedback tags (D3) join the chips the user changed. Kept
  // chips are applied after Qloo answers (it ignores signal.interests.tags
  // next to entity signals, docs/18); strong "more" feedback reorders (nudge).
  const feedback = cleanSignal(feedbackValue);
  const avoidTags = [...new Set([...change, ...feedback.avoid])].filter((t) => !keep.includes(t));
  if (avoidTags.length) params["filter.exclude.tags"] = avoidTags.join(",");
  if (maxPrice) params["filter.price_level.max"] = String(maxPrice);
  // Quiz traits steer popularity and price (C7, docs/18); a budget the user
  // chose here wins over the quiz's price leaning.
  const traits = qlooParams(buildProfile(cleanAnswers(quizValue)), category);
  if (maxPrice) {
    delete traits["filter.price_level.min"];
    delete traits["filter.price_level.max"];
  }
  const run = async (extra: Record<string, string>) => {
    const { data, checkedAt } = await qloo("/v2/insights", { ...params, ...extra });
    if (!localityMatches(data, CITIES[city].locality))
      throw new DiscoveryError("location_unconfirmed", 502);
    const candidates = entities(data);
    const filtered = candidates.filter(
      (e) =>
        !hidden.has(e.id) &&
        validPlace(e, city, category, maxPrice as number | undefined, change),
    );
    return { checkedAt, candidates, filtered };
  };
  let { checkedAt, candidates, filtered } = await run(traits);
  // Too narrow with the quiz traits: fall back to the Passport alone.
  const traitsUsed = Object.keys(traits).length > 0 && filtered.length >= 3;
  if (Object.keys(traits).length && !traitsUsed) ({ checkedAt, candidates, filtered } = await run({}));
  // Keep: with 3+ candidates that have a kept feature, only those compete for
  // the three roles; with fewer, they come first and the rest fill in.
  const hasKeep = (e: Entity) => e.tags.some((t) => keep.includes(t.id));
  const keepMatched = keep.length ? filtered.filter(hasKeep).length : null;
  const pool = !keep.length
    ? filtered
    : keepMatched! >= 3
      ? filtered.filter(hasKeep)
      : [...filtered.filter(hasKeep), ...filtered.filter((e) => !hasKeep(e))];
  const roles = selectRoles(nudge(pool, feedback), ref, signals, category);
  const checks = await checkVenues(roles.map((r) => r.place), category);
  return {
    results: roles.map((r, i) => ({ ...r, check: checks[i], token: selection(r.place).token })),
    checkedAt,
    city,
    category,
    candidateCount: filtered.length,
    traitsUsed,
    keepMatched,
    discarded: candidates.length - filtered.length,
    verification: "L0",
    notice:
      "Qloo recommendations, cross-checked by name, category and address against OpenStreetMap. Opening hours, price and availability have not been checked with an operational provider.",
  };
}

// Explore a city (docs/17 D2): the Passport (+ quiz traits, C7) alone picks
// places in one city and category. Same fallback as Swap when traits leave < 3.
export const EXPLORE_RESULTS = 9;
export const HOOD_RESULTS = 6;
export async function explore(
  passportTokens: unknown,
  cityValue: unknown,
  categoryValue: unknown,
  quizValue: unknown = {},
  excludeValue: unknown = [],
  feedbackValue: unknown = {},
) {
  const city = swapCity(cityValue);
  if (!city) throw new DiscoveryError("invalid_city", 400);
  const category = exploreCategory(categoryValue);
  if (!category) throw new DiscoveryError("invalid_category", 400);
  if (
    !Array.isArray(excludeValue) ||
    excludeValue.length > 100 ||
    !excludeValue.every((id) => typeof id === "string" && UUID.test(id))
  )
    throw new DiscoveryError("invalid_request", 400);
  const hidden = new Set<string>(excludeValue);
  if (
    !Array.isArray(passportTokens) ||
    passportTokens.length < 3 ||
    passportTokens.length > 5
  )
    throw new DiscoveryError("invalid_passport", 400);
  const passport = passportTokens.map(verifySelection);
  if (new Set(passport.map((e) => e.id)).size !== passport.length)
    throw new DiscoveryError("invalid_passport", 400);
  const feedback = cleanSignal(feedbackValue);
  const profile = buildProfile(cleanAnswers(quizValue));
  const search = (c: ExplorePlaceCategory) => explorePlaces(passport, city, c, profile, hidden, feedback);
  if (category === "neighbourhood") {
    const none = cleanSignal({});
    const [hoods, ...picks] = await Promise.all([
      neighbourhoods(city),
      ...HOOD_SOURCES.map((c) => search(c)),
      ...HOOD_SOURCES.map((c) => explorePlaces([], city, c, null, new Set(), none)),
    ]);
    const baseline = picks.splice(HOOD_SOURCES.length);
    return {
      city,
      category,
      checkedAt: picks[0].checkedAt,
      traitsUsed: picks.some((p) => p.traitsUsed),
      results: rankNeighbourhoods(
        hoods.filter((h) => !hidden.has(h.id)),
        picks.map((p) => p.places),
        baseline.map((p) => p.places),
      ).slice(0, HOOD_RESULTS).map(({ hood, near }) => ({
        place: hood,
        token: selection(hood).token,
        near,
      })),
      notice:
        "Neighbourhoods where more of your Qloo restaurants, bars and museums are close to the centre than for a Passport-free search. Qloo itself does not rank neighbourhoods by taste.",
    };
  }
  const { checkedAt, places, traitsUsed } = await search(category);
  return {
    city,
    category,
    checkedAt,
    traitsUsed,
    results: places.slice(0, EXPLORE_RESULTS).map((place) => ({
      place,
      token: selection(place).token,
    })),
    notice:
      "Qloo taste recommendations for your Passport. Opening hours, prices and availability are not verified.",
  };
}
async function explorePlaces(
  passport: Entity[],
  city: string,
  category: ExplorePlaceCategory,
  profile: ReturnType<typeof buildProfile>,
  hidden: Set<string>,
  feedback: ReturnType<typeof cleanSignal>,
) {
  const params: Record<string, string> = {
    "filter.type": "urn:entity:place",
    "filter.location.query": city,
    "filter.location.radius": "0",
    "filter.tags": EXPLORE_TAGS[category],
    take: "30",
  };
  // An empty Passport is the baseline: Qloo's answer for everyone.
  if (passport.length) params["signal.interests.entities"] = passport.map((e) => e.id).join(",");
  if (hidden.size) params["filter.exclude.entities"] = [...hidden].join(",");
  Object.assign(params, feedbackParams(feedback));
  const traits = qlooParams(profile, category);
  const run = async (extra: Record<string, string>) => {
    const { data, checkedAt } = await qloo("/v2/insights", { ...params, ...extra });
    if (!localityMatches(data, CITIES[city].locality))
      throw new DiscoveryError("location_unconfirmed", 502);
    const places = entities(data).filter((e) => !hidden.has(e.id) && explorePlace(e, city, category));
    return { checkedAt, places };
  };
  let { checkedAt, places } = await run(traits);
  const traitsUsed = Object.keys(traits).length > 0 && places.length >= 3;
  if (Object.keys(traits).length && !traitsUsed) ({ checkedAt, places } = await run({}));
  return { checkedAt, traitsUsed, places: nudge(places, feedback) };
}
// The same for every Passport (checked live: Qloo returns localities in
// one order whatever the signal), so no signal is sent and it caches well.
async function neighbourhoods(city: string): Promise<Entity[]> {
  const { data } = await qloo("/v2/insights", {
    "filter.type": "urn:entity:locality",
    "filter.location.query": city,
    "filter.location.radius": "0",
    take: "50",
  });
  if (!localityMatches(data, CITIES[city].locality))
    throw new DiscoveryError("location_unconfirmed", 502);
  const raw = (data as { results?: { entities?: unknown } } | null)?.results?.entities;
  const seen = new Set<string>();
  const kept = withoutParents((Array.isArray(raw) ? raw : []).filter((v: Locality) => isNeighbourhood(v, city)));
  return kept.flatMap((value: Locality) => {
    const e = normalizeEntity(value);
    if (!e || e.lat === null || e.lon === null || seen.has(e.name)) return [];
    seen.add(e.name);
    const about = (value.properties as { short_description?: unknown } | undefined)?.short_description;
    return [{ ...e, type: "locality", context: typeof about === "string" ? about.slice(0, 300) : null }];
  });
}
