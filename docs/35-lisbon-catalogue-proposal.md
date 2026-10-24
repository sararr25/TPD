# Lisbon catalogue pilot — proposal, not applied

24 October 2026. Read-only inventory: 44 provider_cache rows (bounded to 300),
94 distinct eligible Lisbon place IDs; 26 repeated occurrences removed. No
account tables read; zero Qloo requests. Snapshot oldest source 23 October
20:16 UTC. Private inventory: `.private/catalogue/lisbon-inventory.json`.
The inventory deliberately discards personalized evidence IDs.

| Coverage | Count |
|---|---:|
| Restaurant classification | 58 |
| Bar classification | 33 |
| Museum classification | 20 |
| Hotel classification | 0 |
| Has image URL, not verified photo | 89 |
| Has coordinates | 94 |
| Has indicative price | 63 |
| Editorial/photo-rights approval | 0 |

Categories overlap; totals must not be summed as distinct places. These are
eligible candidates, not 94 verified recommendations or current opening data.
The existing temporary cache is not changed into a permanent catalogue.

## Proposed pilot and quality gates

Select at most 50, target 40: approximately 15 restaurants, 10 bars, 10 museums,
5 hotels if confirmed. Deduplicate globally by provider + UUID before category
allocation. Reuse existing `explorePlace` rules; reject closed/off-category and
wrong-city places, missing coordinates/address; review ambiguous multi-category
places manually. Assign neighbourhood only from verified coordinates and source,
never infer price. Keep at least two known price tiers where available; report
unknowns separately. Do not fill hotel gaps with restaurants or resorts outside Lisbon.

Photos: inspect original URL, visible venue relevance, logo/blank-image heuristic,
response status and dimensions. A URL alone is not approval. For missing/rejected
photos use explicitly captioned city cover, then “No place photo”. No download,
rehosting, bucket or new provider is proposed. The public Qloo terms do not by
themselves verify the project's negotiated hackathon rights: the applicable
agreement must confirm durable metadata retention and image display before import.
Source: https://www.qloo.com/legal/terms (checked 24 October).

## Exact scope requiring approval

[Proposed SQL](proposals/lisbon-catalogue.sql): one new `curated_place` table,
provider/UUID primary key, one city/review index, RLS enabled with no public
policies. Columns include provenance, review and photo status, observed/review/refresh
timestamps and only supported traits. No account columns, schema rewrites or
changes to `provider_cache`. Existing server-only DB connection; no client DB access.
No bucket and no storage provisioning. Apply transactionally only after approval.

Initial import maximum 50 Lisbon rows, no other city. Store entity projections,
not provider responses, account signals, tokens or saved notes. An approved
catalogue may enrich photo/metadata for IDs produced by live taste ranking; it
must not silently replace provider failures with a fixed list. If a separate
catalogue browse is added, label it “Curated Lisbon”, not personal/live results.

## Requests, costs and maintenance

No API quota used by this inventory. To fill hotels and refresh aged metadata,
propose at most four sequential category requests (one per category), no automatic
retries. Then up to 50 image checks, only after permitted use is confirmed.
Estimate 50 projections under 1 MB plus indexes; this is a size estimate, not a
billing quote. Existing Neon plan/headroom and contractual Qloo/image quotas have
not been independently verified. No paid plan or new service is authorized.

Manual review before activation; mark metadata due after seven days, review before
refresh, no scheduled job yet. Hide rejected/closed entries. Recheck photo rights
and source availability before public use; retain source timestamps. Extend to the
other ten cities only after Lisbon acceptance. Import and extension remain pending.
