import { mkdir, readFile, writeFile, rename, open, unlink } from "node:fs/promises";
import { CASES, REFERENCES, CONDITIONS, hash, promptFor, validateItems, validateImport, report, blindCase, profileSensitivity, aggregateVotes } from "./core.mjs";
import { validPlace } from "../../src/lib/discovery.ts";

const [command = "collect", runId = new Date().toISOString().replace(/[:.]/g, "-"), condition, importFile] = process.argv.slice(2);
if (!/^[a-zA-Z0-9_-]{1,100}$/.test(runId)) throw Error("Invalid run ID");
if (!["collect", "report", "import", "blind", "score"].includes(command)) throw Error("Use collect, report, import, blind or score");
const dir = `.private/benchmark/${runId}`;
const origin = "http://127.0.0.1:3000";
await mkdir(dir, { recursive: true, mode: 0o700 });
async function save(name, value) {
  const path = `${dir}/${name}.json`;
  await writeFile(path + ".tmp", JSON.stringify(value, null, 2), { mode: 0o600 });
  await rename(path + ".tmp", path);
}
async function read(name, fallback) {
  try { return JSON.parse(await readFile(`${dir}/${name}.json`, "utf8")); }
  catch (e) { if (e.code === "ENOENT" && fallback !== undefined) return fallback; throw e; }
}
async function api(body) {
  const response = await fetch(origin + "/api/discovery", {
    method: "POST", headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify(body), redirect: "error", signal: AbortSignal.timeout(60000),
  });
  const data = await response.json();
  if (!response.ok) throw Error(`App HTTP ${response.status}: ${data.error || "failed"}; no automatic retry`);
  return data;
}
const lock = await open(`${dir}/.lock`, "wx", 0o600);
try {
  let run = await read("run", null);
  const records = await read("records", {});
  if (command === "collect") {
    if (!run) {
      const guests = [];
      for (const profile of [0, 1]) guests.push((await api({ action: "guest", profile })).choices);
      const references = {};
      for (const spec of REFERENCES) {
        const found = await api({ action: "search", query: spec.query, type: "place", reference: true, category: spec.category });
        const exact = found.choices.filter(s => spec.names.some(name => name.toLowerCase() === s.entity.name.toLowerCase()));
        if (exact.length !== 1) throw Error(`${spec.key}: reference is unresolved or ambiguous; no first-result fallback`);
        references[spec.key] = exact[0];
      }
      run = { version: 1, id: runId, createdAt: new Date().toISOString(), cases: CASES.map(spec => {
        const ref = references[spec.reference];
        const chip = ref.entity.tags.find(t => t.id !== `urn:tag:genre:place:${spec.category}`);
        if (["keep", "change"].includes(spec.scenario) && !chip) throw Error(`${spec.id}: required chip unavailable`);
        const choices = ["keep", "change"].includes(spec.scenario) ? [{ tagId: chip.id, mode: spec.scenario }] : [];
        const input = { city: "Paris", country: "FR", category: spec.category, reference: { name: ref.entity.name, address: ref.entity.address }, passport: guests[spec.profile].map(s => ({ name: s.entity.name, type: s.entity.type, context: s.entity.context || null })), keep: spec.scenario === "keep" ? [chip.name] : [], change: spec.scenario === "change" ? [chip.name] : [], maxPriceTier: spec.scenario === "budget" ? 2 : null };
        return { ...spec, input, inputHash: hash(input), prompt: promptFor(input), request: { action: "swap", category: spec.category, reference: ref.token, passport: guests[spec.profile].map(s => s.token), choices, ...(spec.scenario === "budget" ? { maxPrice: 2 } : {}) } };
      }) };
      await save("run", run);
      await save("baseline-inputs", run.cases.map(({ id, inputHash, input, prompt }) => ({ caseId: id, inputHash, input, prompt })));
    }
    for (const c of run.cases) {
      if (hash(c.input) !== c.inputHash || promptFor(c.input) !== c.prompt) throw Error("Run inputs or prompts have changed");
      if (records[c.id]?.tpd) continue;
      const started = Date.now();
      const result = await api(c.request);
      const excluded = c.request.choices.filter(v => v.mode === "change").map(v => v.tagId);
      const ref = JSON.parse(Buffer.from(c.request.reference.split(".")[0], "base64url").toString()).entity;
      if (result.verification !== "L0" || result.results.some(r => !validPlace(r.place, "Paris", c.category, c.request.maxPrice, excluded) || r.place.id === ref.id) || new Set(result.results.map(r => r.place.id)).size !== result.results.length)
        throw Error(`${c.id}: returned result violated the benchmark contract`);
      const items = validateItems(result.results.map(r => ({ name: r.place.name, address: r.place.address, why: r.why, different: r.different })));
      records[c.id] = { ...records[c.id], tpd: { condition: "tpd", inputHash: c.inputHash, items, provenance: { source: "TPD local /api/discovery", collectedAt: new Date().toISOString(), providerCheckedAt: result.checkedAt }, metadata: { durationMs: Date.now() - started, candidates: result.candidateCount, discarded: result.discarded, qlooMetadataConstraintsPass: true }, response: result } };
      await save("records", records);
      console.log(JSON.stringify({ case: c.id, items: items.length, candidates: result.candidateCount, discarded: result.discarded }));
    }
  }
  if (!run) throw Error("Run collect first");
  for (const c of run.cases) {
    if (hash(c.input) !== c.inputHash || promptFor(c.input) !== c.prompt) throw Error("Run inputs or prompts have changed");
  }
  for (const baseline of ["llm", "search"]) {
    if (await read(`${baseline}-import-template`, null)) continue;
    await save(`${baseline}-import-template`, run.cases.filter(c => !records[c.id]?.[baseline]).map(c => ({ caseId: c.id, condition: baseline, inputHash: c.inputHash, items: [], provenance: { source: "", collectedAt: "", qlooUsed: false, ...(baseline === "llm" ? { model: "", browsing: false } : { query: "", urls: [] }) } })));
  }
  if (command === "import") {
    if (!["llm", "search"].includes(condition) || !importFile) throw Error("Use import RUN_ID llm|search FILE.json");
    const imported = JSON.parse(await readFile(importFile, "utf8"));
    if (!Array.isArray(imported)) throw Error("Expected an array of records");
    const seen = new Set();
    for (const record of imported) {
      const c = run.cases.find(c => c.id === record.caseId);
      if (!c || seen.has(record.caseId) || records[c.id]?.[condition]) throw Error("Unknown, duplicate or already imported case");
      seen.add(record.caseId);
      records[c.id] = { ...records[c.id], [condition]: validateImport(record, c.inputHash, condition) };
    }
    await save("records", records);
  }
  if (command === "blind") {
    const review = [], keys = {};
    for (const c of run.cases) {
      const item = blindCase(c.input, records[c.id] || {});
      review.push({ caseId: c.id, ...item.review }); keys[c.id] = item.key;
    }
    if (await read("blind-review", null)) throw Error("Blind packet already exists; preserve its labels for collected votes");
    const packet = { runId, packetHash: hash(review), cases: review };
    await save("blind-review", packet);
    await save("blind-key-DO-NOT-SHARE", keys);
    await save("ballot-template", { evaluator: "", packetHash: packet.packetHash, blindingDeclared: true, votes: review.map(c => ({ caseId: c.caseId, winner: "", reason: "" })) });
  }
  if (command === "score") {
    if (!condition) throw Error("Use score RUN_ID BALLOTS.json");
    const ballots = JSON.parse(await readFile(condition, "utf8"));
    const votes = aggregateVotes(ballots, await read("blind-review"), await read("blind-key-DO-NOT-SHARE"));
    await save("evaluation-summary", votes);
    console.log(JSON.stringify(votes, null, 2));
  }
  const summary = { ...report(run, records), profileSensitivity: profileSensitivity(run, records) };
  await save("summary", summary);
  console.log(JSON.stringify(summary, null, 2));
  console.log(`Private run: ${dir}`);
} finally {
  await lock.close();
  await unlink(`${dir}/.lock`);
}
