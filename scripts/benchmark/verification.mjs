export const fold = value => String(value || "").normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const cleanAddress = value => fold(value).replace(/\bfrance\b/g, "").replace(/\s+/g, " ").trim();
export function resolveExact(item, candidates) {
  const unique = [...new Map(candidates.filter(e => fold(e.name) === fold(item.name)).map(e => [e.id, e])).values()];
  if (unique.length === 1) {
    if (addressConsistency(item.address, unique[0].address) === "fail")
      return { entity: null, candidate: unique[0], status: "address_conflict" };
    return { entity: unique[0], status: "resolved_exact_name" };
  }
  if (unique.length > 1 && item.address) {
    const addressMatches = unique.filter(e => e.address && cleanAddress(e.address) === cleanAddress(item.address));
    if (addressMatches.length === 1) return { entity: addressMatches[0], status: "resolved_exact_name_and_address" };
  }
  return { entity: null, status: unique.length ? "ambiguous" : "unresolved" };
}
export function addressConsistency(reported, provider) {
  if (!reported || !provider) return "unknown";
  if (cleanAddress(reported) === cleanAddress(provider)) return "pass";
  const postal = value => String(value).match(/\b\d{5}\b/)?.[0];
  const number = value => String(value).trim().match(/^(\d+)\b/)?.[1];
  if (postal(reported) && postal(provider) && postal(reported) !== postal(provider)) return "fail";
  if (number(reported) && number(provider) && number(reported) !== number(provider)) return "fail";
  return "unknown"; // Renamed streets, aliases and formatting differences are not invented contradictions.
}
export function verifyItem(item, input, referenceId, excludedTags, candidates) {
  const resolution = resolveExact(item, candidates), e = resolution.entity;
  const bool = value => value ? "pass" : "fail";
  const checks = {
    category: "unknown", inParisFrance: "unknown", coordinatesPresent: "unknown",
    providerAddressPresent: "unknown", referenceExcluded: fold(item.name) === fold(input.reference.name) ? "fail" : "unknown",
    notFlaggedClosed: "unknown", budget: input.maxPriceTier ? "unknown" : "not_applicable",
    excludedTags: excludedTags.length ? "unknown" : "not_applicable",
  };
  if (e) {
    const genres = e.tags.filter(t => t.id.startsWith("urn:tag:genre:place:"));
    checks.category = genres.length ? bool(genres.some(t => t.id === `urn:tag:genre:place:${input.category}`)) : "unknown";
    checks.inParisFrance = !e.city || !e.country ? "unknown" : bool(e.city === "Paris" && e.country === "FR");
    checks.coordinatesPresent = Number.isFinite(e.lat) && Number.isFinite(e.lon) ? "pass" : "unknown";
    checks.providerAddressPresent = e.address ? "pass" : "unknown";
    checks.referenceExcluded = bool(e.id !== referenceId && fold(e.name) !== fold(input.reference.name));
    checks.notFlaggedClosed = bool(!e.closed); // Absence of a closed flag is not current opening-status verification.
    if (input.maxPriceTier) checks.budget = Number.isFinite(e.price) ? bool(e.price <= input.maxPriceTier) : "unknown";
    if (excludedTags.length) checks.excludedTags = bool(!e.tags.some(t => excludedTags.includes(t.id)));
  }
  const states = Object.values(checks);
  return {
    resolution: resolution.status, entityId: e?.id || null, checks,
    allHardMetadataConstraints: states.includes("fail") ? "fail" : states.includes("unknown") ? "unknown" : "pass",
    reportedAddressConsistency: e || resolution.candidate ? addressConsistency(item.address, (e || resolution.candidate).address) : "unknown",
    basis: "Common Qloo search metadata; no operational or cultural-quality verification",
  };
}
export function verificationSummary(rows) {
  return Object.fromEntries(["tpd", "llm", "search"].map(condition => {
    const subset = rows.filter(r => r.condition === condition);
    const counts = key => Object.fromEntries(["pass", "fail", "unknown"].map(state => [state, subset.filter(r => r[key] === state).length]));
    return [condition, { items: subset.length, resolved: subset.filter(r => r.entityId).length, hardMetadataConstraints: counts("allHardMetadataConstraints"), reportedAddressConsistency: counts("reportedAddressConsistency") }];
  }));
}
