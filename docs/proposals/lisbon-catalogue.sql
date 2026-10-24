-- PROPOSAL ONLY. Do not run without explicit production-schema approval.
-- New table only; provider_cache and all account tables are unchanged.
CREATE TABLE curated_place (
  provider text NOT NULL CHECK (provider = 'qloo'),
  provider_id uuid NOT NULL,
  city text NOT NULL CHECK (city = 'Lisbon'),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  categories text[] NOT NULL CHECK (cardinality(categories) BETWEEN 1 AND 4
    AND categories <@ ARRAY['restaurant','bar','museum','hotel']::text[]),
  address text,
  latitude double precision CHECK (latitude BETWEEN -90 AND 90),
  longitude double precision CHECK (longitude BETWEEN -180 AND 180),
  price_tier smallint CHECK (price_tier BETWEEN 1 AND 4),
  neighbourhood text,
  verified_traits jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(verified_traits) = 'array'),
  photo_url text CHECK (photo_url IS NULL OR photo_url LIKE 'https://%'),
  photo_status text NOT NULL DEFAULT 'unreviewed' CHECK (photo_status IN ('unreviewed','approved','missing','rejected')),
  source_observed_at timestamptz NOT NULL,
  source_reference text NOT NULL,
  rights_reference text,
  review_status text NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending','approved','rejected')),
  reviewed_at timestamptz,
  refresh_after timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (provider, provider_id),
  CHECK (review_status <> 'approved' OR (reviewed_at IS NOT NULL AND rights_reference IS NOT NULL)),
  CHECK (photo_status <> 'approved' OR (photo_url IS NOT NULL AND rights_reference IS NOT NULL))
);
CREATE INDEX curated_place_city_review ON curated_place (city, review_status);
ALTER TABLE curated_place ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON curated_place FROM PUBLIC;
-- No public policies. Existing server DB owner only; browser never sees DB credentials.
-- Apply in one transaction. Initial approved import capped at 50 Lisbon rows.
-- Rollback before activation: DROP TABLE curated_place (only this new table).
