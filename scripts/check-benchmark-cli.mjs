import assert from "node:assert/strict";
import { isToolEvent, parseCliResponse, auditCliEvents } from "./benchmark/cli-protocol.mjs";
const warning = { type: "item.completed", item: { type: "error", message: "Synthetic configuration warning" } };
assert.equal(isToolEvent(warning), false);
for (const type of ["command_execution", "mcp_tool_call", "web_search", "file_change", "unknown_future_tool"])
  assert.equal(isToolEvent({ type: "item.started", item: { type } }), true);
const raw = JSON.stringify({ items: [{ name: "Fictional venue", address: null, why: "Synthetic reason", different: "Synthetic difference" }] });
assert.equal(parseCliResponse(raw).length, 1);
assert.equal(parseCliResponse("```json\n" + raw + "\n```").length, 1);
assert.deepEqual(parseCliResponse('{"items":[]}'), []);
assert.throws(() => parseCliResponse("I cannot answer this request."));
assert.throws(() => parseCliResponse('{"items":null}'));
const completed = [warning, { type: "turn.started" }, { type: "item.completed", item: { type: "agent_message", text: raw } }, { type: "turn.completed" }];
const jsonl = events => events.map(e => JSON.stringify(e)).join("\n");
assert.equal(auditCliEvents(jsonl(completed)).observedToolCalls, 0);
assert.throws(() => auditCliEvents(jsonl(completed.slice(0, -1))));
assert.throws(() => auditCliEvents(jsonl([...completed, { type: "item.started", item: { type: "mcp_tool_call" } }])));
assert.throws(() => auditCliEvents(jsonl([...completed, { type: "turn.failed" }])));
assert.throws(() => auditCliEvents(jsonl([{ type: "turn.completed" }])));
console.log("PASS: CLI diagnostic warnings are distinct from tool calls; offline audit requires a completed tool-free response and preserves malformed/refusal outputs as failures.");

// Run the collector against a fake local CLI, never the actual model/provider.
const { mkdir, writeFile, readFile, rm, readdir } = await import("node:fs/promises");
const { resolve } = await import("node:path");
const { randomUUID } = await import("node:crypto");
const { execFileSync } = await import("node:child_process");
const { hash, promptFor } = await import("./benchmark/core.mjs");
const id = `synthetic-cli-${randomUUID()}`, dir = resolve(`.private/benchmark/${id}`);
await mkdir(`${dir}/bin`, { recursive: true, mode: 0o700 });
const input = { city: "Paris", category: "museum", reference: { name: "Fictional reference" }, passport: [] };
const c = { id: "fixture", input, inputHash: hash(input), prompt: promptFor(input) };
try {
  await writeFile(`${dir}/run.json`, JSON.stringify({ cases: [c] }));
  await writeFile(`${dir}/baseline-inputs.json`, JSON.stringify([{ ...c, caseId: c.id }]));
  await writeFile(`${dir}/records.json`, "{}");
  const stub = `#!/usr/bin/env node
const fs=require('node:fs');const assert=require('node:assert/strict');const args=process.argv.slice(2);
if(args[0]==='login'){process.stderr.write('Logged in using ChatGPT\\n');process.exit(0)}
if(args[0]==='--version'){console.log('codex-cli synthetic-test-only');process.exit(0)}
assert.equal(args[0],'exec');assert(args.includes('--ignore-user-config'));assert(args.includes('--ephemeral'));assert.equal(args[args.indexOf('--sandbox')+1],'read-only');assert(args.includes('web_search="disabled"'));assert.equal(process.env.QLOO_API_KEY,undefined);assert.equal(process.env.OPENAI_API_KEY,undefined);assert.equal(process.env.CODEX_API_KEY,undefined);assert.deepEqual(fs.readdirSync(process.cwd()),[]);
for(const feature of ['shell_tool','apps','plugins','memories','multi_agent','computer_use','browser_use']){const i=args.indexOf(feature);assert(i>0);assert.equal(args[i-1],'--disable')}
let prompt='';process.stdin.on('data',chunk=>prompt+=chunk);process.stdin.on('end',()=>{assert(prompt.includes('Fictional reference'));const path=args[args.indexOf('--output-last-message')+1];const result=JSON.stringify({items:[{name:'Fictional alternative',address:null,why:'Synthetic reason',different:'Synthetic difference'}]});fs.writeFileSync(path,result,{mode:0o600});for(const event of [{type:'turn.started'},{type:'item.completed',item:{type:'error',message:'Synthetic warning'}},{type:'item.completed',item:{type:'agent_message',text:result}},{type:'turn.completed'}])console.log(JSON.stringify(event))});
`;
  await writeFile(`${dir}/bin/package.json`, JSON.stringify({ type: "commonjs" }));
  await writeFile(`${dir}/bin/codex`, stub, { mode: 0o700 });
  const execute = () => execFileSync(process.execPath, ["--experimental-strip-types", "scripts/benchmark/collect-cli.mjs", id, "1"], { encoding: "utf8", env: { ...process.env, PATH: `${dir}/bin:${process.env.PATH}`, QLOO_API_KEY: "synthetic-should-not-be-forwarded", OPENAI_API_KEY: "synthetic-should-not-be-forwarded", CODEX_API_KEY: "synthetic-should-not-be-forwarded" }, stdio: ["ignore", "pipe", "pipe"] });
  execute();
  const result = JSON.parse(await readFile(`${dir}/records.json`, "utf8"));
  assert.equal(result.fixture.llm.items[0].name, "Fictional alternative");
  assert.equal(result.fixture.llm.provenance.transport, "codex-cli");
  const before = await readdir(`${dir}/cli-raw`);
  execute();
  assert.deepEqual(await readdir(`${dir}/cli-raw`), before);
  // A failed/unimported prior attempt prevents another model dispatch.
  await writeFile(`${dir}/records.json`, "{}");
  assert.throws(execute);
  assert.deepEqual(await readdir(`${dir}/cli-raw`), before);
  // Lock must also be released on validation failures before a subprocess starts.
  await writeFile(`${dir}/run.json`, JSON.stringify({ cases: [{ ...c, inputHash: "wrong" }] }));
  assert.throws(execute);
  assert(!(await readdir(dir)).includes('.lock'));
} finally { await rm(dir, { recursive: true, force: true }); }
console.log("PASS: collector isolates working directory, strips API keys from child environment, preserves first outputs, checkpoints completed cases, refuses automatic retries and releases locks on errors. Fake CLI only.");
