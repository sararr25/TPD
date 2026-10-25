import { CITY_PHOTOS } from "./city-photos.ts";

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
