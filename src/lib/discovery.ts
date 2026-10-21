import type { VenueCheck } from "./venue-check.ts";
export type PlaceCategory = "restaurant" | "museum";
export function placeCategory(value: unknown = "restaurant"): PlaceCategory | null {
  return value === "restaurant" || value === "museum" ? value : null;
}
// Swap destinations (docs/17 D1, coverage in docs/18). `locality` is the
// name Qloo confirms in query.localities; `places` are the geocode city
// names accepted for a result (Qloo puts Tokyo places in their ward and
// Porto places in their parish), compared without accents or case.
// `hood` is the city proper among a locality's ancestors (name as Qloo
// writes it, admin level): only localities under it are neighbourhoods,
// which leaves out the region, province and nearby towns (docs/18).
export type City = {
  country: string;
  locality: string;
  places: string[];
  museums: "ok" | "few" | "none";
  hood: { ancestor: RegExp; level: number };
};
export const CITIES: Record<string, City> = {
  Paris: { country: "FR", locality: "Paris", places: ["Paris"], museums: "ok", hood: { ancestor: /^Paris$/, level: 8 } },
  Lisbon: { country: "PT", locality: "Lisbon", places: ["Lisbon"], museums: "ok", hood: { ancestor: /^Lisboa$/, level: 7 } },
  Porto: {
    country: "PT",
    locality: "Porto",
    places: [
      "Cedofeita, Santo Ildefonso, Se, Miragaia, Sao Nicolau e Vitoria",
      "Lordelo do Ouro e Massarelos", "Aldoar, Foz do Douro e Nevogilde",
      "Ramalde", "Bonfim", "Campanha", "Paranhos",
    ],
    museums: "ok", hood: { ancestor: /^Porto$/, level: 7 },
  },
  Barcelona: { country: "ES", locality: "Barcelona", places: ["Barcelona"], museums: "ok", hood: { ancestor: /^Barcelona$/, level: 8 } },
  Madrid: { country: "ES", locality: "Madrid", places: ["Madrid"], museums: "ok", hood: { ancestor: /^Madrid$/, level: 8 } },
  "New York": { country: "US", locality: "New York", places: ["New York"], museums: "ok", hood: { ancestor: /^New York$/, level: 5 } },
  Tokyo: {
    country: "JP",
    locality: "Tokyo",
    places: [
      "Chiyoda", "Chuo", "Minato", "Shinjuku", "Bunkyo", "Taito", "Sumida", "Koto",
      "Shinagawa", "Meguro", "Ota", "Setagaya", "Shibuya", "Nakano", "Suginami",
      "Toshima", "Kita", "Arakawa", "Itabashi", "Nerima", "Adachi", "Katsushika", "Edogawa",
    ],
    museums: "ok", hood: { ancestor: /区$/, level: 7 },
  },
  Osaka: { country: "JP", locality: "Osaka", places: ["Osaka Prefecture"], museums: "few", hood: { ancestor: /^大阪市$/, level: 7 } },
  "Ho Chi Minh City": { country: "VN", locality: "Ho Chi Minh City", places: ["Ho Chi Minh City"], museums: "few", hood: { ancestor: /^Thành phố Hồ Chí Minh$/, level: 4 } },
  Hanoi: { country: "VN", locality: "Hà Nội", places: ["Ha Noi"], museums: "few", hood: { ancestor: /^Hà Nội$/, level: 4 } },
  "Phu Quoc": { country: "VN", locality: "Phú Quốc", places: ["Phu Quoc"], museums: "none", hood: { ancestor: /^Phú Quốc$/, level: 6 } },
};
// Explore (docs/17 D2): places for the Passport in a city, no reference.
// Bars have no genre tag of their own in Qloo (docs/18): they use the category tag.
export const EXPLORE_TAGS = {
  restaurant: "urn:tag:genre:place:restaurant",
  bar: "urn:tag:category:place:bar",
  museum: "urn:tag:genre:place:museum",
  hotel: "urn:tag:genre:place:hotel",
} as const;
export type ExplorePlaceCategory = keyof typeof EXPLORE_TAGS;
// Neighbourhoods are Qloo localities, not tagged places.
export type ExploreCategory = ExplorePlaceCategory | "neighbourhood";
export function exploreCategory(value: unknown): ExploreCategory | null {
  return value === "neighbourhood" ||
    (typeof value === "string" && Object.hasOwn(EXPLORE_TAGS, value))
    ? (value as ExploreCategory)
    : null;
}
// A raw Qloo locality, as far as the neighbourhood rule needs it.
export type Locality = {
  name?: unknown;
  properties?: { admin_level?: unknown; ancestors?: { name?: unknown; admin_level?: unknown }[] };
};
// Drops a locality when another one in the list sits inside it (Manhattan
// above SoHo, Hoàn Kiếm above Hàng Bạc): the finer area says more.
export function withoutParents<T extends Locality>(list: T[]): T[] {
  const key = (name: unknown, level: unknown) => `${name}|${level}`;
  const parents = new Set(
    list.flatMap((l) => (l.properties?.ancestors ?? []).map((a) => key(a.name, a.admin_level))),
  );
  return list.filter((l) => !parents.has(key(l.name, l.properties?.admin_level)));
}
// Qloo localities mix real neighbourhoods with provinces, counties and
// nearby towns. Kept: localities under the city proper (`hood`; Tokyo's
// wards also by their own name) with a Latin-script name, minus counties
// and community boards/councils. Most have no Qloo description (Paris).
export function isNeighbourhood(l: Locality, city: string): boolean {
  const c = CITIES[city];
  const name = typeof l.name === "string" ? l.name : "";
  if (!c || !/[a-z]/i.test(name) || /\bcounty\b|community (board|council)/i.test(name)) return false;
  const under = (l.properties?.ancestors ?? []).some(
    (a) => a.admin_level === c.hood.level && typeof a.name === "string" && c.hood.ancestor.test(a.name),
  );
  return under || (c.places.length > 1 && c.places.some((p) => plain(p) === plain(name)));
}
export function explorePlace(e: Entity, city: string, category: ExplorePlaceCategory): boolean {
  return (
    e.type === "place" &&
    !e.closed &&
    inCity(e, city) &&
    e.tags.some((t) => t.id === EXPLORE_TAGS[category]) &&
    e.lat !== null &&
    e.lon !== null &&
    !!e.address &&
    // Restaurant cleaning rules apply to bars too (both are food & drink).
    !((category === "restaurant" || category === "bar") && offCategory(e, "restaurant"))
  );
}
// Neighbourhoods are ranked by the Passport's own places: each place
// counts for the nearest neighbourhood centre within HOOD_KM, weighted by
// its rank in Qloo's answer. Centres are points, so this is "close to",
// not "inside". The same searches without a Passport (`baseline`) say
// where everyone's places land; a neighbourhood ranks by how many more of
// this Passport's places it gets than that baseline predicts (observed
// minus expected, as in lift / TF-IDF), so the city centre every
// Passport shares no longer fills the list.
export const HOOD_SOURCES = ["restaurant", "bar", "museum"] as const;
const HOOD_KM = 1.5;
function hoodPoints(hoods: Entity[], lists: Entity[][]) {
  const score = new Map<string, { points: number; near: string[] }>();
  // A place Qloo lists as both restaurant and bar counts once.
  const counted = new Set<string>();
  for (const list of lists)
    list.forEach((place, rank) => {
      if (counted.has(place.id)) return;
      counted.add(place.id);
      let best: Entity | null = null,
        bestKm = HOOD_KM;
      for (const h of hoods) {
        const km = distance(place, h);
        if (km !== null && km <= bestKm) [best, bestKm] = [h, km];
      }
      if (!best) return;
      const row = score.get(best.id) ?? { points: 0, near: [] };
      row.points += 1 / (1 + rank / 10);
      if (row.near.length < 3) row.near.push(place.name);
      score.set(best.id, row);
    });
  return score;
}
export function rankNeighbourhoods(hoods: Entity[], lists: Entity[][], baseline: Entity[][] = []) {
  const mine = hoodPoints(hoods, lists),
    all = hoodPoints(hoods, baseline);
  const total = (m: Map<string, { points: number }>) => [...m.values()].reduce((n, r) => n + r.points, 0);
  const scale = total(all) ? total(mine) / total(all) : 0;
  return hoods
    .filter((h) => mine.has(h.id))
    .map((hood) => {
      const { points, near } = mine.get(hood.id)!;
      return { hood, near, points, extra: points - scale * (all.get(hood.id)?.points ?? 0) };
    })
    .sort((a, b) => b.extra - a.extra || b.points - a.points)
    .map(({ hood, near }) => ({ hood, near }));
}
export function swapCity(value: unknown = "Paris"): string | null {
  return typeof value === "string" && Object.hasOwn(CITIES, value) ? value : null;
}
const plain = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/-ku$|\s+city$/, "").trim();
export function inCity(e: Pick<Entity, "city" | "country">, city: string): boolean {
  const c = CITIES[city];
  return !!c && e.country === c.country && !!e.city &&
    c.places.some((p) => plain(p) === plain(e.city!));
}
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
  check?: VenueCheck;
  // Signed selection of the place, used to save it or mark it "Not for me".
  token?: string;
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
  return validPlace(e, city, "restaurant", maxPrice, exclude);
}
// Qloo tags some shops, hotels, schools and canteens as restaurants or bars
// (docs/18). A place is off-category when it also carries one of these
// top-level genres, or when "cafeteria" is its only kind of restaurant.
const OFF_CATEGORY = [
  "hotel", "library", "toy_store", "hobby_store", "clothing_store",
  "wedding_service", "educational_institution",
];
export function offCategory(e: Entity, category: PlaceCategory): boolean {
  if (category !== "restaurant") return false;
  const ids = e.tags.map((t) => t.id);
  if (OFF_CATEGORY.some((g) => ids.includes(`urn:tag:genre:place:${g}`))) return true;
  const kinds = ids.filter((id) => id.startsWith("urn:tag:genre:place:restaurant:"));
  return kinds.length > 0 && kinds.every((id) => id.endsWith(":cafeteria"));
}
export function validPlace(
  e: Entity,
  city: string,
  category: PlaceCategory,
  maxPrice?: number,
  exclude: string[] = [],
): boolean {
  return (
    e.type === "place" &&
    !e.closed &&
    inCity(e, city) &&
    e.tags.some((t) => t.id === `urn:tag:genre:place:${category}`) &&
    e.lat !== null &&
    e.lon !== null &&
    !!e.address &&
    (!maxPrice || (e.price !== null && e.price <= maxPrice)) &&
    !e.tags.some((t) => exclude.includes(t.id)) &&
    !offCategory(e, category)
  );
}
export function selectRoles(
  places: Entity[],
  reference: Entity,
  signals: Entity[],
  category: PlaceCategory = "restaurant",
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
          ? `Picked because you like ${names.join(", ")}.`
          : "Picked from your Passport as a whole.",
        different:
          role === "Best practical match"
            ? `The closest of the options to your first choice${km !== null ? ` (${km.toFixed(1)} km as the crow flies)` : ""}. Travel time, hours and availability are not checked.`
            : role === "Unexpected but relevant"
              ? "Less well known than the other options. That says nothing about how busy it is."
              : `${km !== null ? `About ${km.toFixed(1)} km from your first choice as the crow flies. ` : "Distance could not be established. "}${category === "restaurant" && e.price !== null && reference.price !== null ? `Price level ${e.price} of 4, against ${reference.price} for your first choice.` : category === "museum" ? "Admission prices and exhibitions have not been checked." : "Prices could not be compared."}`,
        distanceKm: km,
      },
    ];
  });
}
