// Live end-to-end check against the running local app. Consumes Qloo quota.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { validPlace } from "../src/lib/discovery.ts";
const origin = "http://127.0.0.1:3000";
await mkdir(".private/qloo", { recursive: true, mode: 0o700 });
const checks = [];
async function request(name, body) {
  const response = await fetch(origin + "/api/discovery", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
    redirect: "error",
  });
  const data = await response.json();
  await writeFile(`.private/qloo/transfer-${name}.json`, JSON.stringify(data), { mode: 0o600 });
  assert.equal(response.status, 200, `${name}: HTTP ${response.status} (${data.error || ""}); stopped without retries`);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  return data;
}
const guest = await request("guest", { action: "guest", profile: 0 });
assert.equal(guest.choices.length, 3);
const passport = guest.choices.map(s => s.token);
for (const [category, query, exact] of [
  ["restaurant", "Le Baratin", "Le Baratin"],
  ["museum", "Musée d'Orsay", "Musée d'Orsay"],
]) {
  const found = await request(category + "-search", { action: "search", query, type: "place", reference: true, category });
  const matches = found.choices.filter(s => s.entity.name.toLowerCase() === exact.toLowerCase());
  assert.equal(matches.length, 1, "Reference must resolve to one exact candidate");
  const ref = matches[0];
  assert(validPlace(ref.entity, "Paris", category));
  const chip = ref.entity.tags.find(t => t.id !== `urn:tag:genre:place:${category}`);
  const modes = category === "museum" && chip ? ["baseline", "keep", "change"] : ["baseline"];
  for (const mode of modes) {
    const choices = mode === "baseline" ? [] : [{ tagId: chip.id, mode }];
    const data = await request(`${category}-${mode}`, { action: "swap", category, reference: ref.token, passport, choices });
    assert.equal(data.category, category);
    assert.equal(data.verification, "L0");
    assert(data.results.length > 0, "This pilot scenario needs at least one eligible result");
    assert.equal(new Set(data.results.map(r => r.place.id)).size, data.results.length);
    assert(data.results.every(r => r.place.id !== ref.entity.id && validPlace(r.place, "Paris", category, undefined, mode === "change" ? [chip.id] : [])));
    const check = { category, mode, results: data.results.length, candidates: data.candidateCount, discarded: data.discarded, categoryCityExclusionPass: true };
    checks.push(check);
    console.log(JSON.stringify(check));
  }
}
await writeFile(".private/qloo/transfer-summary.json", JSON.stringify({ checkedAt: new Date().toISOString(), samePassport: true, checks }, null, 2), { mode: 0o600 });
console.log("PASS: same guest Passport across restaurants and museums; live category/city, distinct roles and museum Keep/Change. Quality uplift is not measured.");
