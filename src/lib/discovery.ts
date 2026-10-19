export type Tag = { id: string; name: string; type: string };
export type Entity = {
  id: string;
  name: string;
  type: string;
  context?: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  lat: number | null;
  lon: number | null;
  price: number | null;
  popularity: number | null;
  tags: Tag[];
  closed: boolean;
  evidence: string[];
};
export type Choice = { tagId: string; mode: "keep" | "change" | "ignore" };
export type Result = {
  role: string;
  place: Entity;
  why: string;
  different: string;
  distanceKm: number | null;
};
export const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const LIVE_PASSPORT_KEY = "tpd-passport-v2";
export function parseLivePassport(raw: string | null): Entity[] {
  try {
    const a: unknown = JSON.parse(raw || "null");
    if (!Array.isArray(a)) return [];
    const unique = new Map<string, Entity>();
    for (const e of a) {
      if (
        e &&
        typeof e === "object" &&
        UUID.test(e.id) &&
        typeof e.name === "string" &&
        e.name.length <= 200 &&
        ["artist", "movie", "book", "place"].includes(e.type) &&
        !unique.has(e.id)
      ) {
        unique.set(e.id, {
          id: e.id,
          name: e.name,
          type: e.type,
          address: null,
          city: null,
          country: null,
          lat: null,
          lon: null,
          price: null,
          popularity: null,
          tags: [],
          closed: false,
          evidence: [],
        });
      }
    }
    return [...unique.values()].slice(0, 5);
  } catch {
    return [];
  }
}
export function distance(a: Entity, b: Entity): number | null {
  if (a.lat === null || a.lon === null || b.lat === null || b.lon === null)
    return null;
  const rad = (n: number) => (n * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) *
      Math.cos(rad(b.lat)) *
      Math.sin(rad(b.lon - a.lon) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
}
export function validRestaurant(
  e: Entity,
  city: string,
  maxPrice?: number,
  exclude: string[] = [],
): boolean {
  return (
    !e.closed &&
    e.city === city &&
    e.country === "FR" &&
    e.tags.some((t) => t.id === "urn:tag:genre:place:restaurant") &&
    e.lat !== null &&
    e.lon !== null &&
    !!e.address &&
    (!maxPrice || (e.price !== null && e.price <= maxPrice)) &&
    !e.tags.some((t) => exclude.includes(t.id))
  );
}
export function selectRoles(
  places: Entity[],
  reference: Entity,
  signals: Entity[],
): Result[] {
  const seen = new Set<string>();
  const pool = places.filter(
    (e) => e.id !== reference.id && !seen.has(e.id) && !!seen.add(e.id),
  );
  if (!pool.length) return [];
  const closest = pool[0];
  const remaining = pool.slice(1);
  const practical = [...remaining]
    .filter((e) => distance(e, reference) !== null)
    .sort((a, b) => distance(a, reference)! - distance(b, reference)!)[0];
  const unexpected = remaining
    .filter((e) => e.id !== practical?.id && e.popularity !== null)
    .sort((a, b) => a.popularity! - b.popularity!)[0];
  return [
    [closest, "Closest cultural match"],
    [practical, "Best practical match"],
    [unexpected, "Unexpected but relevant"],
  ].flatMap(([value, role]) => {
    if (!value || typeof value === "string") return [];
    const e = value as Entity;
    const names = signals
      .filter((s) => e.evidence.includes(s.id.toUpperCase()))
      .map((s) => s.name);
    const km = distance(e, reference);
    return [
      {
        role: role as string,
        place: e,
        why: names.length
          ? `Qloo reports a contribution from: ${names.join(", ")}.`
          : "Qloo ranked this place from your submitted signals; individual contributions were not provided.",
        different:
          role === "Best practical match"
            ? `Nearest remaining candidate to your reference${km !== null ? ` (${km.toFixed(1)} km straight-line)` : ""}. Travel time, hours and availability are not checked.`
            : role === "Unexpected but relevant"
              ? "Lower Qloo popularity among the remaining candidates. This does not measure crowds."
              : `${km !== null ? `About ${km.toFixed(1)} km from your reference, measured in a straight line. ` : "Distance could not be established. "}${e.price !== null && reference.price !== null ? `Qloo price tier ${e.price}, compared with ${reference.price} for the reference.` : "A price-tier comparison is not available."}`,
        distanceKm: km,
      },
    ];
  });
}
