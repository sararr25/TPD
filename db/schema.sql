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

-- E06: places a user hid with "Not for me"; excluded from their next Swaps.
CREATE TABLE IF NOT EXISTS user_hidden_place (
  user_id uuid NOT NULL REFERENCES neon_auth."user" (id) ON DELETE CASCADE,
  place_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, place_id)
);

-- E06: collections (e.g. one per trip) of saved Swap results. Each item keeps
-- the Qloo place ID plus the few fields needed to show it, not Qloo data in bulk.
CREATE TABLE IF NOT EXISTS collection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES neon_auth."user" (id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);
CREATE TABLE IF NOT EXISTS collection_item (
  collection_id uuid NOT NULL REFERENCES collection (id) ON DELETE CASCADE,
  place_id uuid NOT NULL,
  name text NOT NULL,
  address text,
  lat double precision,
  lon double precision,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, place_id)
);

-- Passport quiz answers of a signed-in user (src/lib/quiz.ts), kept as the
-- plain-language taste profile. Rows go away when the Neon Auth user is deleted.
CREATE TABLE IF NOT EXISTS user_quiz (
  user_id uuid PRIMARY KEY REFERENCES neon_auth."user" (id) ON DELETE CASCADE,
  answers jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Gradual feedback of a signed-in user (src/lib/feedback.ts, docs/17 D3):
-- "Yes" / "Not for me" votes with their taste tags, and undone strong signals.
-- Rows go away when the Neon Auth user is deleted.
CREATE TABLE IF NOT EXISTS user_feedback (
  user_id uuid PRIMARY KEY REFERENCES neon_auth."user" (id) ON DELETE CASCADE,
  feedback jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
