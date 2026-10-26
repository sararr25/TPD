# Coverage, Lisbon catalogue and submission decision packet

Programme #44 · 26 October 2026 · Proposal only; no migration/import/activation.

## Supported discovery scope

The current shared capability registry enables venue Twin searches for Restaurants,
Bars, Cafés, Museums and Hotels across the eleven configured cities. This is a
supported request contract, not a guarantee that every category/city returns places.
Native indicative four-tier price filtering applies to food/drink categories;
hotels, museums and municipal admission pricing are not mapped onto that scale.
Neighbourhood discovery remains separate from venue Twin matching.

Events uses the existing Paris-only municipal adapter. It returns at most 50
eligible dated listings overlapping the next 30 days, with date/type/admission
filters over that supplied selection and original verification links. Other cities
show unsupported coverage explicitly. It is neither personalized event Twin
matching nor complete city-agenda coverage. Current official dataset description
confirms that its records concern Paris and its region; the adapter additionally
requires the city field to be Paris. No new live event fetch was made here.

Broader Events work requires a separate bounded source proposal per city: current
endpoint, actual dated records, location/timezone, attribution, request budget,
error handling and acceptance fixtures. Lisbon's official agenda is a pointer,
not proof that a current API integration has been accepted. Keep broad coverage
and event twins explicitly deferred; this does not silently satisfy those parts
of the original #38 request.

## Fresh bounded Lisbon inventory

Existing read-only inventory command inspected up to 300 newest provider-cache
rows, discarded personalized evidence and queried no account tables. Actual run:
9 cache rows inspected, 0 eligible Lisbon places; zero Qloo requests. All category,
photo, coordinate and price counts are therefore 0. This is the content of a
transient cache at observation, not evidence that Lisbon lacks provider coverage.
The old 94-place inventory must not be reused as a current import packet.
Aggregate log: `/tmp/tpd-next-catalogue-inventory.log`; raw projections remain
ignored and restricted under `.private/catalogue/`.

## Concrete pilot proposal retained for review

- Target 40, acceptable range 30–50, maximum import 50 unique Lisbon provider IDs.
  Retain the earlier proposed mix of roughly 15 restaurants, 10 bars, 10 museums
  and 5 hotels only if real coverage supports it. Report gaps rather than filling
  categories with wrong-kind or wrong-city places. Cafés are supported in live
  discovery but are not silently added to this existing four-category SQL proposal.
- Reuse the exact existing proposed `curated_place` table and city/review index:
  provider/UUID identity, Lisbon restriction, category set, coordinates/address,
  native price tier, provenance/observation time, rights/photo/editorial review
  states and refresh timestamps. RLS with no public policies and no PUBLIC grants;
  server-only existing Neon connection. No account fields or provider-cache changes.
- No new storage bucket, downloaded/rehosted photo library, paid service or provider.
  Display original photo URLs only after applicable display rights and relevance
  are established; otherwise use the existing labelled city/no-photo fallback.
- Before any import, confirm the applicable hackathon/negotiated API agreement
  permits durable projected metadata retention and intended image display. Qloo's
  current public terms explicitly defer to superseding signed agreements and
  service-specific additional terms. Those public terms alone cannot establish
  this project's contractual permissions; no private agreement was found/read here.
- Proposed collection allowance remains at most four sequential category requests,
  no automatic retries; stop on authentication/quota errors. After rights review,
  at most 50 image checks. These requests have not been made in this task.
- Existing size estimate: under 1 MB of 50 projected records plus indexes; this is
  not a verified bill. Neon plan/headroom and contractual request quotas must be
  checked against the actual owning account before approval. No price is invented.
- Apply the approved new-table migration transactionally, after rights/cost/scope
  approval. Validate a staged bounded selection, then import approved projections
  with source timestamps; never raw provider payloads or private preferences.
- An accepted catalogue may enrich IDs returned by taste ranking. Do not replace
  provider failures with a fixed catalogue while claiming personalized results.
  Any separate browse must be labelled Curated Lisbon.
- Manual editorial/photo review before activation; mark metadata due after seven
  days, review refreshes manually, hide rejected/closed records. No scheduler yet.
- Before activation rollback is the proposed new-table-only drop; after activation,
  disable catalogue reads and preserve reviewed data for correction before deciding
  on deletion. Do not drop production data as an acceptance test.

Decision packet status: exact earlier schema is available, current inventory is
empty, rights/real selection/cost headroom remain missing. No approval to apply is
requested until those missing pieces make the proposal reviewable. Extension to
the other ten cities follows Lisbon acceptance, not this planning document.

## Submission readiness

No root project licence file was found. Keep the application marked private until
the owner chooses a licence and the intended hackathon's actual rules are checked.
A submission checklist should include: accepted licence; third-party dependency
and original-art credits; photo/data rights and attribution; no secrets/private QA
or provider payloads in source; current demo URL and release SHA; bounded product
claims (Paris Events, indicative prices, no availability guarantees); privacy and
normal-account flow; and an actual device/accessibility acceptance receipt.
No submission, licence selection, publication or claim of competition eligibility
was performed here.

## Sources and limits

- Current project source, ADRs and programme #44; historical catalogue proposal
  and exact proposed SQL are retained, not applied.
- [Qloo public terms](https://www.qloo.com/legal/terms), read during this work:
  superseding negotiated agreements and additional service terms are explicit.
- [Official Paris dataset information](https://opendata.paris.fr/explore/dataset/que-faire-a-paris-/information/),
  read during this work: municipal agenda scope, current identifier and schema-change
  notice. No new upstream uptime/coverage or image-rights acceptance is inferred.
