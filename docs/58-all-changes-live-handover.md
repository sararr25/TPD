# Handover — all working changes reconciled and published

26 October 2026. Owner explicitly requested pushing all modified work live and
then delivering a handover. This supersedes local-only delivery boundaries in
docs/52–53 and docs/56 for the final retained implementation.

## Continue here

README → docs/28 → this handover → docs/57 (Passport) and docs/55/54 (Cities/Twin
and Taste Chemistry). GLOSSARY and ADRs remain authoritative for domain/brand.
GitHub default/production branch remains `claude/blissful-gauss-dymbeo`.

Authoritative reconciled source is now the original workspace:
`/Users/sararuffini/Documents/Hackatons/TPD`, branch `codex/twin-motion-ux`.
The separate `/private/tmp/tpd-quiz-live` worktree on `codex/passport-qloo-folio`
contains the previous Passport release `b4dcdbe`; do not use it to overwrite the
newer merged source. The older warning that the original workspace has stale
quiz/Passport source is superseded by this reconciliation.

## Integration and final behavior

- Preserved every pending source/document/test change in snapshot `e37e942`,
  then reconciled against the latest production `b4dcdbe` by a normal merge.
- Current live Taste Chemistry and Passport folio/inline Qloo matches win over
  their superseded local remakes. The generic dialog CSS keeps the quiz exception.
  No reversion of the 38 original quiz illustrations, sound/save boundaries,
  current traveller analysis, visited-city persistence or category discovery.
- Remaining Home changes are included: gentler token-driven cover/page/stamp
  choreography, shared story timing and dashed ink walking map in the existing
  lemon ending. Routes are decorative, not real itineraries.
- Static Home footprint positions and visibility are initialized independently
  of animation preference, including initial/runtime reduced motion. Finite
  walking motion pauses offscreen/in background and cleans up observers.
- Already-live Cities/Twin/Save/toast/motion files were recognized as identical,
  not overwritten by old versions. Shorter saved-photo hover transition retained.
- The earlier PassportProfile and passport-remake.css are retained as historical
  source material; the latter is deliberately not globally imported. The current
  page is PassportFolio. Do not re-enable old quiz CSS or replace current routes.
- Migrated stale acceptance/visit-editor tests to current disclosures and native
  stamp dialog. Old quiz scenarios in motion-remake.spec.ts are superseded by
  the current taste-quiz.spec.ts; touch reduced-motion, portrait editing, Home,
  cover-map and toast/map-lifecycle checks remain in the motion suite.

## Product/data boundaries

No provider/auth/schema/storage/deployment-setting changes. Qloo remains the
recommendation backend; real visits choose geography rather than invent taste
signals. Visited-city account sync remains gated by its existing configuration.
No new statistical A/B experiment or ranking-quality uplift. No personal account
writes during ordinary synthetic browser QA.

## Verification and release

Unit/service suite, typecheck and production build passed during integration.
The comprehensive browser run includes the two explicitly opt-in historical
A/B comparisons as skipped unless their immutable baseline is supplied.
Final browser results, commit and deployment receipt are appended below.

## Remaining acceptance

Physical phones, Safari/iOS, VoiceOver and field performance remain unverified
in this release. Existing genuine-account checks are historical evidence, not
fresh cross-device acceptance. GitHub #36–43 remain open for their recorded
integration/coverage requirements; this publication does not silently close them.
Private QA screenshots, videos, provider payloads and credentials stay ignored.

## Final local gate

- Complete unit/service suite, typecheck, production build and diff check pass.
- First comprehensive development run: 102 pass, 6 failures, 2 historical A/B
  skips. Failures were stale/ambiguous selectors after the new Passport and
  quiz entries; fixed to target current controls and visible streamed content.
- Final compiled targeted run: 33 pass, 5 development-only preview fixtures
  skipped. It includes all six corrected scenarios, account/visit isolation,
  Home reduced-motion footprints and the new finite/no-replay ending check.
  The skipped Place/preview fixtures passed in the development run; they are
  intentionally unavailable in production, not missing application routes.
- Logs: `/tmp/tpd-all-changes-unit.log`, `/tmp/tpd-all-changes-build.log`,
  `/tmp/tpd-all-changes-browser.log`, `/tmp/tpd-all-changes-targeted.log`.
  Do not report the initial whole-suite run as entirely green.
- Latest compiled preview: http://127.0.0.1:3194.
- Source diff against `b4dcdbe` confirms no quiz/Passport-folio implementation
  regressions: current releases retained byte-for-byte where applicable.

## Verified production receipt

- Integrated application commit: `975386fea27fbf61fc941862872f855576b4649f`.
  Both `claude/blissful-gauss-dymbeo` and `codex/twin-motion-ux` were advanced
  by an atomic, non-force push. No default/production setting was changed.
- Vercel production deployment: `dpl_HMoXT51aSfUcS6qE5vUKyKQGfK8Y`, **READY**,
  Git SHA exactly matches the application commit, `beesyde.vercel.app` assigned.
- Public-alias browser smoke: **36/36 passed**, covering Home entrances/forms,
  City/Twin covers, touch/reduced motion, toast, hidden map, Home ending,
  Passport inline matches/visited stamps/empty states, and the full live quiz
  including save retry, sound boundaries and keyboard focus. All use isolated
  synthetic fixtures; provider/account endpoints are intercepted. Log:
  `/tmp/tpd-all-changes-live.log`. No personal production data was modified.
- Final two focused Home-ending checks also pass; rendered card reviewed from
  `.private/qa/all-changes-home-ending.png` (private synthetic artifact).
- Old prototype/release/development servers from this chat were stopped.
  The reconciled compiled local preview remains at http://127.0.0.1:3194.
- The commit containing this receipt and the ADR clarification is documentation
  only relative to the application commit above; application source is identical.
  The original workspace is clean after its publication. No requested application
  change from this working set remains unpublished; private QA artifacts remain
  intentionally ignored.
