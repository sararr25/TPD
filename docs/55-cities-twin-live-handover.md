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
browser verification and publication receipt will be recorded below.

Tests use synthetic data and intercepted APIs. No personal account writes,
provider quota requests or genuine Google/cross-device test is implied.
Real phones, Safari/iOS, VoiceOver and field performance remain outside this run.
