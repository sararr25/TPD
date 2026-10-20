// Applies db/schema.sql to DATABASE_URL. Idempotent (CREATE ... IF NOT EXISTS).
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
const sql = neon(process.env.DATABASE_URL);
const statements = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8")
  .replace(/--.*$/gm, "")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);
for (const statement of statements) await sql.query(statement);
const tables = await sql.query(
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
);
console.log(`Applied ${statements.length} statements. Tables: ${tables.map((t) => t.table_name).join(", ")}`);
