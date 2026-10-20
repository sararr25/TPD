import "server-only";
import { neon } from "@neondatabase/serverless";

// Shared state for every server instance: provider cache, provider pacing and
// per-visitor request budgets. Uses Neon Postgres when DATABASE_URL is set.
// Without it (local dev, tests) state lives in this process only; on Vercel a
// missing DATABASE_URL is a configuration error, not a silent fallback.
export type Cached = { data: unknown; checkedAt: string };
export interface Store {
  readonly kind: "postgres" | "memory";
  get(key: string): Promise<Cached | null>;
  set(key: string, value: Cached, ttlMs: number): Promise<void>;
  // Reserves the provider's next request slot and returns how many ms to wait
  // for it, or null (nothing reserved) if that wait would exceed maxWaitMs.
  reserve(provider: string, gapMs: number, maxWaitMs: number): Promise<number | null>;
  // Counts one request in the bucket's window; returns the count so far.
  spend(bucket: string, windowMs: number): Promise<number>;
}

export class MemoryStore implements Store {
  readonly kind = "memory" as const;
  private cache = new Map<string, Cached & { expires: number }>();
  private pace = new Map<string, number>();
  private budget = new Map<string, { count: number; end: number }>();
  async get(key: string) {
    const hit = this.cache.get(key);
    if (!hit || hit.expires <= Date.now()) return null;
    return { data: hit.data, checkedAt: hit.checkedAt };
  }
  async set(key: string, value: Cached, ttlMs: number) {
    for (const [k, v] of this.cache) if (v.expires <= Date.now()) this.cache.delete(k);
    if (this.cache.size >= 500) this.cache.delete(this.cache.keys().next().value!);
    this.cache.set(key, { ...value, expires: Date.now() + ttlMs });
  }
  async reserve(provider: string, gapMs: number, maxWaitMs: number) {
    const now = Date.now();
    const slot = Math.max(now, this.pace.get(provider) ?? 0);
    if (slot - now > maxWaitMs) return null;
    this.pace.set(provider, slot + gapMs);
    return slot - now;
  }
  async spend(bucket: string, windowMs: number) {
    const now = Date.now();
    const b = this.budget.get(bucket);
    const next = !b || b.end <= now ? { count: 1, end: now + windowMs } : { count: b.count + 1, end: b.end };
    this.budget.set(bucket, next);
    return next.count;
  }
}

export class PostgresStore implements Store {
  readonly kind = "postgres" as const;
  private sql;
  constructor(url: string) {
    this.sql = neon(url);
  }
  async get(key: string) {
    const rows = await this.sql.query(
      "SELECT data, checked_at FROM provider_cache WHERE key = $1 AND expires_at > now()",
      [key],
    );
    if (!rows.length) return null;
    return { data: rows[0].data, checkedAt: new Date(rows[0].checked_at).toISOString() };
  }
  async set(key: string, value: Cached, ttlMs: number) {
    await this.sql.query(
      `INSERT INTO provider_cache (key, data, checked_at, expires_at)
       VALUES ($1, $2, $3, now() + $4 * interval '1 millisecond')
       ON CONFLICT (key) DO UPDATE SET data = excluded.data, checked_at = excluded.checked_at, expires_at = excluded.expires_at`,
      [key, JSON.stringify(value.data), value.checkedAt, ttlMs],
    );
    if (Math.random() < 0.02) await this.sql.query("DELETE FROM provider_cache WHERE expires_at < now()");
  }
  async reserve(provider: string, gapMs: number, maxWaitMs: number) {
    const rows = await this.sql.query(
      `UPDATE provider_pace
         SET next_at = greatest(next_at, now()) + $2 * interval '1 millisecond'
       WHERE provider = $1 AND greatest(next_at, now()) <= now() + $3 * interval '1 millisecond'
       RETURNING greatest(0, extract(epoch FROM (next_at - now())) * 1000 - $2) AS wait`,
      [provider, gapMs, maxWaitMs],
    );
    if (rows.length) return Math.ceil(Number(rows[0].wait));
    const known = await this.sql.query("SELECT 1 FROM provider_pace WHERE provider = $1", [provider]);
    if (!known.length) throw new Error(`provider_pace has no row for "${provider}"; run npm run db:migrate`);
    return null;
  }
  async spend(bucket: string, windowMs: number) {
    const rows = await this.sql.query(
      `INSERT INTO request_budget (bucket, count, window_end) VALUES ($1, 1, now() + $2 * interval '1 millisecond')
       ON CONFLICT (bucket) DO UPDATE SET
         count = CASE WHEN request_budget.window_end <= now() THEN 1 ELSE request_budget.count + 1 END,
         window_end = CASE WHEN request_budget.window_end <= now() THEN excluded.window_end ELSE request_budget.window_end END
       RETURNING count`,
      [bucket, windowMs],
    );
    return Number(rows[0].count);
  }
}

let current: Store | null = null;
export function store(): Store {
  if (current) return current;
  if (process.env.DATABASE_URL) current = new PostgresStore(process.env.DATABASE_URL);
  else if (process.env.VERCEL) throw new Error("DATABASE_URL is required on Vercel for the shared cache and rate limits");
  else {
    console.warn("[store] DATABASE_URL not set: cache and rate limits are per-process (local only)");
    current = new MemoryStore();
  }
  return current;
}
// Tests only: replace the store.
export function setStore(value: Store | null) {
  current = value;
}
