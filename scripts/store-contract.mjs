import assert from "node:assert/strict";

// Behaviour every Store must have. Used by check-store (memory) and verify-store (Postgres).
export async function storeContract(s, prefix) {
  const key = prefix + ":cache";
  assert.equal(await s.get(key), null);
  await s.set(key, { data: [{ a: 1 }], checkedAt: "2026-10-20T12:00:00.000Z" }, 60000);
  assert.deepEqual(await s.get(key), { data: [{ a: 1 }], checkedAt: "2026-10-20T12:00:00.000Z" });
  await s.set(key + ":short", { data: 1, checkedAt: "2026-10-20T12:00:00.000Z" }, 1);
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(await s.get(key + ":short"), null, "expired entries are not returned");

  // Pacing: consecutive reservations are spaced by the gap; a too-long wait reserves nothing.
  const provider = "nominatim";
  const first = await s.reserve(provider, 1000, 5000);
  const second = await s.reserve(provider, 1000, 5000);
  assert(second - first >= 900 && second - first <= 1100, `gap ${second - first}`);
  assert.equal(await s.reserve(provider, 1000, 0), null, "rejects when the wait exceeds the maximum");
  const third = await s.reserve(provider, 1000, 5000);
  assert(third - second <= 1100, "a rejected call did not push the queue back");

  // Budget: counts within a window, restarts after it.
  const bucket = prefix + ":budget";
  assert.equal(await s.spend(bucket, 60000), 1);
  assert.equal(await s.spend(bucket, 60000), 2);
  assert.equal(await s.spend(bucket + ":w", 1), 1);
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(await s.spend(bucket + ":w", 1), 1, "window restarts");
  // Let the pacing slots used above pass before anyone else uses the provider.
  await new Promise((r) => setTimeout(r, Math.max(0, third + 1000)));
}
