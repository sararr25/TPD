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

- New development browser journeys: 8/8 pass for Save geometry/focus at 320/390/1440, comparison cap/unknowns, groups/reorder after reload, explicit visit/undo, actual notebook download privacy, deliberate resume without token reuse, queued Undo/input-preserving failure and account conflict/isolation.
- Full existing unit/service suite passes, including the new mocked SQL-transport checks for projection, bounds, group ordering, compare-and-swap conflicts, account isolation and deletion. No live database rows/accounts are used by those tests.
- Initial browser failures were test assumptions: native Shift+Tab may move focus to browser chrome/body while background remains inert; select labels require the accessible combobox name; Next’s own alert made an unscoped alert selector ambiguous. These were corrected and rerun. The first service assertion expected an unnormalised ISO date; the canonical ISO expectation was corrected.
- Further compiled integration, independent reviews, migration, publication and public smoke: pending; append actual receipts below. Do not infer these from local checks.

## Open-check review register

#37 terminology/legacy routes, #38 actual category eligibility and separate Paris Events, #39 four native price tiers/unknowns, #40 explicit compact controls, #41 immediate result/empty/error/stale edits, #42 finite/reduced motion/Back, #43 integration and independent visual/source review, #44 publication/catalogue boundaries and #45–58 implementation are reviewed against current decisions rather than stale historical scope.

Physical phones, native Safari/VoiceOver/TalkBack, actual audio perception, field performance, genuine Google sign-in and cross-device data use require actual evidence. Browser fixtures do not satisfy those gates. Catalogue import/rights/selection and wider Events coverage remain separate proposals, not implementation commitments of this release.
