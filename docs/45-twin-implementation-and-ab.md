# Twin, motion and UX — implementation and A/B receipt

25 October 2026 · Branch: `codex/twin-motion-ux` · Local implementation.
Source baseline A: `e835875f35b88f92ae0d33408f2dc1aa2a771bfc`.
The default/release branch remains `claude/blissful-gauss-dymbeo`; remote main
is a separate publication destination. No remote push, deployment, production
schema change, storage provision or default-branch change is part of this receipt.

## Owner amendment

The owner authorized implementing the complete plan, followed by A/B comparison
and corrections. The owner then explicitly chose **€–€€€€ using the four real
provider tiers for now**. This supersedes the earlier five-tier acceptance gate
in the original specification and #39. No fifth bucket is fabricated.
The owner approved the browser journey and service logic as the testing seams.

## Delivered behavior

- **Twin throughout the active product:** desktop/mobile navigation, City tab,
  Home forms/demo, contextual copy and accessibility labels. Existing `/swap`
  and `?tab=swap` links remain compatible.
- **Shared categories:** Restaurants, Bars, Cafés, Museums and Hotels work
  through lookup, signed starting-place validation, matching, explanations,
  Place/Card entry points and map verification. Exact café category tags were
  verified in two bounded successful Qloo requests (Paris and Lisbon, 12 exact
  café results each). No new provider choice or production migration.
- **Filters:** shared category capabilities; native euro tiers for food/drink;
  category-specific facets; near-neighbourhood filtering with the declared
  within-2-km-of-centre rule. Filters on returned Twin matches explicitly say
  they filter that selection. City filter context survives navigation/history;
  Twin workspace choices stay per city/category. Hotel budget is not fabricated
  from restaurant tiers or hotel stars.
- **Compact editor:** six dense rows with explicit, mutually exclusive
  Keep/Delete/Ignore. Ignore is the default. Delete maps to the existing hard
  trait-exclusion contract, not account or Passport deletion. Keep remains a
  preference; unmatched kept traits are disclosed in result details.
- **Immediate result:** submitting replaces the editor at the task's viewport
  with status, a compact editable recap and the first visible ranked result.
  Immediate viewport normalization preserves the action context rather than
  sending the visitor to the bottom of the page. Result count, why, euro/unknown
  price and Save/hide actions are visible. The result receives keyboard focus
  without another scroll. See other matches appears only when needed and
  deliberately scrolls/focuses the remaining-results heading.
- **Robust states:** busy, error/retry, zero/one/multiple results, stale edits,
  request aborts, hidden results and per-account ownership remain explicit.
  The primary card is not duplicated in the secondary list. Map pins use the
  same filtered result order; the map mounts only when its disclosure opens.
- **Motion:** finite multistage Passport-A hero (security lines, type, paper,
  emblem, bookmark and stamp); real scroll-linked photo parallax on Home,
  City and Place; viewport entrances for sections/cards and async results.
  Stable controls, one transform owner per layer, cleanup and reduced motion.
- **Static fallback:** a useful no-JavaScript Passport/cities message replaces
  the previous shell's indefinite Loading-only experience. This is not a claim
  that personalized forms or the entire app work without JavaScript.

## Dated Events: honest municipal pilot

