import { createHash, randomInt } from "node:crypto";

export const CONDITIONS = ["tpd", "llm", "search"];
// Public scenario definitions, never provider responses or resolved entity IDs.
export const REFERENCES = [
  { key: "baratin", query: "Le Baratin", names: ["Le Baratin"], category: "restaurant", treatment: "budget" },
  { key: "septime", query: "Septime", names: ["Septime"], category: "restaurant", treatment: "change" },
  { key: "orsay", query: "Musée d'Orsay", names: ["Musée d'Orsay"], category: "museum", treatment: "keep" },
  { key: "rodin", query: "Musée Rodin", names: ["Musée Rodin"], category: "museum", treatment: "change" },
];
export const CASES = REFERENCES.flatMap(ref => [0, 1].flatMap(profile =>
  ["baseline", ref.treatment].map(scenario => ({
    id: `${ref.key}-p${profile}-${scenario}`, reference: ref.key, profile,
    category: ref.category, scenario,
  })),
));
export const hash = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");
export function promptFor(input) {
  return [
    "Find up to three distinct alternative places for this traveller. Return fewer, or an empty list, if you cannot recommend responsibly. Do not repeat the reference.",
    JSON.stringify(input, null, 2),
    "Keep is a soft taste preference. Change is an exclusion. Stay in Paris, France, and the specified category. A maximum price tier, if specified, is an indicative 1–4 tier, not a euro price; do not invent missing price evidence.",
    "Give name, address (null if unknown), why, and different for each alternative. Do not claim live hours, prices, crowds, ticket/table availability or independent verification. Do not include scores or percentages.",
    'Return JSON only: {"items":[{"name":"...","address":null,"why":"...","different":"..."}]}',
  ].join("\n\n");
}
export function validateItems(items) {
  if (!Array.isArray(items) || items.length > 3) throw Error("Expected zero to three items");
  const seen = new Set();
  return items.map(item => {
    if (!item || typeof item !== "object") throw Error("Invalid item");
    for (const field of ["name", "why", "different"])
      if (typeof item[field] !== "string" || !item[field].trim() || item[field].length > 3000)
        throw Error(`Invalid ${field}`);
    if (item.address !== null && (typeof item.address !== "string" || item.address.length > 500))
      throw Error("Address must be text or null");
    const key = item.name.trim().toLowerCase();
    if (seen.has(key)) throw Error("Duplicate recommendation");
    seen.add(key);
    return { name: item.name.trim(), address: item.address, why: item.why, different: item.different };
  });
}
export function validateImport(record, inputHash, condition) {
  if (!record || record.inputHash !== inputHash || record.condition !== condition)
    throw Error("Condition or input fingerprint does not match this run");
  const p = record.provenance;
  if (!p || typeof p.source !== "string" || !p.source.trim() || !Number.isFinite(Date.parse(p.collectedAt)))
    throw Error("Source and collection timestamp required");
  if (condition === "llm" && (p.qlooUsed !== false || p.browsing !== false || typeof p.model !== "string" || !p.model.trim()))
    throw Error("LLM baseline requires model, qlooUsed=false, browsing=false");
  if (condition === "search" && (p.qlooUsed !== false || typeof p.query !== "string" || !p.query.trim() || !Array.isArray(p.urls) || !p.urls.length || p.urls.some(url => {
    try { return !["http:", "https:"].includes(new URL(url).protocol); } catch { return true; }
  }))) throw Error("Normal search requires query, source URLs, qlooUsed=false");
  return { ...record, items: validateItems(record.items) };
}
export function report(run, records) {
  const complete = CONDITIONS.every(condition => run.cases.every(c => records[c.id]?.[condition]));
  const conditions = Object.fromEntries(CONDITIONS.map(condition => {
    const rows = run.cases.map(c => records[c.id]?.[condition]).filter(Boolean);
    return [condition, { collected: rows.length, total: run.cases.length, returnedItems: rows.reduce((n, r) => n + r.items.length, 0), emptyCases: rows.filter(r => !r.items.length).length }];
  }));
  return { runId: run.id, complete, conditions, qualityUplift: null, independentOperationalVerification: false };
}
export function blindCase(input, records, shuffle = values => {
  const a = [...values];
  for (let i = a.length - 1; i > 0; i--) { const j = randomInt(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}) {
  if (!CONDITIONS.every(c => records[c])) throw Error("All three conditions required for blind review");
  const order = shuffle(CONDITIONS);
  // Minimal common presentation avoids differences in explanation length or provider wording revealing the source.
  const columns = order.map((condition, index) => ({ label: String.fromCharCode(65 + index), items: records[condition].items.map(({ name, address }) => ({ name, address })) }));
  return { review: { input, columns }, key: Object.fromEntries(order.map((c, i) => [String.fromCharCode(65 + i), c])) };
}

export function profileSensitivity(run, records) {
  const pairs = run.cases.filter(c => c.profile === 0).map(a => {
    const b = run.cases.find(c => c.reference === a.reference && c.scenario === a.scenario && c.profile === 1);
    const first = records[a.id]?.tpd, second = b && records[b.id]?.tpd;
    if (!first || !second) return null;
    const names = row => row.items.map(i => i.name.toLowerCase());
    const x = names(first), y = names(second), union = new Set([...x, ...y]);
    return { topChoiceChanged: x[0] !== y[0], resultSetChanged: [...x].sort().join("|") !== [...y].sort().join("|"), overlap: union.size ? x.filter(n => y.includes(n)).length / union.size : null };
  }).filter(Boolean);
  const overlaps = pairs.map(p => p.overlap).filter(v => v !== null);
  return { pairs: pairs.length, changedTopChoice: pairs.filter(p => p.topChoiceChanged).length, changedResultSet: pairs.filter(p => p.resultSetChanged).length, meanJaccardOverlap: overlaps.length ? overlaps.reduce((a, b) => a + b, 0) / overlaps.length : null, interpretation: "Output sensitivity only; not recommendation quality or independent samples." };
}
export function aggregateVotes(ballots, packet, keys) {
  if (!Array.isArray(ballots)) throw Error("Expected an array of evaluator ballots");
  const ids = new Set(), wins = { tpd: 0, llm: 0, search: 0, tie: 0, none: 0 };
  let comparisons = 0;
  for (const ballot of ballots) {
    if (!ballot || typeof ballot.evaluator !== "string" || !ballot.evaluator.trim() || ids.has(ballot.evaluator) || ballot.packetHash !== packet.packetHash || ballot.blindingDeclared !== true || (!Array.isArray(ballot.votes) || ballot.votes.length === 0)) throw Error("Invalid/duplicate evaluator or mismatched review packet");
    ids.add(ballot.evaluator);
    const cases = new Set();
    for (const vote of ballot.votes) {
      const key = keys[vote.caseId];
      if (!Object.hasOwn(keys, vote.caseId) || !key || cases.has(vote.caseId) || !["A", "B", "C", "tie", "none"].includes(vote.winner)) throw Error("Invalid/duplicate case or winner");
      cases.add(vote.caseId);
      wins[key[vote.winner] || vote.winner]++;
      comparisons++;
    }
  }
  return { evaluators: ids.size, comparisons, possibleComparisons: ids.size * packet.cases.length, preferences: wins, note: "Descriptive votes from declared-blind evaluators; no statistical uplift claim. Empty ballots are not evaluations." };
}
