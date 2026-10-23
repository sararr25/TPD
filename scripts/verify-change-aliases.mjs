// Live local-app check: two sequential requests, Qloo quota, no retries.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chipTags, hasTrait } from "../src/lib/discovery.ts";
const origin = "http://127.0.0.1:3100";
const receipts = [];
async function request(body) {
  const response = await fetch(origin + "/api/discovery", {
    method: "POST", redirect: "error",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify(body), signal: AbortSignal.timeout(60000),
  });
  const data = await response.json();
  receipts.push({ action: body.action, status: response.status, data });
  assert.equal(response.status, 200, `${body.action}: ${data.error ?? response.status}; stopped without retry`);
  return data;
}
try {
  const { choices } = await request({ action: "search", query: "Time Out Market", type: "place", reference: true, city: "Lisbon", category: "restaurant" });
  const reference = choices.find(s => s.entity.id.toUpperCase() === "96296410-62EB-408E-96C6-FD60AAAF9216");
  assert(reference, "The exact Lisbon reference must resolve");
  const casual = chipTags(reference.entity).find(t => t.name.trim().toLowerCase() === "casual");
  assert(casual, "The real reference must still list Casual");
  const data = await request({ action: "swap", reference: reference.token, passport: [], choices: [{ tagId: casual.id, mode: "change" }], city: "Lisbon", category: "restaurant", exclude: [], quiz: {}, feedback: {} });
  assert(data.results.length > 0, "An empty answer cannot prove this live result check");
  assert(data.results.every(r => !hasTrait(r.place, casual)), "No returned place may list the changed trait under another ID");
  console.log(JSON.stringify({ city: "Lisbon", reference: reference.entity.name, changed: casual.name, results: data.results.length, candidateCount: data.candidateCount, verification: data.verification, sameLabelConflicts: 0 }));
} finally {
  await mkdir(".private/qloo", { recursive: true, mode: 0o700 });
  await writeFile(".private/qloo/change-alias-check.json", JSON.stringify(receipts), { mode: 0o600 });
}
