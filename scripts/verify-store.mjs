// Live check of the Postgres store against DATABASE_URL. Cleans up its own rows.
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { PostgresStore } from "../src/lib/server/store.ts";
import { storeContract } from "./store-contract.mjs";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
const prefix = "verify-" + randomUUID();
try {
  await storeContract(new PostgresStore(process.env.DATABASE_URL), prefix);
  console.log("PASS: Postgres store contract (cache, expiry, shared pacing, budgets).");
} finally {
  const sql = neon(process.env.DATABASE_URL);
  await sql.query("DELETE FROM provider_cache WHERE key LIKE $1", [prefix + "%"]);
  await sql.query("DELETE FROM request_budget WHERE bucket LIKE $1", [prefix + "%"]);
}
