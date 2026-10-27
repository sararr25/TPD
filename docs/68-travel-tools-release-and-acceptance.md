# Travel tools and integrated acceptance — 27 October 2026

Owner requested implementing #53–58, then pushing live and reviewing all open checks. This explicitly authorizes publication of the pending #46–52 work as well. Baseline is `dfb92e26f28b6b0e4ad0727dfc63f4f1123252be`, default/release branch `claude/blissful-gauss-dymbeo`; auth/provider/production branch choices remain unchanged.

## Contracts and prototype

Read [the concrete data contract](67-travel-tools-data-contract.md). It was posted to #56/#57/#58 before backend changes. Additive exact SQL is in `db/proposals/2026-10-27-travel-state.sql`, also included in the fresh-install schema. No existing Saved data or votes are migrated. The owner’s implement-and-publish instruction covers this necessary addition; no destructive migration is involved.

Throwaway prototype: local branch `codex/travel-state-prototype`, commit `cb353fe34b4259376299e8caa06faebf585f8973`, standalone `travel-state-prototype.html`. Click-through evidence `/tmp/tpd-prototype-walkthrough.log`: comparison selection; group move; declare/undo visit; expired-reference reset; owner switch. It issues zero requests and contains no persistence or private data. The prototype shell is not part of the production branch.

## Implemented

| Ticket | Delivered behavior |
|---|---|
| #53 | Native top-layer Save dialog, desktop viewport clamping/mobile sheet, Escape/outside close and origin focus, local errors preserving input; busy guards. Queued toast messages preserve Undo/Change and critical errors until used/dismissed; normal messages time out with focus/hover/visibility pause. Feedback is owner-scoped. Quiz control motion uses the shared 220ms panel token; decorative scenes remain finite and reduced motion stays supported. |
| #54 | Up to 3 current result projections in memory, isolated per owner; explicit Compare tray/dialog, removal/reset, known/unknown price tiers, shared and individual traits, supported reasons or honest absence, Save and available Directions. No private notes, provider requests, new score, or change to the Qloo-vs-AI route. |
| #55 | Deliberate recent search/trip entry on Home. Seven-day owner-scoped draft keeps only city/category/reference ID+name/choices/budget; no old result or signed token. Resume refreshes the reference, restores only still-present traits and requires an explicit Twin submission. Temporary choices can reset without changing Passport. Storage failure is disclosed. |
| #56 | Backward-compatible metadata next to existing Saved records: named groups/presets, move-between-group and keyboard Move up/down. Groups/order persist, coordinate list/map numbering and preserve Saved notes. Group removal ungroups rather than deletes places; list deletion removes its organisation metadata. Guest local storage; private account document with intended-owner header and atomic revision conflicts. |
| #57 | An explicit I visited this place disclosure and Mark as visited action, Would go again / Not for me and optional private reason, update/undo and account/guest isolation. No visit inferred from Save/open, no migration of old votes, no external notifications. Copy explicitly states the effect: private trip feedback does not change Passport/ranking, hide the place or mark its city visited. |
| #58 | Travel notebook extends existing sharing: deliberate selection, ordered public names/groups/cities/available addresses, export date, downloadable standalone HTML and print view, missing-address state, no account required. Private Saved notes, visit reasons, tokens, owner IDs, maps and images are excluded; existing links/postcards remain. No offline navigation promise. |

Account metadata can be cleared independently in Settings. Deleting the account removes its private document via FK cascade. Guest metadata is not adopted into an account implicitly. Failed writes retain the visible draft and offer Retry/Reload; revision conflicts never silently replace another device’s changes. Reload explicitly discards the local unsynced draft in favour of the server copy.

## Verification log

