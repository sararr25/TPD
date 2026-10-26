# Cities and Twin — publication handover

26 October 2026. Owner explicitly requested commit and push of the local Cities
and Twin UI after the quiz-only release. Baseline: `29c778d` on the production
branch `claude/blissful-gauss-dymbeo`. Work isolated in `/private/tmp/tpd-quiz-live`,
branch `codex/cities-twin-live`, preserving the original dirty checkout.

## Scope / acceptance specification

- Publish the existing local Cities/Twin UI and motion refinements.
- Preserve the approved live Taste Chemistry quiz, original artwork and audio
  boundaries; do not replace it with the older local quiz implementation.
- City/Twin cover: dashed ink routes, readable footprints, streets and gardens;
  protect actual text/photo bounds and preserve the cover geometry. Decorative
  cartography is not an itinerary. Static equivalent with reduced motion.
- Cities: one visibility-triggered card entrance, shorter stagger, finite folio
  sequence; no duplicate photo wipe. Restore navigation without replaying entrances.
- Twin: immediate layout compensation from input to results, map mounted only
  in the visible For you panel when coordinates exist. No hidden MapLibre mount.
- Shared dependencies: photo overscan/frame, finite Save-sheet exit, toast safe-area
  positioning and focus/hover pause, skeleton pause offscreen/in background.
- Keep publication scoped: no unpublished Passport profile/editor redesign or
  Home-specific hero/ending rewrite; no provider/auth/schema/config changes.
- Run appropriate unit/type/build/browser checks before authorized release;
  confirm the production Git SHA and public alias after pushing.

## Integration

Copied the Cities/Twin files and their actual shared dependencies from the original
workspace onto the quiz release. Added ink map, footprints, motion tokens and
Save-sheet presence helper. Added ink/shared CSS, retaining `taste-quiz.css`.
New generic dialog motion explicitly excludes `.quiz-panel` so its transformed
ancestor cannot break the quiz’s viewport positioning. No quiz source files or
quiz artwork were replaced. Home-specific implementation and Passport remake
remain uncommitted in the original workspace.

## Verification and publication

Unit/service suite, typecheck, production build and diff check pass. Compiled
browser checks and source review are complete; production alias verification
follows the authorized push.

Tests use synthetic data and intercepted APIs. No personal account writes,
provider quota requests or genuine Google/cross-device test is implied.
Real phones, Safari/iOS, VoiceOver and field performance remain outside this run.

## Review corrections

Standards and Spec reviews completed against `29c778d` with one finding each.
Both fixes were source-rechecked by the reviewers:

- Footprints are positioned outside the animation-preference branch and have
  visible static opacity. Initial/runtime reduced motion retains the drawing.
- Return navigation suppresses only restored elements, via a WeakSet snapshot.
  Newly created Save feedback still animates after browser Back.

Regression tests cover both cases. The development-only Place fixture check
now explicitly skips in production builds; City photo/frame coverage is tested
on actual City routes. No production feature is skipped.

## Continuation

The original checkout retains unrelated local Home/Passport changes and its old
quiz source; do not force-push that checkout over this release. The release is
assembled and committed on `codex/cities-twin-live`. Its public deployment receipt
is recorded in the owner chat and the original workspace continuation copy.

## Final validation

- Unit/service suite, typecheck, build and diff check pass.
- 43 distinct compiled scenarios pass: Cities/Twin cover, static footprints,
  Back→Save feedback, hidden-map gate, photo frame, toast, 4 viewport layouts,
  Twin flow/categories/errors, Events, motion and all 11 live-quiz regressions.
- Full selected run: 42 pass, one stale selector fails on Next hidden staging,
  one development-only Place fixture skipped. Selector changed to the visible
  journey; its rerun passes. This is not reported as an all-green first run.
- The previously published quiz implementation, stylesheet and assets have no
  diff against `29c778d`; shared dialog effects exclude its modal container.
- No remaining findings in Standards/Spec source rechecks.

Logs: `/tmp/tpd-cities-unit.log`, `/tmp/tpd-cities-build-release.log`,
`/tmp/tpd-cities-browser-final.log`, `/tmp/tpd-cities-journey.log`.
