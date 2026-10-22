import { CITIES, UUID } from "./discovery.ts";
import { savedItemCity, type SavedList } from "./saved.ts";

export type SharedTripPlace = { id: string; name: string; city: string | null };
export type SharedTrip = { version: 1; name: string; places: SharedTripPlace[] };
export const MAX_TRIP_PLACES = 100;
export const MAX_TRIP_CODE = 64000;
const INVALID = "This trip link could not be read. Ask the sender for a new link.";
const TOO_LARGE = "This trip is too large to share. Make a shorter trip and try again.";

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function keys(value: Record<string, unknown>, expected: string[]) {
  return Object.keys(value).length === expected.length && expected.every((key) => Object.hasOwn(value, key));
}
function text(value: unknown, max: number): value is string {
  return typeof value === "string" && !!value.trim() && value.length <= max &&
    !/[\u0000-\u001f\u007f]/.test(value);
}

// An exact public schema. Reject unexpected fields so notes, tokens or account
// data cannot quietly travel through either a link or the postcard endpoint.
export function validateSharedTrip(value: unknown): SharedTrip {
  if (!record(value) || !keys(value, ["version", "name", "places"]) || value.version !== 1 ||
      !text(value.name, 60) || !Array.isArray(value.places) || !value.places.length || value.places.length > MAX_TRIP_PLACES)
    throw new Error(INVALID);
  const seen = new Set<string>();
  const places = value.places.map((place): SharedTripPlace => {
    if (!record(place) || !keys(place, ["id", "name", "city"]) ||
        typeof place.id !== "string" || !UUID.test(place.id) || !text(place.name, 200) ||
        !(place.city === null || (typeof place.city === "string" && Object.hasOwn(CITIES, place.city))))
      throw new Error(INVALID);
    const id = place.id.toLowerCase();
    if (seen.has(id)) throw new Error(INVALID);
    seen.add(id);
    return { id, name: place.name, city: place.city as string | null };
  });
  return { version: 1, name: value.name, places };
}

// Deliberately project from Saved instead of serialising a SavedList. Nothing
// else (notes, tokens, addresses, timestamps, account identifiers) is copied.
export function makeSharedTrip(list: SavedList): SharedTrip {
  return validateSharedTrip({
    version: 1,
    name: list.name,
    places: list.items.map((item) => ({ id: item.placeId, name: item.name, city: savedItemCity(item, list.name) })),
  });
}

export function encodeSharedTrip(trip: SharedTrip): string {
  const bytes = new TextEncoder().encode(JSON.stringify(validateSharedTrip(trip)));
  if (bytes.length > MAX_TRIP_CODE * 3 / 4) throw new Error(TOO_LARGE);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  const code = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  if (code.length > MAX_TRIP_CODE) throw new Error(TOO_LARGE);
  return code;
}

export function decodeSharedTrip(code: string): SharedTrip {
  if (!code || code.length > MAX_TRIP_CODE || !/^[A-Za-z0-9_-]+$/.test(code)) throw new Error(INVALID);
  try {
    const binary = atob(code.replace(/-/g, "+").replace(/_/g, "/"));
    const json = new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(binary, (byte) => byte.charCodeAt(0)));
    return validateSharedTrip(JSON.parse(json));
  } catch {
    throw new Error(INVALID);
  }
}