- Whole compiled browser suite: **155 passed, 11 intentionally skipped, 166 total** (`/tmp/tpd-six-final-browser.log`). Skips: five development-only Place acceptance scenarios, one development-only photo propagation scenario, two development-only travel scenarios, one development-only Place parallax scenario and two opt-in immutable historical A/B comparisons. These skips are not passes; no new statistical or recommendation-quality A/B claim is made.
- Final release-build focused regressions after Safari opener-focus and singular-count corrections: **36 passed, 2 development-only skips** (`/tmp/tpd-six-release-focused.log`), covering all travel journeys and review refinements. This overlaps the whole-suite count; do not add the numbers together.
- Final development-fixture run: **9/9 passed** (`/tmp/tpd-six-release-dev-fixtures2.log`): internal Place return/reading position, broken-photo layouts at four widths, SPA venue-photo context, unsynced visit retry, linked saved editor and Place parallax/reduced motion. The initial internal-return selector also matched a hidden Next.js retained page; it now targets the visible accessible link. The two historical opt-in A/B scenarios remain unrun.
- Development-only travel editor and unsynced-visit fixtures, late account responses, out-of-order Saved reads and account-switch drafts were exercised in the focused development runs (`/tmp/tpd-six-reviewed-browser.log`: 13/13; edge/owner reruns overlap). Real uppercase Qloo IDs now preserve Saved state, image context and organisation; feedback can retry a failed initial read.
- Complete unit/service suite passes (`/tmp/tpd-six-final-unit.log`), including private travel projection/bounds/ordering, mocked SQL compare-and-swap/conflict/deletion and intended-owner read/write/delete isolation, no adoption of legacy guest feedback and escaped public-only notebook export. No real account rows are written by these tests.
- Final typecheck, production build and diff check pass (`/tmp/tpd-six-release-types.log`, `/tmp/tpd-six-release-build.log`). Initial browser failures and actual defects were investigated rather than counted as passing: an under-viewport Twin secondary action was corrected with compact honest price copy; owner-generation/Saved read ordering and legacy feedback isolation were corrected and regressions added. Native dialog test selectors, ISO normalization and Neon auth-cache timing assumptions were also corrected.
- Additive migration applied with `scripts/migrate-travel-state.mjs` to the configured Neon database. Schema-only readback confirms UUID owner PK, positive integer revision, object JSON state, timestamp, NOT NULL and owner FK with ON DELETE CASCADE. No existing account records, catalogue, provider configuration or visited-city sync setting changed.
- Native macOS Safari guest checks on the compiled app: Passport renders; quiz opens as a modal, Escape returns to Make your Passport; visited-city modal exposes its city checkboxes, Escape returns to Add a visited city. No city/account data was saved. This is a scoped native check, not VoiceOver, physical-phone, complete Safari-flow or audible-sound acceptance.
- Private screenshots include Save at 320/390/1440, mobile comparison, ordered trip, Home entrance, City at enlarged text, Passport, quiz and Twin/Events. Test images are fixtures; no claim of real venue-photo availability follows from them.
- Public-alias reduced-motion check initially hit a streamed Home node being replaced before scroll (detached DOM), without a failed footprint assertion. The original scenario then passed 3/3 repetitions. Its fixture now waits for client-positioned footsteps before scrolling; the corrected scenario also passes 3/3. This is a test synchronisation fix, with no application change. Exact integrated public results are recorded in the coordinator receipt below.
- Publication SHA, Vercel READY deployment/alias and public smoke receipt are recorded on [release coordinator #45](https://github.com/sararr25/TPD/issues/45) and [acceptance programme #44](https://github.com/sararr25/TPD/issues/44) after publishing. Consult the latest release comment there rather than treating the local checks as deployment proof.

## Standards

Independent source review found no remaining blocking standards violation. One nonblocking judgement call remains: duplicated owner-generation guard patterns could be consolidated if they grow further; current guards are explicit and tested. The review inspected account boundaries, async completion, keyboard dialogs and responsive export/comparison behavior. Independent visual review covered 17 screenshots across Home, City, Passport, quiz, Twin, Events, Save, comparison and ordered Saved. Settled Home captures correctly highlight Find its twin. No confirmed clipping, inaccessible action placement or broken hierarchy was visible. Comparison horizontal overflow is intentional and explained. Enlarged-text City navigation may wrap Passport midword; this is a nonblocking readability refinement, without overlap.

Standards: 0 blocking findings, 1 nonblocking maintainability observation; no cross-axis severity ranking.

## Spec

Independent review against #46–58 and docs/67 found no remaining spec finding after correcting owner-switch draft persistence, Saved refresh/order, late Save callbacks, case-insensitive entity identity and retryable feedback reads. Notebook data is public-only and deliberate; visits have zero automatic ranking effect, as the contract and visible copy state. Physical or genuine-account acceptance is not inferred from fixtures.

Spec: 0 residual findings.

## Open-check review register

#37 terminology/legacy routes, #38 actual category eligibility and separate Paris Events, #39 four native price tiers/unknowns, #40 explicit compact controls, #41 immediate result/empty/error/stale edits, #42 finite/reduced motion/Back, #43 integration and independent visual/source review, #44 publication/catalogue boundaries and #45–58 implementation are reviewed against current decisions rather than stale historical scope.

Physical phones, complete Safari journeys, VoiceOver/TalkBack, actual audio perception, field performance, genuine Google sign-in and cross-device data use still require actual evidence beyond the scoped Safari checks above. Browser fixtures do not satisfy those gates. Catalogue import/rights/selection and wider Events coverage remain separate proposals, not implementation commitments of this release.
