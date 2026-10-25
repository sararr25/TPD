# Discovery category implementation — 25 October 2026

Owner: discovery implementation agent; shared working tree, no commit/push.
State: implementation ready for integrated UI verification. Root integrator owns
UI and shared price presentation. No schema, provider configuration or production
state was changed.

## Shared contract and implemented behavior

`CATEGORY_CAPABILITIES` supplies category labels, singular labels, Explore/Twin/
price support and facet names. `TWIN_CATEGORIES` derives enabled Twin categories
from it; `CATEGORY_LABELS`, `categoryHasPrice`, `placeCategory` and
`matchesCategory` support consistent UI and domain validation.

Restaurants, Bars, Cafés, Museums and Hotels now support the full public service
path: category validation, reference lookup, signed reference, trait choices,
Twin search, category/city/hidden-place filtering, explanations, result selection,
photo checks and distinct OSM venue verification. Hotels have no price budget;
restaurants, bars and cafés support only native documented price levels 1–4.
Out-of-contract numeric price values become unknown at the provider boundary.
No fifth tier has been fabricated. No hotel rating is used as a cost.

Cafés use the union of exact Qloo categories `category:place:cafe` and
`category:place:coffee_shop`. A café amenity on a museum/hotel is insufficient.
Food/drink category cleaning applies to cafés as well as restaurants and bars.
Lookup retains the actual category tags in signed references. Delete continues
to exclude exact trait IDs and normalized exact-label aliases in every fallback;
Keep remains a ranking preference and Ignore is unconstrained. No user Passport
record is changed by a search.

## Capability evidence and limits

| Category | Discovery/Twin | Price | Source/city evidence |
| --- | --- | --- | --- |
| Restaurants | Both | Qloo native 1–4 | Existing eleven-city coverage; unchanged policy |
| Bars | Both | Qloo native 1–4 when known | Existing eleven-city Explore evidence; Twin service regression added |
| Cafés | Both | Qloo native 1–4 when known | Two bounded live calls: Paris and Lisbon; other cities supported contractually but live coverage not asserted |
| Museums | Both | No comparable admission amount | Existing coverage; no invented admission filter |
| Hotels | Both | No comparable nightly amount | Existing Explore coverage; Twin service regression added |
| Neighbourhoods | Explore only | None | Locality model/centre-distance rules retained |
| Events | Unsupported source capability | None | No dated event model in current Qloo place contract; see capability proposal |

The two successful sequential live Qloo calls (25 October 2026) requested twelve
places per city, exact category union, zero location-radius widening and no
retries. Paris: HTTP 200, 12 results, 12 category-tag matches, 12 native prices;
Lisbon: HTTP 200, the same counts. Locality was confirmed in both responses.
This proves bounded catalogue availability, not every city's coverage or actual
current menu prices. Raw data remains in ignored `.private/qloo/` at restricted
permissions; no credentials/raw provider records belong in review artifacts.
An initial sandboxed attempt failed before network access; the bounded network
probe subsequently ran with tool approval. Total successful provider calls: 2.

Primary API reference:
[Qloo Insights deep dive](https://github.com/qloo/docs-public/blob/main/reference/insights-api-deep-dive.md).
For actual Events source proposal, fifth-price-tier limitations and A/B protocol,
see [capability and A/B protocol](44-capability-and-ab-protocol.md).
Events and a genuine fifth price level remain explicit requirements requiring
real source data; the registry does not falsely enable them.

## Verification

Focused service and venue checks passed with synthetic fetch responses, no live
provider calls: signed lookup→Twin for each added category; category, city,
unknown-price, hidden-place and Delete-alias filtering; rejection of fifth native
price and hotel budgets; distinct OSM bar/café/hotel category checks; existing
restaurant/museum/Keep/fallback regressions. Cafe-vs-amenity and native-price
normalization 0/5/negative/fractional→unknown are covered.

Commands: `node --experimental-strip-types --conditions=react-server
scripts/check-discovery.mjs` and the equivalent `scripts/check-venue.mjs`.
Initial typecheck reported only expected missing café entries in UI maps being
updated by the integrator; full typecheck/build/browser acceptance belongs to
integration. No release or real-device acceptance is claimed.

Touched modules: discovery domain and client messages, discovery service, Qloo
normalization, quiz-to-provider cafe support, venue verification and the two
focused check scripts. No UI files were edited by this work item.
