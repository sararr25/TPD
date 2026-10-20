-- Private server-side store (Neon Postgres). Apply with: npm run db:migrate
-- Provider responses live here, never in the public repository (DECISIONS 4.7).

-- Cached provider responses (Qloo, OpenStreetMap). key is a SHA-256 hash.
CREATE TABLE IF NOT EXISTS provider_cache (
  key text PRIMARY KEY,
  data jsonb NOT NULL,
  checked_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS provider_cache_expires ON provider_cache (expires_at);

-- Next free request slot per provider, shared by every server instance.
CREATE TABLE IF NOT EXISTS provider_pace (
  provider text PRIMARY KEY,
  next_at timestamptz NOT NULL
);
INSERT INTO provider_pace (provider, next_at) VALUES ('qloo', now()), ('nominatim', now())
  ON CONFLICT (provider) DO NOTHING;

-- Fixed-window request counters per visitor (bucket holds a hashed IP).
CREATE TABLE IF NOT EXISTS request_budget (
  bucket text PRIMARY KEY,
  count integer NOT NULL,
  window_end timestamptz NOT NULL
);

-- E06: one Passport per signed-in user. Stores Qloo entities only (no signed
-- tokens: those expire after 24 h and are re-issued on read). Rows go away
-- when the Neon Auth user is deleted.
CREATE TABLE IF NOT EXISTS user_passport (
  user_id uuid PRIMARY KEY REFERENCES neon_auth."user" (id) ON DELETE CASCADE,
  entities jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
