import type { VenueCheck } from "./venue-check.ts";
export type PlaceCategory = "restaurant" | "museum";
export function placeCategory(value: unknown = "restaurant"): PlaceCategory | null {
  return value === "restaurant" || value === "museum" ? value : null;
}
// Swap destinations (docs/17 D1, coverage in docs/18). `locality` is the
// name Qloo confirms in query.localities; `places` are the geocode city
// names accepted for a result (Qloo puts Tokyo places in their ward and
// Porto places in their parish), compared without accents or case.
export type City = { country: string; locality: string; places: string[]; museums: "ok" | "few" | "none" };
export const CITIES: Record<string, City> = {
  Paris: { country: "FR", locality: "Paris", places: ["Paris"], museums: "ok" },
  Lisbon: { country: "PT", locality: "Lisbon", places: ["Lisbon"], museums: "ok" },
  Porto: {
    country: "PT",
    locality: "Porto",
    places: [
      "Cedofeita, Santo Ildefonso, Se, Miragaia, Sao Nicolau e Vitoria",
      "Lordelo do Ouro e Massarelos", "Aldoar, Foz do Douro e Nevogilde",
      "Ramalde", "Bonfim", "Campanha", "Paranhos",
    ],
    museums: "ok",
  },
  Barcelona: { country: "ES", locality: "Barcelona", places: ["Barcelona"], museums: "ok" },
  Madrid: { country: "ES", locality: "Madrid", places: ["Madrid"], museums: "ok" },
  "New York": { country: "US", locality: "New York", places: ["New York"], museums: "ok" },
  Tokyo: {
    country: "JP",
    locality: "Tokyo",
    places: [
      "Chiyoda", "Chuo", "Minato", "Shinjuku", "Bunkyo", "Taito", "Sumida", "Koto",
      "Shinagawa", "Meguro", "Ota", "Setagaya", "Shibuya", "Nakano", "Suginami",
      "Toshima", "Kita", "Arakawa", "Itabashi", "Nerima", "Adachi", "Katsushika", "Edogawa",
    ],
    museums: "ok",
  },
  Osaka: { country: "JP", locality: "Osaka", places: ["Osaka Prefecture"], museums: "few" },
  "Ho Chi Minh City": { country: "VN", locality: "Ho Chi Minh City", places: ["Ho Chi Minh City"], museums: "few" },
  Hanoi: { country: "VN", locality: "Hà Nội", places: ["Ha Noi"], museums: "few" },
  "Phu Quoc": { country: "VN", locality: "Phú Quốc", places: ["Phu Quoc"], museums: "none" },
};
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
          ? `Qloo reports a contribution from: ${names.join(", ")}.`
          : "Qloo ranked this place from your submitted signals; individual contributions were not provided.",
        different:
          role === "Best practical match"
            ? `Nearest remaining candidate to your reference${km !== null ? ` (${km.toFixed(1)} km straight-line)` : ""}. Travel time, hours and availability are not checked.`
            : role === "Unexpected but relevant"
              ? "Lower Qloo popularity among the remaining candidates. This does not measure crowds."
              : `${km !== null ? `About ${km.toFixed(1)} km from your reference, measured in a straight line. ` : "Distance could not be established. "}${category === "restaurant" && e.price !== null && reference.price !== null ? `Qloo price tier ${e.price}, compared with ${reference.price} for the reference.` : category === "museum" ? "Admission prices and exhibitions have not been checked." : "A price-tier comparison is not available."}`,
        distanceKm: km,
      },
    ];
  });
}
