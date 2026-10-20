import "server-only";
import { createHash } from "node:crypto";
import type { Entity, PlaceCategory } from "../discovery.ts";
import {
  SEARCH_BOX,
  assessVenue,
  unavailableCheck,
  type OsmPlace,
  type VenueCheck,
} from "../venue-check.ts";
import { store } from "./store.ts";

// Nominatim usage policy: max 1 request/second, identifying User-Agent, cache results.
// https://operations.osmfoundation.org/policies/nominatim/
const BASE = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "Beesyde-venue-check/0.1";
const TTL = 24 * 3600 * 1000;
const GAP_MS = 1100;
const MAX_WAIT_MS = 10000;

type Raw = {
  osm_type?: unknown;
  osm_id?: unknown;
  name?: unknown;
  category?: unknown;
  type?: unknown;
  lat?: unknown;
  lon?: unknown;
  address?: { house_number?: unknown; postcode?: unknown };
};
const str = (v: unknown) => (typeof v === "string" && v ? v : null);
export function parseNominatim(data: unknown): OsmPlace[] {
  if (!Array.isArray(data)) throw new Error("nominatim_invalid_response");
  return (data as Raw[]).flatMap((r) => {
    const lat = Number(r.lat),
      lon = Number(r.lon);
    const name = str(r.name),
      osmType = str(r.osm_type),
      category = str(r.category),
      type = str(r.type);
    if (!name || !osmType || !category || !type || typeof r.osm_id !== "number" || !Number.isFinite(lat) || !Number.isFinite(lon))
      return [];
    return [{ osmType, osmId: r.osm_id, name, category, type, lat, lon, houseNumber: str(r.address?.house_number), postcode: str(r.address?.postcode) }];
  });
}

async function search(entity: Entity): Promise<OsmPlace[]> {
  const url = new URL(BASE);
  url.searchParams.set("q", entity.name);
  url.searchParams.set(
    "viewbox",
    [entity.lon! - SEARCH_BOX.lon, entity.lat! + SEARCH_BOX.lat, entity.lon! + SEARCH_BOX.lon, entity.lat! - SEARCH_BOX.lat].map((n) => n.toFixed(5)).join(","),
  );
  url.searchParams.set("bounded", "1");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "10");
  if (process.env.NOMINATIM_EMAIL) url.searchParams.set("email", process.env.NOMINATIM_EMAIL);
  // The contact email is not part of the cache key.
  const key = "nominatim:" + createHash("sha256").update(url.toString().replace(/&email=[^&]*/, "")).digest("hex");
  const hit = await store().get(key);
  if (hit) return hit.data as OsmPlace[];
  const wait = await store().reserve("nominatim", GAP_MS, MAX_WAIT_MS);
  if (wait === null) throw new Error("nominatim_busy");
  await new Promise((r) => setTimeout(r, wait));
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "fr,en" },
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`nominatim_http_${res.status}`);
  const places = parseNominatim(await res.json());
  await store().set(key, { data: places, checkedAt: new Date().toISOString() }, TTL);
  return places;
}

// Checks places one after another (Nominatim allows one request per second).
// A provider failure is reported per place as "unavailable", never hidden.
export async function checkVenues(places: Entity[], category: PlaceCategory): Promise<VenueCheck[]> {
  const out: VenueCheck[] = [];
  for (const place of places) {
    const checkedAt = new Date().toISOString();
    if (place.lat === null || place.lon === null) {
      out.push(assessVenue(place, category, [], checkedAt));
      continue;
    }
    try {
      out.push(assessVenue(place, category, await search(place), checkedAt));
    } catch (error) {
      console.error("[osm] venue check failed", place.name, error instanceof Error ? error.message : error);
      out.push(unavailableCheck(checkedAt));
    }
  }
  return out;
}
