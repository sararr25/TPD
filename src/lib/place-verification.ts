import { distance, type Entity, type PlaceCategory } from "./discovery.ts";

export type Check = "pass" | "conflict" | "unknown";
export type PlaceVerification = {
  status: "consistent" | "conflict" | "unknown" | "unavailable";
  reason: string;
  checkedAt: string | null;
  checks: Record<"name" | "address" | "location" | "category" | "notFlaggedClosed", Check>;
};
const fold = (s: string) => s.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const address = (s: string) => fold(s).replace(/\bfrance\b/g, "").replace(/\s+/g, " ").trim();
export function unknownVerification(reason: string, status: "unknown" | "unavailable" = "unknown"): PlaceVerification {
  return { status, reason, checkedAt: null, checks: { name: "unknown", address: "unknown", location: "unknown", category: "unknown", notFlaggedClosed: "unknown" } };
}
export function comparePlace(entity: Entity, category: PlaceCategory, candidates: Entity[], checkedAt: string): PlaceVerification {
  const result = unknownVerification("No unambiguous matching place was found. This does not prove the place is absent.");
  result.checkedAt = checkedAt;
  const names = [...new Map(candidates.filter(p => fold(p.name) === fold(entity.name)).map(p => [p.id, p])).values()];
  const exact = names.filter(p => entity.address && p.address && address(p.address) === address(entity.address));
  const match = exact.length === 1 ? exact[0] : names.length === 1 ? names[0] : null;
  if (!match) return result;
  result.checks.name = "pass";
  if (entity.address && match.address) {
    const number = (s: string) => s.trim().match(/^(\d+\w*)\b/)?.[1]?.toLowerCase();
    const postal = (s: string) => s.match(/\b\d{5}\b/)?.[0];
    result.checks.address = address(entity.address) === address(match.address) ? "pass"
      : (number(entity.address) && number(match.address) && number(entity.address) !== number(match.address)) || (postal(entity.address) && postal(match.address) && postal(entity.address) !== postal(match.address)) ? "conflict" : "unknown";
  }
  const km = distance(entity, { ...entity, lat: match.lat, lon: match.lon });
  result.checks.location = (match.city && fold(match.city) !== "paris") || (match.country && match.country !== "FR") || (km !== null && km > 0.15) ? "conflict"
    : match.city && match.country && km !== null ? "pass" : "unknown";
  // Types only belong to this Qloo place after its address and location agree.
  if (result.checks.address === "pass" && result.checks.location === "pass") {
    const genres = match.tags.filter(t => t.id.startsWith("urn:tag:genre:place:"));
    result.checks.category = genres.some(t => t.id === `urn:tag:genre:place:${category}`) ? "pass" : genres.length ? "conflict" : "unknown";
    result.checks.notFlaggedClosed = match.closed ? "conflict" : "pass";
  }
  const states = Object.values(result.checks);
  result.status = states.includes("conflict") ? "conflict" : states.every(s => s === "pass") ? "consistent" : "unknown";
  result.reason = result.status === "conflict" ? "Provider records disagree. Confirm the venue and address before travelling."
    : result.status === "consistent" ? "Qloo search and recommendation records agree. This is the same source, not independent verification of existence or current operation."
    : "Some details could not be corroborated. Missing data is not evidence of closure or non-existence.";
  return result;
}
