# Implementation and verification — 24 October 2026

## Baseline and plan

Source started clean at `55d757b9ea756d77b8b0c0152d6b188c28501741`, release/default
branch `claude/blissful-gauss-dymbeo`. GitHub issues and comments read live;
all prior issues closed. Production baseline: Vercel READY deployment
`dpl_2g8v3cjscLTmyi5sQjodABP5nfVD`, same Git SHA. No obsolete branch merged.
README, handovers 28/27, docs/30/33, glossary and ADRs read; installed Next
navigation guides read before changes. [Routing plan](34-implementation-routing.md)
is generative only; implementation was executed directly under owner authorization.

## Completed work

- City category, per-category prices/areas, tab and List/Map are URL state.
  Place card links carry a city-only return target; internal return restores it.
  Session reading position is recorded on opening a card, restored after results.
  Nested Place routes activate Cities; city Swap activates Swap; remembered city
  guides navigation to its Swap tab. The shared browser history API keeps Back/Forward.
- Mobile City and Place typography/covers compacted. Footer wraps at 320 px.
  Cards, Place and Saved share photo fallback logic and city-photo captions.
  Cached image failures before hydration now advance to the fallback correctly.
- Passport, City, Place, Swap and Home share account-aware load/readiness states.
  Zero/two favourites with a quiz explain completion without restarting the quiz.
  Account error has Retry; old account data is not used as a guest profile.
  Guest adoption applies only to a genuinely empty account and an unowned guest copy.
- Quiz and favourite saves keep an owner-bound pending draft on the browser.
  Retry skips successful writes, preserves resolved choices and survives reload.
  New drafts carry revisions; old retries cannot remove newer drafts. Shared
  saving state disables editor writes. Deletion drains in-flight writes and
  clears pending recovery data. Client owner headers are checked server-side.
- Expired guest selections request refreshed favourites while retaining quiz.
  This client expiry check is only a UX hint: server signatures stay authoritative.
- Example preview is separate from personal favourites, offers example Lisbon
  picks, and requires explicit replacement to adopt. No hidden overwrite.
- Home storyboard implemented at `/preview/home`, development only. Three scenes,
  immediate City/Swap entry, skip link, native scrolling, reduced-motion static
  state, scoped GSAP/useGSAP cleanup. Public Home composition is unchanged.
  `/preview/checks` is a development-only synthetic Place component fixture.
- Read-only catalogue inventory and exact proposed migration in docs/35; no
  production schema/storage writes and no bulk import.

## Diagnosis and iteration

Initial deterministic repro exercised the actual `finishQuiz` function with mocked
network/storage: second account write failed after local storage succeeded, but
no change event was fired. Ranked causes: late notification; retry re-resolving
choices; local loss. Local data remained present; notification was late and retry
repeated resolution. The regression now covers notification/retry plus ownership,
draft revisions and deletion cleanup. It is not evidence of loss in the owner's
previously observed account.

Two review axes found further defects during implementation: guest ownership after
sign-out, incomplete adoption retry, optimistic edit overwrite, exclusion-loading
race, shared Retry editing, pending data surviving deletion and weak pending parsing.
These were corrected before release. New browser tests initially failed on footer
overflow and pre-hydration image errors; both were fixed and rerun. One navigation
test needed an accessible-name assertion because desktop markup includes a hidden
short label, not duplicated visible text.

## A/B technical comparison

Same synthetic API responses, Chrome headless, 390×844 / 320×844. A: isolated
`55d757b` snapshot with webpack (Turbopack rejects the external dependency symlink).
B: current source with Turbopack. No timing/performance comparison is inferred
from these different compilers. These are functional/layout comparisons, not a
randomized user experiment, statistical uplift or preference judgment.

| Measure | A | B |
|---|---:|---:|
| City cover height at 390 px | 536 px | 404 px |
| Horizontal overflow at 320 px | 22 px | 0 px |
| Quiz auto-starts with existing quiz / zero favourites | Yes | No |
| Explains missing favourites | No | Yes |

## Verification boundary

`npm test`, `npm run typecheck`, `npm run build`, `git diff --check`.
`npm run test:browser`: 20 Chrome fixture tests: account 0/1/2/3/5 favourites;
delayed/error account; isolated example; per-category filters/history/nav;
320/390/768/1440 and reduced motion; real Place component fixture return,
Back/Forward and reading position; reload/retry with intended account header;
long-name/missing-coordinate/broken-photo Place at four widths; expired guest
selections and foreign-account pending isolation. No account mutations outside
fixtures. The Place return test exercises the real component in a development
fixture route, not Qloo server lookup or a physical-device end-to-end journey.

Build verifies private preview routes render not-found outside development.
Private screenshot `.private/home-preview.png` uses guest/fixture APIs. Provider
photos remain external URLs, never downloaded for catalogue reuse.

Remaining acceptance: owner Home visual approval; real Google sign-in, physical
phone, assistive technology and cross-device/account switching; statistical A/B
needs traffic and participants. No claim that everything is perfect. No production
catalogue import until schema scope and applicable provider rights are confirmed.

## Step status

1–4 implemented and locally verified. Step 5 private preview ready for owner review.
Step 6 inventory/proposal ready. Step 7 pending explicit production schema approval,
rights confirmation and pilot review; ten-city expansion remains after Lisbon
acceptance. Step 8 local verification complete; release receipt added after deployment.

References: [GSAP React](https://gsap.com/resources/React/),
[ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).

## Local production receipt and publication blocker

Implementation commit: `ee06305` (`fix: preserve city context and recover Passport saves`).
Full test suite, typecheck, production build and 20 browser checks passed. A local
production server additionally returned 200 for `/`, `/lisbon`, `/passport` and
404 for `/preview/home`, `/preview/checks`, confirming the preview gates at runtime.

The attempted push to `https://github.com/sararr25/TPD.git`, branch
`claude/blissful-gauss-dymbeo`, was rejected by automatic approval review because
it requires explicit authorization for exporting this repository payload to that
remote. No workaround was attempted and no new deployment was triggered.
The verified public deployment remains the baseline `55d757b` receipt above.
Next action: obtain explicit push authorization, then verify remote commit,
Vercel READY state, alias and public HTTP responses. The Home review and catalogue
production-schema approval remain separate pending decisions.
