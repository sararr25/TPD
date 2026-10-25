-- Approved by owner and applied/verified on 2026-10-25. Do not rerun.
-- Enable VISITED_CITIES_SYNC=1 only after applying and verifying this table.
CREATE TABLE public.user_visited_cities (
  user_id uuid PRIMARY KEY REFERENCES neon_auth."user" (id) ON DELETE CASCADE,
  cities text[] NOT NULL DEFAULT '{}'::text[],
  CHECK (cardinality(cities) <= 11),
  CHECK (array_position(cities, NULL) IS NULL),
  CHECK (cities <@ ARRAY['Paris', 'Lisbon', 'Porto', 'Barcelona', 'Madrid', 'New York', 'Tokyo', 'Osaka', 'Ho Chi Minh City', 'Hanoi', 'Phu Quoc']::text[])
);
