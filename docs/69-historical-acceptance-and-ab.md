# Historical acceptance and technical A/B — 28 October 2026

Continues [the travel release](68-travel-tools-release-and-acceptance.md), baseline
`8afcf5a6ef270560e9879e9575c7f36bdd56f2e2`. Owner requested completing historical
#36/#40/#42/#43/#44, then A/B, publication and handover. Owner explicitly chose:
“Completa qui e prepara la checklist fisica”. Physical/genuine-account criteria
are handed over in [the manual checklist](70-physical-account-acceptance.md), not
reported as passed by automation or silently removed from acceptance.
Manual follow-up: [#59](https://github.com/sararr25/TPD/issues/59).

## #40: original baseline recovered and verified

The original archive `/private/tmp/tpd-twin-baseline` still exists. All 388 tracked
blobs, including symlink targets, were checked against Git objects at
`e835875f35b88f92ae0d33408f2dc1aa2a771bfc`. No source mismatch exists; only the
Next-generated `next-env.d.ts` differs. No baseline UI, styles or fixtures were
rewritten to manufacture a reduction. The previous blanket statement that the
baseline was unavailable is superseded by this verification.

The archive runs with the existing dependencies and `next dev --webpack` on 3101,
without credentials. Turbopack rejected the archive's external node_modules link;
Webpack resolves it without a config/source change. B uses the existing compiled
candidate on 3215. Compiler/runtime differences preclude load/performance uplift
claims; the comparison measures settled layout and the same visible task.

Existing `twin-ab.spec.ts` now accepts the candidate URL and artifact directory,
instead of hardcoding port 3000 and replacing the original receipts. Both variants
use the same Chrome, guest state, starting place, six traits, three results,
placeholder photos, 500-ms response and 900px height. API seams are intercepted;
no personal data, provider requests or database rows are used.

| Measure | A 390px | B 390px | A 1440px | B 1440px |
|---|---:|---:|---:|---:|
| Editor/context height | 1566.19px | 816.30px | 998.50px | 625.80px |
| Reduction | — | **47.88%** | — | **37.33%** |
| Result name in viewport after response | No | Yes | No | Yes |
| Reason and primary actions in viewport | No | Yes | No | Yes |
| Explicit other-matches navigation | No | Yes | No | Yes |
| Horizontal overflow | 0px | 0px | 0px | 0px |

The historical >=35% mobile height criterion passes. The current mobile editor
is taller than the intermediate 25 October B (740.30px); larger targets and honest
context were retained rather than deleting them to maximize the percentage.
This is a bundled before/after comparison, not a randomized human experiment,
conversion uplift, recommendation-quality study or isolated causal claim.

Reproduce with both servers running:

```sh
TWIN_AB_BASE_URL=http://localhost:3101 MOTION_BASE_URL=http://localhost:3215 TWIN_AB_ARTIFACT_DIR=.private/historical-ab npx playwright test scripts/browser/twin-ab.spec.ts
```

Initial fresh comparison: 2/2 pass, `/tmp/tpd-historical-density-ab.log`.
Original artifacts remain in `.private/twin-ab`; fresh captures/metrics are in
`.private/historical-ab`. Integrated rerun results are recorded below.

## #42: temporal motion review

`scripts/capture-motion-review.mjs` reuses `worldFixtures` and captures both
original A and current B at 390/1440px with motion enabled: Home entrance, example,
Home ending, Paris Twin cover, photo scroll and runtime reduced motion. It records
continuous WebM, phase markers and PNG samples under `.private/historical-motion`.
The recorder warms compilation before the measured sequence and makes no latency
or real-hardware performance claim. Screenshot filenames are nominal capture
milestones, not precision animation timing measurements.

All four captures completed with zero page errors. The original City photo has
zero frame-relative scroll displacement; B changes by about 3.04px mobile and
6.82px desktop in this recorded scroll segment. The existing regression measures
parallax separately from page scrolling and checks reduced-motion cleanup.

Video contact sheets sample the actual recordings every 0.5s, left-to-right then
top-to-bottom. High-resolution samples accompany them. This supports review of
ordering, perceivability and finite completion; it cannot certify physical-phone
comfort, audible sound or continuous-frame smoothness on other hardware.

Independent Standards/Spec and temporal visual review: pending final reports.

## #43: expanded native Safari guest check

Safari 26.5 on macOS 26.5.1, native UI through CUA. A dedicated private window used
the development-only synthetic Place at localhost:3216; no real account/provider
or production data writes. Verified Save, accessible top-layer editor, private
note save, Escape returning to Saved, explicit visit, Saved navigation, Saturday
group selection, note/group/visit persistence after reload, notebook selection
dialog without the private note, Escape returning to Travel notebook and Undo
visit. Closed only the QA private window afterwards. A loading AX snapshot was
replaced during navigation; subsequent actions used the settled accessibility
tree. This was not a diagnosed app defect.

This expands the prior native quiz/stamp focus checks. It does not claim native
download/print, map/touch, VoiceOver, actual sound or genuine Google cross-device
acceptance. Those remain in the owner-approved manual handoff.

## Integrated checks and closure basis

Full compiled/browser A/B, unit/service, typecheck, build, source review and
public-alias receipts: pending final run. Do not infer completion from the scoped
capture or historic receipts.

Catalogue/Events scope is unchanged: the concrete bounded proposal and missing
rights/selection/headroom prerequisites are in docs/61. No import, durable provider
cache conversion, sync activation, auth/provider change or new migration is part
of this continuation. #44's proposal deliverable does not authorize activation.
