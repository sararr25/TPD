// Supported Codex CLI transport using its existing ChatGPT sign-in, not a direct API client.
import { spawn, spawnSync, execFileSync } from "node:child_process";
import { mkdtemp, mkdir, open, readFile, writeFile, rename, rm, unlink, chmod } from "node:fs/promises";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { hash, promptFor, report, profileSensitivity } from "./core.mjs";
import { isToolEvent, parseCliResponse, auditCliEvents } from "./cli-protocol.mjs";

const [runId, limitValue = "16"] = process.argv.slice(2);
if (!runId || !/^[a-zA-Z0-9_-]{1,100}$/.test(runId)) throw Error("Supply an existing benchmark run ID");
const limit = Number(limitValue);
if (!Number.isInteger(limit) || limit < 1 || limit > 16) throw Error("Limit must be 1–16");
const dir = resolve(`.private/benchmark/${runId}`);
const lock = await open(`${dir}/.lock`, "wx", 0o600);
let cwd;
try {
const run = JSON.parse(await readFile(`${dir}/run.json`, "utf8"));
const inputs = JSON.parse(await readFile(`${dir}/baseline-inputs.json`, "utf8"));
for (const c of run.cases) if (hash(c.input) !== c.inputHash || promptFor(c.input) !== c.prompt) throw Error("Frozen input mismatch");
const records = JSON.parse(await readFile(`${dir}/records.json`, "utf8"));
if (Object.values(records).some(r => r.llm && r.llm.provenance?.transport !== "codex-cli")) throw Error("Do not mix baseline transports in one condition");
const env = Object.fromEntries(["HOME", "PATH", "TMPDIR", "LANG", "LC_ALL", "CODEX_HOME", "SSL_CERT_FILE", "SSL_CERT_DIR", "HTTPS_PROXY", "HTTP_PROXY", "NO_PROXY"].filter(k => process.env[k]).map(k => [k, process.env[k]]));
const login = spawnSync("codex", ["login", "status"], { env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
if (login.status !== 0 || !(login.stdout + login.stderr).includes("Logged in using ChatGPT")) throw Error("An existing ChatGPT CLI login is required; no API key will be read");
const version = execFileSync("codex", ["--version"], { env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const rawDir = `${dir}/cli-raw`;
await mkdir(rawDir, { recursive: true, mode: 0o700 });
cwd = await mkdtemp(`${tmpdir()}/tpd-offline-baseline-`);
const prefix = "Use only your existing knowledge. Do not browse or use any tools, connected apps, Qloo, or external lookup. This is a controlled offline baseline; do not seek current facts.\n\n";
const disabled = ["shell_tool", "apps", "plugins", "remote_plugin", "memories", "multi_agent", "multi_agent_v2", "computer_use", "browser_use", "browser_use_external", "code_mode_host", "image_generation", "view_image", "skill_search", "sleep_tool", "unbounded_connection_retries"];
async function save(path, value) {
  await writeFile(path + ".tmp", JSON.stringify(value, null, 2), { mode: 0o600 });
  await rename(path + ".tmp", path);
}
  let collected = 0;
  for (const input of inputs) {
    if (records[input.caseId]?.llm) continue;
    if (collected >= limit) break;
    const c = run.cases.find(c => c.id === input.caseId);
    if (!c || input.inputHash !== c.inputHash || input.prompt !== c.prompt) throw Error("Export does not match frozen manifest");
    const attemptPath = `${rawDir}/${c.id}-attempt.json`;
    try { await readFile(attemptPath); throw Error(`${c.id}: an earlier attempt exists; inspect it instead of automatically retrying`); }
    catch (e) { if (e.code !== "ENOENT") throw e; }
    const output = `${rawDir}/${c.id}-response.txt`;
    const args = ["exec", "--ignore-user-config", "--ephemeral", "--skip-git-repo-check", "--sandbox", "read-only", "--model", "gpt-6-sol", "--json", "--color", "never", "--output-last-message", output,
      "-c", 'model_reasoning_effort="high"', "-c", 'web_search="disabled"', "-c", "project_doc_max_bytes=0", "--enable", "skip_host_skill_discovery",
      ...disabled.flatMap(name => ["--disable", name]), "-"];
    const startedAt = new Date().toISOString();
    const submittedPrompt = prefix + c.prompt;
    await save(attemptPath, { caseId: c.id, inputHash: c.inputHash, startedAt, status: "started", version, requestedModel: "gpt-6-sol", effort: "high", args, submittedPrompt });
    await writeFile(output, "", { mode: 0o600, flag: "wx" });
    let stdout = "", stderr = "", buffer = "", toolsUsed = false;
    const result = await new Promise((resolveResult, reject) => {
      const child = spawn("codex", args, { cwd, env, stdio: ["pipe", "pipe", "pipe"] });
      const timer = setTimeout(() => child.kill("SIGTERM"), 180000);
      child.stdout.on("data", chunk => {
        stdout += chunk; buffer += chunk;
        let end;
        while ((end = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, end); buffer = buffer.slice(end + 1);
          try {
            const event = JSON.parse(line);
            if (isToolEvent(event)) {
              toolsUsed = true; child.kill("SIGTERM");
            }
          } catch {}
        }
      });
      child.stderr.on("data", chunk => { stderr += chunk; });
      child.once("error", error => { clearTimeout(timer); reject(error); });
      child.once("close", (code, signal) => { clearTimeout(timer); resolveResult({ code, signal }); });
      child.stdin.end(submittedPrompt);
    });
    await writeFile(`${rawDir}/${c.id}-events.jsonl`, stdout, { mode: 0o600 });
    await writeFile(`${rawDir}/${c.id}-stderr.txt`, stderr, { mode: 0o600 });
    const attempt = { caseId: c.id, inputHash: c.inputHash, startedAt, completedAt: new Date().toISOString(), version, requestedModel: "gpt-6-sol", effort: "high", args, submittedPrompt, ...result, toolsUsed, status: toolsUsed ? "rejected_tool_use" : result.code === 0 ? "completed" : "failed" };
    await save(attemptPath, attempt);
    if (result.code !== 0 || toolsUsed) throw Error(`${c.id}: CLI attempt ${attempt.status}; private logs preserved, no retry`);
    await chmod(output, 0o600);
    const raw = await readFile(output, "utf8");
    auditCliEvents(stdout);
    let items;
    try { items = parseCliResponse(raw); }
    catch { throw Error(`${c.id}: nonconforming response; preserve and inspect the first output`); }
    records[c.id] = { ...records[c.id], llm: { caseId: c.id, condition: "llm", inputHash: c.inputHash, items, provenance: {
      source: "Codex CLI with existing ChatGPT sign-in", transport: "codex-cli", model: "gpt-6-sol (requested; no immutable backend revision exposed)", effort: "high", version, collectedAt: attempt.completedAt, qlooUsed: false, browsing: false, observedToolCalls: 0, freshProcess: true, userConfigLoaded: false, promptPrefix: prefix, rawResponseFile: output,
    } } };
    await save(`${dir}/records.json`, records);
    await save(`${dir}/summary.json`, { ...report(run, records), profileSensitivity: profileSensitivity(run, records) });
    collected++;
    console.log(JSON.stringify({ case: c.id, items: items.length, transport: "codex-cli", observedToolCalls: 0 }));
  }
} finally {
  await lock.close(); await unlink(`${dir}/.lock`);
  if (cwd) await rm(cwd, { recursive: true, force: true });
}
