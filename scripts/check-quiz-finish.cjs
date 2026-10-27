const fs = require("fs"),
  vm = require("vm"),
  assert = require("assert/strict");
const ts = require("typescript");
function pureModule(path) {
  const output = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: output, atob });
  return output;
}
const client = pureModule("src/lib/discovery-client.ts");
const quiz = pureModule("src/lib/quiz.ts");
const storage = new Map();
const events = [],
  writes = [];
let fail = true,
  requests = 0;
let gate = null;
let discoveryGate = null;
const choices = [
  { entity: { id: "fixture", name: "Fixture" }, token: "fixture-token" },
];
const result = {};
const mocks = {
  "./quiz": quiz,
  "./discovery": { LIVE_PASSPORT_KEY: "passport" },
  "./discovery-client": { readSelections: client.readSelections,
    discovery: async () => {
      requests++;
      if (discoveryGate) await discoveryGate;
      return { choices };
    },
  },
  "./account": {
    saveAccountPassport: async () => { writes.push("passport"); if (gate) await gate; },
    saveAccountQuiz: async () => {
      writes.push("quiz");
      if (fail) throw Error("Offline");
    },
  },
};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("src/lib/quiz-finish.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  {
    exports: result,
    require: (n) => mocks[n],
    localStorage: {
      setItem: (k, v) => storage.set(k, v),
      getItem: (k) => storage.get(k),
      removeItem: (k) => storage.delete(k),
    },
    window: { dispatchEvent: (e) => events.push(e.type) },
    Event,
  },
);
(async () => {
  await assert.rejects(
    result.finishQuiz({ planning: 2 }, ["fixture"], "fixture-owner"),
  );
  assert.ok(
    events.includes("tpd:passport-changed"),
    "partial account failure must notify pages of saved browser Passport",
  );
  fail = false;
  await result.finishQuiz({ planning: 2 }, ["fixture"], "fixture-owner");
  assert.equal(requests, 1, "retry must retain resolved choices");
  storage.set("beesyde-passport-owner", "previous-owner");
  await result.finishQuiz({ planning: 2 }, ["fixture"], false);
  assert.equal(storage.has("beesyde-passport-owner"), false, "new guest quiz clears prior ownership");
  let release;
  gate = new Promise(resolve => { release = resolve; });
  result.stagePassport("fixture-owner", choices, { planning: 2 });
  const old = result.retryPassportSave("fixture-owner");
  await Promise.resolve();
  result.stagePassport("fixture-owner", choices, { planning: 3 });
  release(); await old; gate = null;
  assert.equal(result.pendingPassport("fixture-owner").answers.planning, 3, "old write cannot discard a newer draft");
  await result.discardPendingPassport("fixture-owner");
  assert.equal(result.pendingPassport("fixture-owner"), null, "deletion removes retry data");
  storage.set("beesyde-passport-pending:fixture-owner", JSON.stringify({choices:[null],answers:{planning:2},cards:[],passportSaved:false}));
  assert.equal(result.pendingPassport("fixture-owner"), null, "malformed pending data cannot crash consumers");
  const beforeStorage = [...storage], beforeWrites = writes.length, beforeEvents = events.length;
  let current = true, releaseDiscovery;
  discoveryGate = new Promise(resolve => { releaseDiscovery = resolve; });
  const late = result.finishQuiz({ planning: 4 }, ["new-fixture"], "leaving-owner", () => current);
  current = false; releaseDiscovery();
  await assert.rejects(late, /active account changed/);
  assert.deepEqual([...storage], beforeStorage, "an old response cannot replace the current browser profile");
  assert.equal(writes.length, beforeWrites, "an old response cannot start account writes");
  assert.equal(events.length, beforeEvents, "an old response cannot announce a new profile");
  console.log("PASS: partial save notification, retained retry, guest ownership, draft revisions, deletion cleanup and late-owner response isolation.");
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
