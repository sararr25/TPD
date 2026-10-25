# Approved city photos and personal Home — 25 October 2026

## Owner decisions

- Home selection: Passport affinity first, then real-world travel history.
- “Visited” means physical travel, never opening a guide.
- New visitors should get a fixed shortlist, still to be agreed.
- The owner approved all eleven photographs in docs/48's review board.

## Implemented locally

The approved photographic sources replace the older Qloo city-cover set via
shared `cityCover()`. The set now includes Phu Quoc. Existing place photographs
retain their own source; only the explicitly labelled city fallback changes.

`src/lib/city-photos.ts` retains title, photographer, source page, source license
label/link and dimensions. Small sources are 960px; large cover sources are
1280px. Tracking query parameters are removed. `COVERS` keeps the existing city
codes and country lines. City cards/covers use the approved board's slight
saturation/contrast treatment and central crop.

`/photo-credits` lists all eleven source/photographer/license records and explains
responsive crops and tonal treatment. The footer links to it from every route.
All eleven actual 1280px CDN URLs loaded in Chrome; large cover crops were
visually inspected. Private evidence: `.private/city-photo-proposal/approved-cover-crops.png`.
No images were copied into repository assets and no raw Qloo data is committed.

## Personal ranking feasibility / remaining decisions

The existing stamps are deduplicated first-guide-open activity, not travel
history or visit counts. They will not be repurposed as physical travel.
No existing production travel-history resource was found; do not silently add
new schema or write fabricated history.

A bounded Qloo feasibility check used a synthetic Khruangbin interest, never
the owner's Passport. Destination search and affinity insights returned 200.
A one-destination `filter.results.entities` check returned only the requested
Lisbon record with a real provider affinity. This proves endpoint/filter access,
not acceptance of a complete eleven-city personal ranking.

The identity checks found duplicate Barcelona destination records with matching
names/country/coordinates and no distinguishing metadata; the first Phu Quoc
query returned Phuket, which is not a valid substitute. A separate check uses
the Vietnamese locality name already in the app; inspect its private receipt
before making a stronger coverage claim. Private probe responses remain under
`.private/qloo/home-city-probe/` and must not be published.

Questions sent to owner before dependent implementation:

1. Confirm the fixed guest shortlist; proposed Lisbon / Paris / Tokyo / New York,
   with Lisbon / Porto / Barcelona / Madrid as another explicit option.
2. Record real visited cities plus visit counts, or visited cities alone?
3. If a destination identity/affinity cannot be verified, may it remain available
   in All cities / travel history without an invented affinity?

No Home shortlist or travel-history UI/storage/ranking is implemented yet.
The Home still shows all eleven pending these answers. The photo approval does
not approve a production migration or constitute publication authorization.

## Verification

- Production build PASS: `/tmp/tpd-approved-photos-build.log`.
- Home regressions 7/7 PASS: `/tmp/tpd-photo-browser.log`.
- Credits and remaining motion cases PASS; desktop once-reveal test exposed a
  test race: it could assert server-visible opacity/transform before the first
  IntersectionObserver delivery. Waiting two animation frames before assessing
  settlement fixes that seam; three desktop repetitions PASS in
  `/tmp/tpd-photo-motion-repeat.log`.
- Updated image fixtures intercept both Qloo and Wikimedia so missing-photo
  tests remain deterministic and ordinary browser checks make no CDN requests.
- Final focused checks are recorded below after completion.

This supersedes docs/47–48's pending-photo status, while the personal Home
shortlist/grid/travel decisions remain pending. No push, deployment or schema
change was performed.

Final receipt: new credits + UI refinements **12/12 PASS**
(`/tmp/tpd-approved-photo-final.log`); typecheck and diff whitespace PASS.
The Vietnamese-name query also returned only Phuket, so no Phu Quoc destination
mapping is accepted. Total bounded provider feasibility calls: 15; no retries,
owner data or production database writes. The local production preview at
`http://localhost:3104` now serves the approved photographs and credits.
Production-mode credits/eleven-city smoke PASS:
`/tmp/tpd-photo-production-smoke.log` (1/1).
