import { loadEnvFile } from "node:process";
import { readFile, writeFile, mkdir, open, unlink, rename } from "node:fs/promises";
import { searchEntities } from "../../src/lib/server/qloo.ts";
import { CONDITIONS, hash, promptFor } from "./core.mjs";
import { fold, verifyItem, verificationSummary } from "./verification.mjs";
try { loadEnvFile(".env.local"); } catch {}
const [id] = process.argv.slice(2);
if (!id || !/^[a-zA-Z0-9_-]{1,100}$/.test(id)) throw Error("Supply a run ID");
const dir = `.private/benchmark/${id}`;
const lock = await open(`${dir}/.lock`, "wx", 0o600);
async function save(path, value) {
  await writeFile(path + ".tmp", JSON.stringify(value, null, 2), { mode: 0o600 });
  await rename(path + ".tmp", path);
}
try {
  const run = JSON.parse(await readFile(`${dir}/run.json`, "utf8"));
  const records = JSON.parse(await readFile(`${dir}/records.json`, "utf8"));
  const rawDir = `${dir}/verification-raw`;
  await mkdir(rawDir, { recursive: true, mode: 0o700 });
  const rows = [], cache = new Map();
  let liveQueries = 0;
  for (const c of run.cases) {
    if (hash(c.input) !== c.inputHash || promptFor(c.input) !== c.prompt) throw Error("Frozen input mismatch");
    const reference = JSON.parse(Buffer.from(c.request.reference.split(".")[0], "base64url").toString()).entity;
    const excluded = c.request.choices.filter(t => t.mode === "change").map(t => t.tagId);
    for (const condition of CONDITIONS) {
      const record = records[c.id]?.[condition];
      if (!record || record.inputHash !== c.inputHash) throw Error("All conditions with matching inputs are required");
      const caseRows = [];
      for (const [index, item] of record.items.entries()) {
        const key = fold(item.name), path = `${rawDir}/${hash(key)}.json`;
        let result = cache.get(key);
        if (!result) {
          try { result = JSON.parse(await readFile(path, "utf8")); }
          catch (error) {
            if (error.code !== "ENOENT") throw error;
            const queriedAt = new Date().toISOString();
            result = { query: item.name + " Paris", queriedAt, ...await searchEntities(item.name + " Paris", "place") };
            liveQueries++;
            await save(path, result);
          }
          cache.set(key, result);
        }
        const check = verifyItem(item, c.input, reference.id, excluded, result.entities);
        caseRows.push({ caseId: c.id, inputHash: c.inputHash, condition, index, name: item.name, providerCheckedAt: result.checkedAt, ...check });
      }
      const ids = caseRows.map(r => r.entityId).filter(Boolean);
      for (const row of caseRows) if (row.entityId && ids.filter(id => id === row.entityId).length > 1) {
        row.checks.distinctEntity = "fail"; row.allHardMetadataConstraints = "fail";
      }
      rows.push(...caseRows);
    }
  }
  const report = { runId: id, checkedAt: new Date().toISOString(), recordsHash: hash(records), scope: "Qloo metadata audit for all three conditions; not independent ground truth", conditions: verificationSummary(rows), uniqueQueries: cache.size, liveQueriesThisRun: liveQueries, independentOperationalVerification: false, qualityUplift: null };
  await save(`${dir}/common-verification-rows.json`, rows);
  await save(`${dir}/common-verification-summary.json`, report);
  console.log(JSON.stringify(report, null, 2));
} finally { await lock.close(); await unlink(`${dir}/.lock`); }
