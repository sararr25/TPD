# Handover — historical tickets, A/B and release

28 October 2026 · Continues [docs/68](68-travel-tools-release-and-acceptance.md).

## Start here

1. Read [the historical acceptance/A-B receipt](69-historical-acceptance-and-ab.md).
2. Read [the physical/account checklist](70-physical-account-acceptance.md) and its
   open [human follow-up #59](https://github.com/sararr25/TPD/issues/59).
3. Verify current issues/comments, Git SHA and Vercel alias before new work.

Owner requested completion of historical #36/#40/#42/#43/#44, A/B, live push and
handover. For unavailable hardware/accounts the owner explicitly selected
“Completa qui e prepara la checklist fisica”. Those gates are **not run** and
remain traceable in #59; historical technical closure does not certify them.

## What this cycle completed

- Recovered the original e835875 baseline archive and verified all 388 tracked
  blobs against Git objects; only Next's generated declaration differs.
- Reused and corrected the existing A/B harness. Both variants now measure from
  editor top through CTA bottom. At 390px: 1381.19→816.30px, **−40.90%**, passing
  the historical 35% criterion; at 1440px: 834.50→625.80px, −25.01%. Full-container
  percentages remain secondary only. First result/reason/actions are immediately
  visible and overflow is zero in the matched fixtures.
- Captured actual normal-motion videos and samples for original/current Home and
  City at mobile/desktop sizes. Independent review required natural completion;
  the recorder now waits for it and holds before navigation/reduced motion.
- Expanded native Safari guest verification: Save/note/focus, declared visit,
  group selection, reload persistence, notebook selection/privacy and Undo visit,
  using a development-only synthetic Place in a dedicated private window.
- Preserved real-phone, screen-reader, actual-audio and normal-account/cross-device
  criteria in a guided owner-run checklist, with explicit not-run result fields.

No application defect requiring a functional rewrite was found in this cycle.
Changes are verification tooling, corrected evidence and handover. No provider,
auth, brand, production schema, personal-data import or sync-setting change.

## Validation and evidence

Full compiled browser run, including opt-in historical A/B: **157 passed / 9
development-only skips**. All nine development fixtures passed separately. After
review, corrected pre-CTA A/B rerun: 2/2. These numbers overlap; do not add them as
new unique scenarios. Final rebuilt-artifact checks: **38 passed / 1 development-only
skip**, including the corrected A/B and motion. Unit/service, typecheck, build and
diff checks pass. Final build, reviews and
public smoke receipts are maintained in docs/69 and the final release comment on
[#44](https://github.com/sararr25/TPD/issues/44).

Original comparison source is e835875; continuation/release baseline is
`8afcf5a6ef270560e9879e9575c7f36bdd56f2e2`. This is technical/visual before-after
testing, not a randomized human experiment or recommendation-quality uplift.
The archive uses Webpack because Turbopack cannot resolve its external dependency
link; the candidate is compiled. No performance uplift is inferred across them.

## Publication and tracker

Default/production: `claude/blissful-gauss-dymbeo`; working branch:
`codex/twin-motion-ux`. Publish both atomically without force. Vercel project is
`beesyde`, public URL https://beesyde.vercel.app. The final release comment on #44
records the exact Git SHA, READY deployment ID, public alias and smoke results
after publication; consult that receipt instead of treating this handover as
deployment proof. This avoids embedding its own not-yet-created commit SHA.

Historical closure basis: #40 corrected matched measurement; #42 independent
temporal review; #43 integrated/source/native checks plus explicit #59 handoff;
#44 reconciled programme/proposal/delivery; #36 children reconciled. Each historical
issue receives the concrete evidence and #59 link before closing.

## Continuation boundaries

- #59 is the remaining human acceptance register, not a request to implement new
  features. Do not mark its rows passed with emulation or copied sessions.
- `VISITED_CITIES_SYNC` is absent from production env metadata at this check;
  visited-city account sync remains disabled. Private trip organisation/visits
  use their separate travel-state API. No env values were decrypted/read.
- Paris-only dated Events and four native indicative price tiers remain approved.
- Catalogue: docs/61 is the bounded 40-place Lisbon proposal, not approved import
  or verified rights/headroom. Actual retention/display permissions, reviewed
  selection, costs and refresh approval remain prerequisites before activation.
  No licence choice, catalogue import or submission occurred in this cycle.
- Keep screenshots/videos, raw payloads and credentials private. To resume, use
  #59 task/result rows and preserve user data; do not repeat historical redesigns.
