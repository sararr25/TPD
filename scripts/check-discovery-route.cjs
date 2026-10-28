const fs = require("node:fs"), vm = require("node:vm"), assert = require("node:assert/strict");
const ts = require("typescript");
class DiscoveryError extends Error { constructor(code, status) { super(code); this.code = code; this.status = status; } }
const calls = [], output = {};
const mocks = {
  "@/lib/server/qloo": { DiscoveryError },
  "@/lib/server/discovery-service": { lookup: async (...args) => { calls.push(args); return { choices: [] }; } },
  "@/lib/server/city-affinity": {},
  "@/lib/server/budget": { checkBudget: async () => {} },
};
vm.runInNewContext(ts.transpileModule(fs.readFileSync("src/app/api/discovery/route.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
  { exports: output, require: name => { assert(name in mocks); return mocks[name]; }, Request, Response, URL, console });
async function search(query, linked = true) {
  return output.POST(new Request("https://example.invalid/api/discovery", { method: "POST", headers: { host: "example.invalid", origin: "https://example.invalid", "content-type": "application/json" }, body: JSON.stringify({ action: "search", query, type: "place", reference: true, city: "Lisbon", category: "restaurant", ...(linked ? { referenceId: "00000000-0000-4000-8000-000000000991" } : {}) }) }));
}
(async () => {
  for (const name of ["X", "A".repeat(200), undefined]) {
    assert.equal((await search(name)).status, 200, "ID-based starting places must not be blocked by text-search limits");
    assert.equal(calls.at(-1)[5], "00000000-0000-4000-8000-000000000991");
  }
  for (const name of ["X", "A".repeat(200), undefined]) assert.equal((await search(name, false)).status, 400);
  assert.equal((await search("Gardens", false)).status, 200);
  assert.equal(calls.at(-1)[0], "Gardens");
  console.log("PASS: discovery API accepts ID-based short/long/missing names and retains manual name-search limits; mocked service, no network.");
})().catch(error => { console.error(error); process.exitCode = 1; });
