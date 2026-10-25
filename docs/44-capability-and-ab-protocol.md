# Twin capability findings and A/B protocol

25 October 2026 · Research owner: capability_research · Status: research
complete; implementation and comparison receipts belong to the integrator.
Read with [approved specification](40-twin-motion-ux-spec.md). Research was followed by the Paris municipal-events implementation.
No production data or deployment was changed. The integrator verified the upstream
HTTP 200 and the app endpoint returning 50 dated events; see the implementation receipt. Zero
live Qloo calls; discovery owner retains the shared 12-request budget.

## Capability decisions

### Native prices

The [Qloo parameter reference](https://github.com/qloo/docs-public/blob/main/reference/insights-api-deep-dive.md)
documents restaurant-style `price_level` integers **1–4**. Its numeric
`price_range` filters describe hotels; hotel class and rating are separate
measurements. None provides five venue-price groups from existing ordinal data.

Therefore retain native provenance and unknown prices. Switching dollar glyphs
to euro glyphs is feasible immediately; relabelling four values onto five
positions cannot create five distinguishable groups. Never use ratings,
popularity, hotel stars, or a duplicated highest bucket to manufacture a fifth.
A genuine fifth tier needs additional amount data, currency, unit (meal/drink/
entry/night), observation date and a documented category-specific threshold
contract. Such enrichment is absent from the current venue projection. The
five-tier requirement originally remained open until that contract had actual data.
The owner subsequently chose four real tiers for this delivery; #39 now follows
that explicit amendment, not a cosmetic claim of five tiers. If presenting a fifth UI choice for
forward compatibility, explain unsupported data instead of silently treating it
as Any price. Numeric event prices must stay separate from venue tiers.

### Real Events: municipal-source pilot

Qloo's [entity/parameter guide](https://github.com/qloo/docs-public/blob/main/reference/available-parameters-by-entity-type.md)
documents Places but no event entity. A concert hall is a venue, not a dated
concert. No live event-coverage claim follows from that documentation.

The strongest executable proposal is a **Paris pilot** using the official
[Que Faire à Paris dataset](https://opendata.paris.fr/explore/dataset/que-faire-a-paris-/information/).
It publishes dated events, locations, tags, access and textual pricing, updated
daily under ODbL. Its [API console](https://opendata.paris.fr/explore/dataset/que-faire-a-paris-/api/)
documents the public Explore 2.1 records endpoint; the dataset ID ends in a
hyphen: `que-faire-a-paris-`. Raw endpoint access was not successfully verified
by the research browser; indexed official console responses do expose JSON.

Implementation proposal: server-only adapter; bounded 50-result requests; fixed
host; timeout and cancellation; explicit date overlap query; restrict to Paris
rather than silently include the whole region. Normalize ID, title, start/end,
occurrences, Europe/Paris timezone, venue/address/coordinates, tags, original
URL and source update time. Interpret date ranges as ranges, not a continuous
show; keep occurrence/detail link. Sanitize HTML to text. Show free/paid/unknown
and source wording, not inferred numeric price. Use data attribution plus licence
link; omit photos initially because dataset licensing does not establish every
contributor's image rights. Do not label this Qloo-personalized ranking. Missing
fields, upstream errors and unsupported cities have separate visible states.

Lisbon remains a second source proposal:
[official municipal dataset](https://dados.cm-lisboa.pt/dataset/agenda-cultural-de-lisboa)
identifies AgendaLX and CC Attribution, with public API documentation at
[AgendaLX API](https://agendalx.pt/api/). Both API/site fetches failed in this
research environment (520/inaccessible); no live records were verified. The old
2019 archival export is not a current-events feed. Implement only after a live
bounded JSON response and its date/location schema are checked. Other cities
need individual official-source coverage; a universal Events chip must clearly
explain coverage instead of producing empty invented results.

**Activation gate:** owner/integrator verifies an actual bounded upstream
response, licence attribution, normalized fields and browser path. Fixture-only
adapter tests prove parsing and UI, not municipal uptime or city coverage. No
new paid provider, API key, database schema or storage provision is necessary
for a request-time pilot. Transient cache reuse may use the existing approved
store only if its contract supports the projection.

## A/B technical and visual comparison

This is a reproducible comparison of the old and new product, with multiple
changes bundled. It cannot isolate which individual change improves human task
completion, establish statistical significance, or measure a conversion uplift.
No human participants or traffic volume have been supplied. Use the evidence
below to find regressions and correct them before delivery; keep any future
randomized user experiment a separate activity.

**Hypothesis:** the compact Twin editor and in-place main result reduce wasted
space and expose success without discovery scrolling, while visible hero,
parallax and entrance motion make the Passport story legible without delaying
its actions.

- A: immutable application baseline `e835875`; record full resolved SHA.
- B: implementation checkout; record SHA plus uncommitted diff state/hash if
  not committed. A/B copies must use separate ports and output directories;
  avoid running two Next processes against the same `.next` directory.
- Use identical Playwright request fixtures at the existing API seam, fixed
  guest Passport, six editable traits, one reference and three deterministic
  matches. Match IDs, metadata, images and 500 ms response delay stay identical.
  No signed-in account, live Qloo, analytics or personal storage is needed.
- Freeze viewport, device scale, browser version and initial scroll per pair.
  Primary viewport pair: 390×844 and 1440×900. Guardrails: 320/375/768px,
  812×375 landscape, 200% text, keyboard and reduced motion.
- Keep a fresh context per scenario. Use the same deterministic fixture image
  or identical broken-image fallback on both variants. Disable unavailable map
  tiles consistently; do not credit one variant for network conditions.

### Measurements and pass gates

| Measure | Method | Gate for B |
|---|---|---|
| Editor and context height | Browser bounding rectangles from selected reference through Find its twin with six traits | At least 35% shorter at 390px, with readable text and 44px targets |
| Immediate success | Record viewport and primary result bounds immediately after response settles, without manual scroll | Name, why, price known/unknown and primary action visible at primary viewports |
| Result discovery | Home → City/Twin → reference → submit → main result → See other matches | Explicit count/status; no duplicate main card; arrow scrolls to and focuses other-match heading |
| Feedback latency | Delayed fixture, observe button/state immediately after click | Busy/disabled and readable status before response; no decorative wait after response |
| Honest query state | Edit category/traits/price after success, then search again | Previous result marked stale; no automatic hidden query; recap tied to effective search |
| Search safety | Existing service seam fixtures | Delete survives every fallback; aliases normalize; unknown price excluded only under an active limit; correct signed category |
| Hero story | Same initial viewport, video first 2 s | Three perceivable finite phases; controls available immediately |
| Actual parallax | Same photo bounding position before/after fixed scroll; compare image relative to its clip | Relative decorative/photo offset changes with scroll; no text/control drift or exposed edges |
| Scroll appearance | Record below-fold section entering viewport and asynchronous matches | Visible entrance when reached, bounded stagger, no permanently hidden content |
| Reduced motion | Repeat main route/arrow test with media preference | No parallax or animated scroll; complete readable content and status |
| Navigation | Repeat route changes, Back/Forward and resize | No replay trapping, stale motion styles or hidden content |
| Layout/focus | Measure scrollWidth, screenshots, keyboard pass | No horizontal overflow, unobscured actions and visible focus |

Baseline failures are observations, not a reason to loosen B's gates. If A lacks
Keep/Delete/Ignore or Events, mark that capability absent and compare the shared
parts fairly. For motion compare real video, not just still screenshots or CSS
class presence. Performance observations from desktop emulation must remain
labelled as such; do not claim actual phone or screen-reader acceptance.

### Fix and retest loop

1. Save each A/B screenshot pair and short video in ignored private QA output.
   Persist only aggregate measurements and scenario IDs in the report.
2. Have an independent reviewer inspect matched pairs/videos and complete the
   gates above; record concrete defects with viewport and reproduction steps.
3. Integrator corrects each confirmed defect. Repeat only affected scenarios,
   then run the full relevant browser flow and service tests.
4. Final receipt records A/B refs, fixture identity, before/after dimensions,
   viewport checks, corrected findings, remaining unsupported capabilities and
   unit/typecheck/build results. Link evidence without committing provider raw
   data, tokens, personal account data or third-party images.
5. Do not write “B wins with users”. Report precisely which measured gates B
   passes and which need owner visual review or real-device validation.

## Handoff

Discovery owner: verify Cafés and Bars registry/filter/signed-selection coverage;
retain ownership of the live Qloo request counter. Integrator: choose municipal
Events activation only after source gate, preserve explicit five-price data gap,
and run comparison/corrections. This document proposes evidence collection;
it does **not** claim an A/B run or finished Events integration.
