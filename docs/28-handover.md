# Handover — 23 October 2026: alignment and final acceptance

Continues [handover 27](27-handover.md). Start here, not from the archived
D/E/I board or handover 05. Current product: **Beesyde**.

## Verified baseline

- GitHub `sararr25/TPD` is public; its default/release branch is
  `claude/blissful-gauss-dymbeo`, not `main`.
- Remote HEAD and the current implementation worktree both resolved to
  `2f215a3066ecb9bbfe871a7782262620f200342e` when this audit began.
- `beesyde.vercel.app` was READY on precisely that SHA, deployment
  `dpl_5bSdNzLnErgVa6QAudFVscdpyfj4`; the Vercel GitHub status was successful.
- GitHub Issues and their comments were read live. Only #26, #32 and parent
  #3 were open. #26/#32 were explicitly `ready-for-human`; other children
  #4–#34 were closed. Do not redo closed implementation tickets.
- Old PR #1, “Add UI/UX direction and clickable prototype”, remains open
  from the 19 October direction. It is separate from the active spec, and
  was neither merged nor closed by this audit.

## Checkout correction

The chat initially opened the obsolete root branch
`claude/pensive-lovelace-k81d2t`. That branch's independent commit `fd4516a`
is **not** part of the release and must not be merged to replace the current
OSM implementation, typography, discovery or application structure.

The root checkout was moved to the real release branch and fast-forwarded
from `2412010` to the verified remote `2f215a3` without merging the obsolete
branch. This continuation is isolated on `codex/beesyde-final-acceptance`.
Dependencies were installed from the existing npm lockfile; no new database,
auth provider, service or database migration was added.

README now starts with the current handover, release branch and live app.
AGENTS documents the reading order. `docs/07-ticket-board.md` now points to
GitHub and marks the original pilot register as archived. Naming, Google
sign-in, Neon and the palette are already decided; do not ask them again.

## #26 accessibility corrections

1. Segmented controls no longer clip their external keyboard-focus rings.
   Individual first/last button radii preserve the joined shape; the focused
   button paints above its neighbours.
2. Light Home forms and city-switch popups use the berry focus ring even
   inside dark covers. Yellow remains for actual dark surfaces.
3. Active map/card numbers use the existing `--stamp-ink`, preserving red
   with **5.575:1** white-text contrast, up from **3.928:1**.

No layout, palette direction, provider or product decision was replaced.

## Verification in this continuation

- Full `npm test`, `npm run typecheck`, production build and
  `git diff --check` passed. The build needed network access to fetch the
  project's existing Google fonts; an initial sandbox-only fetch failed.
- Desktop Home, 1440×1000: keyboard focus on the light form and selected
  Restaurant segment is a 3px berry outline, 3px offset; segmented overflow
  is visible and the focused segment has a higher stacking order.
- City active map and card pins render white 12px text on rgb(194,50,28).
- At 375px, no horizontal overflow on Home, Cities, Lisbon, Time Out Market
  place page, Swap, Passport, Saved or the stamped 404.
- At 390×844, City starts with List and displays the bottom navigation;
  City, Passport and Saved have no horizontal overflow.
- Actual guest guide visit and successful Time Out Market save produce
  both activity stamps after navigation back to Passport. Saved shows
  “Lisbon trip”. Returning to the guide does not duplicate its stamp.
- The existing reduced-motion media rules were inspected in source; this
  continuation does not claim an OS-level reduced-motion or physical-phone
  test. Earlier browser checks remain in handover 27.
- Independent read-only review of #32 found no confirmed persistence or
  account-isolation blocker; its targeted synthetic checks passed. This is
  not real Google or cross-device acceptance.

Private actual-browser screenshots and narrow-layout receipt:
`.private/qa/2026-10-23-final-acceptance/`. Screenshots were shown in chat,
not committed or uploaded to a public PR. Temporary test/build logs:
`/tmp/tpd-final-acceptance-tests.log`, `/tmp/tpd-final-acceptance-build.log`.

## Remaining acceptance: do not silently close

- **#26:** owner's visual acceptance of the supplied actual screenshots;
  private screenshots intentionally replace public attachment to respect
  the owner's private-artifact rule. **Owner explicitly approved visual
  acceptance in chat on 23 October.** #26 can close once the reviewed fixes
  are on the release branch.
- **#32:** actual same-account persistence in two genuine Google sessions.
  Auto-review rejected initiating production Google sign-in without
  explicit authorization. **Owner explicitly authorized starting Google sign-in** on 23 October.
  The normal sign-in was initiated after approval; no login was bypassed,
  session fabricated, user created or account deleted.
- **#3:** close only once its remaining children satisfy acceptance.
- No new statistical A/B experiment has been run. The user's request to
  run one was conditional on finishing tickets. Existing three-condition
  collections and `/compare` are not a randomized conversion experiment
  or proof of quality uplift. No votes, p-values or winners were invented.

For #32 after authorization: sign in normally; open a guide, save one
place, verify both stamps and reload. In a separate real browser/profile,
sign into the same account before opening guides and verify those stamps
already exist; add one guide there and verify it appears after reloading
the first session. Never copy auth cookies or fabricate an account/session.

Release receipt and final review results are recorded below when available.

## Review receipt

The two independent initial source audits identified the three #26 fixes and
found no confirmed #32 storage/isolation blocker. The planned second parallel
Standards/Spec review could not run because both subagents hit their usage
limit. The primary agent then reviewed the small CSS/documentation diff
against the verified `2f215a3` baseline: no remaining actionable Standards
finding; Spec remains partial only for genuine authenticated #32 acceptance.
This manual pass is not represented as a completed second independent review.
