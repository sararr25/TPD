import assert from "node:assert/strict";
import { MemoryStore, setStore, store } from "../src/lib/server/store.ts";
import { checkBudget, visitor, LIMITS } from "../src/lib/server/budget.ts";
import { storeContract } from "./store-contract.mjs";

await storeContract(new MemoryStore(), "test");

// On Vercel a missing DATABASE_URL is an error, not a silent per-process fallback.
delete process.env.DATABASE_URL;
process.env.VERCEL = "1";
setStore(null);
assert.throws(() => store(), /DATABASE_URL is required/);
delete process.env.VERCEL;

// Per-visitor budget: the IP is hashed, swaps have their own lower limit.
process.env.QLOO_API_KEY = "unit-test-only-not-a-real-credential";
setStore(new MemoryStore());
const req = (ip) => new Request("http://x/api", { headers: { "x-forwarded-for": ip + ", 10.0.0.1" } });
assert.match(visitor(req("203.0.113.9")), /^[0-9a-f]{32}$/);
assert(!visitor(req("203.0.113.9")).includes("203"));
assert.notEqual(visitor(req("203.0.113.9")), visitor(req("203.0.113.10")));
for (let i = 0; i < LIMITS.swap; i++) await checkBudget(req("203.0.113.9"), true);
await assert.rejects(checkBudget(req("203.0.113.9"), true), (e) => e.code === "rate_limited" && e.status === 429);
await checkBudget(req("203.0.113.10"), true); // another visitor is unaffected
await checkBudget(req("203.0.113.9"), false); // searches still allowed until the overall limit
setStore(null);
console.log("PASS: memory store contract, Vercel requires DATABASE_URL, hashed per-visitor budgets with a separate Swap limit.");
