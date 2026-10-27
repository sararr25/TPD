-- #56/#57: additive private metadata; no change to existing Saved records.
CREATE TABLE IF NOT EXISTS user_travel_state (
  user_id uuid PRIMARY KEY REFERENCES neon_auth."user" (id) ON DELETE CASCADE,
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  state jsonb NOT NULL CHECK (jsonb_typeof(state) = 'object'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
