import { CITIES, UUID } from "./discovery.ts";

// Activity, not proof of travel: opening a guide and saving a place each
// leave one stamp. Reopening/resaving keeps the first date.
export type Stamp =
  | { kind: "city"; city: string; createdAt: string }
  | { kind: "place"; city: string; placeId: string; name: string; createdAt: string };
export const STAMP_LIMIT = 500;
export function stampKey(stamp: Stamp): string {
  return stamp.kind === "city" ? `city:${stamp.city}` : `place:${stamp.placeId.toLowerCase()}`;
}
export function cleanStamp(value: unknown): Stamp | null {
  if (!value || typeof value !== "object") return null;
  const s = value as Record<string, unknown>;
  if (typeof s.city !== "string" || !Object.hasOwn(CITIES, s.city) || typeof s.createdAt !== "string") return null;
  const time = Date.parse(s.createdAt);
  if (!Number.isFinite(time) || time < Date.UTC(2000, 0, 1) || time > Date.UTC(2100, 0, 1)) return null;
  const base = { city: s.city, createdAt: new Date(time).toISOString() };
  if (s.kind === "city") return { kind: "city", ...base };
  if (s.kind !== "place" || typeof s.placeId !== "string" || !UUID.test(s.placeId) || typeof s.name !== "string" || !s.name.trim() || s.name.length > 200) return null;
  return { kind: "place", ...base, placeId: s.placeId.toLowerCase(), name: s.name.trim() };
}
export function mergeStamps(...groups: readonly Stamp[][]): Stamp[] {
  const unique = new Map<string, Stamp>();
  for (const stamp of groups.flat()) {
    const before = unique.get(stampKey(stamp));
    if (!before || stamp.createdAt < before.createdAt) unique.set(stampKey(stamp), stamp);
  }
  return [...unique.values()].sort((a,b) => b.createdAt.localeCompare(a.createdAt) || stampKey(a).localeCompare(stampKey(b))).slice(0, STAMP_LIMIT);
}
export function parseStamps(raw: string | null): Stamp[] {
  try {
    const list: unknown = JSON.parse(raw || "null");
    return Array.isArray(list) ? mergeStamps(list.map(cleanStamp).filter((s): s is Stamp => s !== null)) : [];
  } catch { return []; }
}