The Events category opens a genuine dated-event browse in **Paris**, from
[Ville de Paris / Que Faire à Paris](https://opendata.paris.fr/explore/dataset/que-faire-a-paris-/information/).
The fixed-host server adapter requests at most 50 records overlapping the next
30 days, validates city/dates/venue/source URLs, deduplicates, bounds response
size and time, projects HTML to plain text, and attributes ODbL. A stable hourly
query bucket permits cache reuse. No source images are redistributed.

The UI supports From/Until, event type and free/paid/unknown admission, shows
Europe/Paris and source detail links, and explains ranges/ongoing exhibitions.
It does not claim continuous sessions, tickets, availability, personal Twin
ranking or the entire municipal catalogue. Events are distinct from venues.

Live checks: the public upstream returned HTTP 200; the local app endpoint
returned HTTP 200 with **50 eligible dated Paris events**. Fixture tests also
cover unsupported cities, upstream failures and validation failures. Other
cities are explicitly unsupported; Lisbon provides its official agenda link.
Lisbon's API was not live-validated. Extending dated event coverage to all cities
and personalized event twins remains a follow-up, not an achieved capability.

## A/B method and measurements

A and B ran on separate local ports with the same Chrome, guest fixture,
starting place, six traits, three results, image responses and 500-ms search
latency. The A/B spec is opt-in via `TWIN_AB_BASE_URL` so the ordinary browser
suite does not require an old server. Reproduce with the baseline running and
`TWIN_AB_BASE_URL=http://127.0.0.1:3101 npx playwright test scripts/browser/twin-ab.spec.ts`
(with the temporary recorder path if video support is not installed).
No human participants, live personal profile writes or live Qloo
requests were used by browser regressions. A used an immutable archive of the
baseline. B used this branch's implementation. Private screenshots and videos
are ignored under `.private/twin-ab/` and browser output directories.

This is a bundled technical/visual before-after comparison, **not a randomized
human experiment**. No conversion lift, statistical significance, user-preference
winner or isolated causal effect is claimed.

| Measure | A, 390px | B, 390px | A, 1440px | B, 1440px |
|---|---:|---:|---:|---:|
| Six-trait editor/context height | 1566.19px | 740.30px | 998.50px | 719.30px |
| Reduction | — | 52.73% | — | 27.96% |
| Name visible after response without manual scroll | No | Yes | No | Yes |
| Why visible after response | No | Yes | No | Yes |
| Primary actions visible after response | No | Yes | No | Yes |
| Explicit other-match navigation | No | Yes | No | Yes |
| Horizontal overflow | 0px | 0px | 0px | 0px |

A/B uses a 900px viewport height to compare both widths. The actual journey also
checks 390×844, 1440×900, 320×700 and short 812×375 landscape. The normal mobile
viewport check includes the arrow clearing the bottom navigation. Values are
synthetic measurements, not scores from real users.

## Corrections made during verification

1. Removed horizontal translation from the hero's paper entrance after the
   long-name responsive checks caught transient overflow. Rotation/depth and the
   rest of the choreography remain; all four Home widths were rechecked.
2. Moved the in-place outcome's target upwards after a 390×844 test found the
   other-match arrow overlapping the bottom bar by about 11px. The regression
   now measures arrow clearance, not just card visibility.
3. Added explicit completion focus and editor-return focus, with preventScroll
   on the completed heading. The explicit arrow transfers focus to the next
   heading and respects reduced motion.
4. Deferred map mounting until its disclosure opens and expanded pin lookup to
   include the primary match. This avoids a hidden zero-size map and a pin that
   cannot reach the primary card.
5. Restricted facets to meaningful category metadata, so a Cuisine control does
   not offer an atmosphere trait. All controls filter the same map/card set.
6. Updated two unstable test interactions: keyboard events target the city input
   instead of the global page; back-navigation assertions select the visible
   accessible heading instead of hidden streamed/cached inactive DOM, waiting for loaded photo content before measuring it. Focused reruns: keyboard
   3/3, desktop motion/back 2/2. These were test corrections, not invented app fixes.

## Verification and review boundaries

- Full unit command, including added public-service category/exclusion/budget
  regressions and municipal-event parsing/failure tests: passed.
- TypeScript and diff whitespace checks: passed.
- Browser validation: 55 distinct scenarios covered. The last full development
  run passed 51 and exposed four test-selector races against hidden streamed DOM;
  after making active-content/photo readiness explicit, all 12 Home/motion tests
  passed together, including all four affected scenarios. The other 43 scenarios
  passed in the full run. Keyboard 3/3 and desktop parallax/back 2/2 also passed
  repeated focused checks. This is not described as one uninterrupted 55/55 run.
- Production build: passed; post-build typecheck and whitespace checks passed.
- Production-mode Home/Twin/Events browser smoke: **20/20 passed**, including mobile/desktop/short landscape, loading/error, category deep links and event filtering.
- Browser scenarios cover Home → Twin → reference → main match → other matches;
  0/1/3 results, failure, category links, choices/stale state, events filters,
  no horizontal overflow, history, guest/account isolation, save feedback,
  async reveal, actual frame-relative parallax, reduced motion and no-JS fallback.
- Video captures demonstrate actual motion; root also inspected matched mobile
  screenshots and the final viewport showing the main match and unobscured arrow.
- Implementation agents supplied narrow handoffs and focused tests. Their later
  turns hit the service usage limit. Consequently the final diff/visual review
  was performed by the integrator; a final independent review was not completed.
- Real phones, VoiceOver, genuine Google sign-in/cross-device and production
  behavior were not newly tested. Prior receipts do not stand in for these checks.

## Delivery board

| Card | Owner | State | Evidence / handoff |
|---|---|---|---|
| A / #37, vocabulary and contracts | integrator | Local review | Glossary/ADR amendments, navigation and legacy-link checks |
| B / #38, categories/filters | discovery agent + integrator | Local review; wider Events coverage open | Discovery handoff, signed-reference/service tests, Events source/UI tests |
| C / #39, native price | integrator | Local review under owner amendment | Four real tiers, shared symbols/labels, unknown-price tests |
| D / #40, compact editor | integrator | Local review | A/B height measurement, explicit choices, responsive/keyboard checks |
| E / #41, match outcome | integrator | Local review | Viewport and arrow/focus/0/1/3/error/stale journey checks |
| F / #42, motion | motion agent + integrator | Local review | Motion handoff, recordings, frame-relative parallax/reduced-motion tests |
| G / #43, integrated acceptance | integrator | Local verification complete; independent review open | Unit/typecheck, browser suite/build; independent review remains unproven |

Harness: Codex and Playwright. Integration branch/workspace is the existing root
checkout, with exclusive file ownership rather than separate writable worktrees;
this deliberate adjustment avoided overlapping writes and copying private env
configuration. No branch has been merged or published. No new shared skill.

## Final local receipt

Production build completed successfully; all 20 selected production-mode browser
checks passed. Full unit checks, focused discovery/events regressions, post-build
TypeScript and whitespace checks passed. The running local preview is the compiled
production build at http://127.0.0.1:3000. The isolated A/B baseline was stopped
and its temporary env symlink removed. No remote branch or deployment was changed.
