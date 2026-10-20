import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  UUID,
  selectRoles,
  validPlace,
  placeCategory,
  type PlaceCategory,
  type Entity,
  type Choice,
} from "../discovery.ts";
import {
  qloo,
  entities,
  localityMatches,
  searchEntities,
  DiscoveryError,
} from "./qloo.ts";
import { checkVenues } from "./osm.ts";
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
) {
  const category = placeCategory(categoryValue);
  if (!category) throw new DiscoveryError("invalid_category", 400);
  const result = await searchEntities(query, type);
  const values = reference
    ? result.entities.filter((e) => validPlace(e, "Paris", category))
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
export async function swap(
  referenceToken: unknown,
  passportTokens: unknown,
  values: unknown,
  maxPrice: unknown,
  categoryValue: unknown = "restaurant",
  excludeValue: unknown = [],
) {
  const category = placeCategory(categoryValue);
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
  if (!validPlace(ref, "Paris", category))
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
    "filter.location.query": "Paris",
    "filter.location.radius": "0",
    "filter.tags": `urn:tag:genre:place:${category}`,
    "filter.exclude.entities": [ref.id, ...hidden].join(","),
    "signal.interests.entities": signals.map((e) => e.id).join(","),
    "feature.explainability": "true",
    take: "20",
  };
  if (keep.length) {
    params["signal.interests.tags"] = keep.join(",");
    params["signal.interests.tags.weight"] = "2";
  }
  if (change.length) params["filter.exclude.tags"] = change.join(",");
  if (maxPrice) params["filter.price_level.max"] = String(maxPrice);
  const { data, checkedAt } = await qloo("/v2/insights", params);
  if (!localityMatches(data, "Paris"))
    throw new DiscoveryError("location_unconfirmed", 502);
  const candidates = entities(data);
  const filtered = candidates.filter(
    (e) =>
      !hidden.has(e.id) &&
      validPlace(e, "Paris", category, maxPrice as number | undefined, change),
  );
  const roles = selectRoles(filtered, ref, signals, category);
  const checks = await checkVenues(roles.map((r) => r.place), category);
  return {
    results: roles.map((r, i) => ({ ...r, check: checks[i], token: selection(r.place).token })),
    checkedAt,
    city: "Paris",
    category,
    candidateCount: filtered.length,
    discarded: candidates.length - filtered.length,
    verification: "L0",
    notice:
      "Qloo recommendations, cross-checked by name, category and address against OpenStreetMap. Opening hours, price and availability have not been checked with an operational provider.",
  };
}
