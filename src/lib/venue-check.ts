import type { Entity, PlaceCategory } from "./discovery.ts";

// Second-source check of a Qloo place against OpenStreetMap (Nominatim).
// It never removes or reorders results: it only reports agreement or conflict.
export type CheckStatus =
  | "confirmed" // one nearby OSM place with the same name, right category, no address conflict
  | "conflict" // a nearby OSM place with the same name disagrees on category or address
  | "ambiguous" // several nearby same-name OSM places disagree with each other
  | "not_found" // no same-name OSM place nearby; this does NOT mean the place is fake
  | "unavailable"; // OSM could not be queried
export type OsmPlace = {
  osmType: string;
  osmId: number;
  name: string;
  category: string; // OSM key, e.g. "amenity"
  type: string; // OSM value, e.g. "restaurant"
  lat: number;
  lon: number;
  houseNumber: string | null;
  postcode: string | null;
};
export type VenueCheck = {
  status: CheckStatus;
  source: "OpenStreetMap";
  checkedAt: string;
  category: "pass" | "fail" | "unknown";
  address: "pass" | "fail" | "unknown";
  match: (OsmPlace & { distanceM: number; url: string }) | null;
  notes: string[];
};

// Nominatim search window around the Qloo coordinates (about ±300 m).
export const SEARCH_BOX = { lat: 0.0027, lon: 0.004 };
export const MAX_DISTANCE_M = 250;
const ACCEPTED: Record<PlaceCategory, Record<string, string[]>> = {
  restaurant: {
    amenity: ["restaurant", "fast_food", "cafe", "bar", "pub", "biergarten", "food_court", "ice_cream"],
  },
  museum: { tourism: ["museum", "gallery"], amenity: ["arts_centre"] },
};

export function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’']/g, " ")
    .replace(/&/g, " et ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
export function sameName(a: string, b: string) {
  return normalizeName(a) === normalizeName(b);
}
export function metres(aLat: number, aLon: number, bLat: number, bLon: number) {
  const r = Math.PI / 180;
  const x = (bLon - aLon) * r * Math.cos(((aLat + bLat) / 2) * r);
  const y = (bLat - aLat) * r;
  return Math.sqrt(x * x + y * y) * 6371000;
}
export function categoryMatches(place: OsmPlace, category: PlaceCategory) {
  return (ACCEPTED[category][place.category] || []).includes(place.type);
}
// Qloo addresses look like "1-7 Rue Jean Richepin 75116 Paris France".
export function parseAddress(address: string | null) {
  const number = address?.match(/^\s*(\d+)(?:\s*-\s*(\d+))?/);
  const postcode = address?.match(/\b(\d{5})\b(?=\s+\D)/);
  return {
    from: number ? Number(number[1]) : null,
    to: number ? Number(number[2] || number[1]) : null,
    postcode: postcode ? postcode[1] : null,
  };
}
function addressCheck(entity: Entity, place: OsmPlace): "pass" | "fail" | "unknown" {
  const q = parseAddress(entity.address);
  const results: boolean[] = [];
  if (q.postcode && place.postcode) results.push(q.postcode === place.postcode.replace(/\s/g, ""));
  const osmNumber = place.houseNumber?.match(/^\s*(\d+)/);
  if (q.from !== null && osmNumber) {
    const n = Number(osmNumber[1]);
    results.push(n >= q.from && n <= q.to!);
  }
  if (!results.length) return "unknown";
  return results.every(Boolean) ? "pass" : "fail";
}
export function osmUrl(place: Pick<OsmPlace, "osmType" | "osmId">) {
  return `https://www.openstreetmap.org/${place.osmType}/${place.osmId}`;
}

export function assessVenue(
  entity: Entity,
  category: PlaceCategory,
  candidates: OsmPlace[],
  checkedAt: string,
): VenueCheck {
  const base = { source: "OpenStreetMap" as const, checkedAt };
  if (entity.lat === null || entity.lon === null)
    return { ...base, status: "not_found", category: "unknown", address: "unknown", match: null, notes: ["We had no map position for this place to check against."] };
  const near = candidates
    .filter((c) => sameName(c.name, entity.name))
    .map((c) => ({ ...c, distanceM: Math.round(metres(entity.lat!, entity.lon!, c.lat, c.lon)), url: osmUrl(c) }))
    .filter((c) => c.distanceM <= MAX_DISTANCE_M)
    .sort((a, b) => a.distanceM - b.distanceM);
  if (!near.length)
    return {
      ...base,
      status: "not_found",
      category: "unknown",
      address: "unknown",
      match: null,
      notes: [`No OpenStreetMap place with this exact name within ${MAX_DISTANCE_M} m. OpenStreetMap coverage is incomplete, so this is not evidence that the place does not exist.`],
    };
  const fitting = near.filter((c) => categoryMatches(c, category));
  const match = fitting[0] || near[0];
  const categoryResult = fitting.length ? "pass" : "fail";
  const address = addressCheck(entity, match);
  const notes: string[] = [];
  if (categoryResult === "fail")
    notes.push(`OpenStreetMap lists a nearby place with this name as ${match.type.replace(/_/g, " ")}, rather than a ${category}.`);
  if (address === "fail")
    notes.push("The OpenStreetMap house number or postcode differs from the address we have; it may be another branch or an outdated record.");
  if (address === "unknown") notes.push("OpenStreetMap has no house number or postcode to compare.");
  const kinds = new Set(near.map((c) => `${c.category}=${c.type}`));
  const ambiguous = fitting.length > 1 || (fitting.length === 0 && kinds.size > 1);
  if (ambiguous) notes.push(`${near.length} same-name OpenStreetMap places nearby; the closest fitting one was compared.`);
  const status: CheckStatus =
    categoryResult === "fail" || address === "fail" ? "conflict" : ambiguous ? "ambiguous" : "confirmed";
  return { ...base, status, category: categoryResult, address, match, notes };
}

export function unavailableCheck(checkedAt: string): VenueCheck {
  return {
    status: "unavailable",
    source: "OpenStreetMap",
    checkedAt,
    category: "unknown",
    address: "unknown",
    match: null,
    notes: ["OpenStreetMap could not be reached; this place was not cross-checked."],
  };
}
