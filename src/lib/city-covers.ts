import { CITY_PHOTOS, CITY_PHOTO_EXTRAS } from "./city-photos.ts";

// City identity marks are independent from the approved photographic sources.
export const COVERS: Record<string, { code: string; country: string }> = {
  Lisbon: { code: "LIS", country: "Portugal" },
  Porto: { code: "OPO", country: "Portugal" },
  Paris: { code: "PAR", country: "France" },
  Barcelona: { code: "BCN", country: "Spain" },
  Madrid: { code: "MAD", country: "Spain" },
  Tokyo: { code: "TYO", country: "Japan" },
  "New York": { code: "NYC", country: "USA" },
  Osaka: { code: "OSA", country: "Japan" },
  "Ho Chi Minh City": { code: "SGN", country: "Vietnam" },
  Hanoi: { code: "HAN", country: "Vietnam" },
  "Phu Quoc": { code: "PQC", country: "Vietnam" },
};

// Shared by city covers and explicitly labelled place-photo fallbacks.
export function cityCover(city: string, size: "420x" | "1200x"): string | null {
  const photo = CITY_PHOTOS[city];
  return photo ? photo[size === "1200x" ? "large" : "small"] : null;
}

// Place-photo fallback: the same place always gets the same city photo, different places vary.
export function cityFallback(city: string, size: "420x" | "1200x", seed?: string): string | null {
  const pool = [CITY_PHOTOS[city], ...(CITY_PHOTO_EXTRAS[city] ?? [])].filter(Boolean);
  if (!pool.length) return null;
  let hash = 0;
  for (const char of seed ?? "") hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return pool[hash % pool.length][size === "1200x" ? "large" : "small"];
}
