# Personal Home and real visited cities — 25 October 2026

## Accepted contract

Owner confirmed: affinity with the Passport first; real visited cities second;
no visit counts. New visitors see Lisbon, Paris, Tokyo and New York. Cities with
unverifiable affinity remain accessible in All cities / explicit travel history.
Do not infer physical travel from guide-open or saved-place activity stamps.

## Local implementation

Home now displays four equally weighted city postcards with an All cities link.
The full eleven-city regional index remains in `/explore`. Order is:

1. Verified provider affinity, descending, based on the Passport's signed 3–5
   favourites. Exact score ties favour an explicitly visited city, then use
   alphabetical order. No numeric affinity or invented percentage is shown.
2. Explicitly visited cities not already ranked, alphabetically: no visit
   frequency, chronology, physical location tracking or guessed travel dates.
3. Remaining approved starter cities, in the owner's chosen order, until four
   unique cities appear.

Cards distinguish Passport favourites, visited history and starter picks. Loading,
empty and failed affinity reads show the honest visited/starter fallback. Requests
are aborted on owner/profile changes; old owner scores cannot populate a new
owner's shelf. No new provider or all-city place harvest is introduced.

`cities` in the existing discovery API validates signed distinct interests before
one destination-insights call restricted to the verified IDs. It accepts only
expected IDs, destination type, confirmed country and finite returned affinity
in the provider range. Unscored or malformed rows never acquire a guessed score.

Eight destination records have exact name/country confirmation: Lisbon, Porto,
Paris, Madrid, New York City, Tokyo, Ho Chi Minh City and Hanoi. Barcelona has
indistinguishable duplicates; Osaka lacks country metadata; both Phu Quoc name
queries resolved to Phuket. Those three cities remain available without affinity.
Raw responses stay private. The existing provider cache (15 minutes), pacing and
per-visitor discovery budget also cover this action. No automatic retries.

The Passport adds eleven explicit visited checkboxes and a Save action, separate
from activity stamps. Guest and each account have isolated browser copies.
Unsuccessful account saves retain a draft and a retry action. Same-owner writes
are queued; revision checks prevent an older read/save from replacing a newer
change or restoring erased browser history. Account switches mask prior data.
Passport/account deletion clears the corresponding travel copy; eventual server
rows follow the account foreign-key cascade.

## Exact schema — approved, applied and verified

The owner explicitly approved this SQL on 25 October 2026. Preflight confirmed
that the table was absent and `neon_auth."user".id` was a non-null UUID. Only
the approved CREATE TABLE statement was executed against the configured Neon
database. Metadata inspection confirmed both columns/defaults, all three CHECKs,
the primary key, the auth foreign key with ON DELETE CASCADE, and only the primary
key index. No user data was read or written for this verification.

File: `db/proposals/2026-10-25-visited-cities.sql` (deliberately outside the
aggregate migration runner). Applied table `public.user_visited_cities`:

- `user_id uuid PRIMARY KEY`, foreign key to `neon_auth."user"(id)`, ON DELETE CASCADE.
- `cities text[] NOT NULL DEFAULT '{}'`; at most eleven entries, no null elements,
  constrained to the eleven supported city names. The API also rejects duplicates.
- No travel dates, visit counts, locations, notes or provider responses.
- No index beyond the primary key; one atomic upsert replaces one user's set.
- Authenticated same-origin `/api/visited-cities` GET/PUT/DELETE; SQL always uses
  the session owner. The intended-owner header rejects delayed cross-account writes.
- No bucket, new service, raw-data publication or catalogue migration.

Storage is bounded to one small row per account (up to eleven short city names;
roughly sub-kilobyte payload before database/index overhead). It uses the existing
Neon plan; no new paid service is provisioned and marginal billing was not verified.
Reads happen on the relevant Home/Passport mount; writes occur only on explicit
Save/delete. Home affinity is cached by existing provider request inputs.

Before execution: inspect whether the table already exists and verify its exact
columns/constraints and the auth FK. Do not use IF NOT EXISTS to hide an unexpected
existing schema. Apply only this statement after owner approval; inspect the
resulting schema. Rollback, if unused, is dropping only this new table; dropping
after real user use would delete travel history and requires a separate decision.

Account sync is OFF by default. `VISITED_CITIES_SYNC=1` must be enabled only after
approved creation/verification. While off, GET does not query the proposed table;
UI explicitly says visits stay on this browser for this account. PUT refuses
account writes; privacy deletion still attempts to remove older rows if a table
exists and ignores only the PostgreSQL missing-table error before migration.
The approved schema was created; no persistent environment setting or deployment
was changed. The local preview alone uses `VISITED_CITIES_SYNC=1`.

This approval boundary comes from docs/28: applying production schema changes
requires the exact proposal and the owner's approval first.

## Validation / current limits

Offline service and client regressions cover approved starters, actual affinity
priority/ties, no frequency inference, missing/unconfirmed scores, signed distinct
inputs, exact destination/country/type checks, disabled sync, strict visited input,
owner isolation, pending retries, queued writes and late-read deletion protection.
The full application suite includes these tests.

Review corrections also mask unsaved selections/status while account identity is
loading and give successful saves a fresh revision, so a GET begun during a PUT
cannot restore its older server snapshot. A deterministic regression reproduces
that exact interleaving. Both independent review axes rechecked these fixes and
reported no remaining actionable findings within the reviewed corrections.

Final local checks after these corrections: `npm test`, `npm run build`,
`npm run typecheck` and `git diff --check` all passed. No live provider calls
or production database changes were part of these checks.

`personal-home.spec.ts` contains the browser acceptance scenarios: four starter
cards at 375/390/768/1440, All cities/region access, explicit physical visits vs
opened guides, reload persistence, affinity before visits, missing-score behaviour,
account binding/switch and disabled-sync fallback. All eight now pass.

The earlier automatic approval quota block resolved on the subsequent approved
attempt. The production build preview at localhost:3105 serves this personal Home.
All eight `personal-home.spec.ts` browser tests passed (four viewport widths,
explicit visits/reload, affinity priority, owner isolation and honest fallback).
These use synthetic intercepted accounts/APIs; they do not establish real Google
sign-in, cross-device sync or live provider-ranking acceptance.
