# Taste Chemistry — quiz publication handover

26 October 2026. Originating spec: the owner’s quiz exploration in this chat,
followed by explicit authorization to improve the illustration system, limit
sound to start/result, publish live and provide this handover.

## Scope and baseline

Release/default branch verified through GitHub: `claude/blissful-gauss-dymbeo`.
Starting release: `d05395a119ebe2b848f15cf93951e4115663eba8`.
Work isolated in `/private/tmp/tpd-quiz-live`, branch `codex/quiz-taste-live`.
The original checkout has unrelated uncommitted Home/Twin/Passport/motion work;
those changes are intentionally excluded from this release. Existing issues
#36–#43 and their comments were read. They are not reopened or closed here.

## Acceptance specification

- Publish the approved adult, illustrated quiz in both Passport and modal entries.
- Reuse all 18 existing questions, IDs, answer values, scoring and Qloo contracts.
  Places/music appear first; no invented affinities or outcome guarantees.
- Full answer controls and Continue remain visible at 320×568, 390×844,
  812×375 and desktop. At extreme zoom/very small viewports scrolling preserves
  access instead of hiding controls.
- Pick limits, automatic advancement, Back, Skip, pointer swipe, yes/no buttons,
  keyboard, undo, direction/release feedback and partial-answer top-up work.
- Original meaningful flat-vector artwork; no generic repeated gallery placeholder.
- Sound only on explicit quiz start and successful saved result; mute available.
  No sound for selection, swipe, undo, navigation or failed save.
- Failed final save preserves choices and supports retry; no false celebration.
- Reduced motion, focus after changes and keyboard containment; no new provider,
  database schema, analytics, auth, dependency or production-setting changes.
- Preserve the Passport page design outside the quiz; defer its redesign.

## Implementation

`QuizFlow` renders a contained, viewport-aware surface shared by both entries.
38 locally served original SVG scenes replace the small generic icons in quiz
answers. Their mapping and provenance are in `quiz-artwork.tsx` and
`public/quiz-art/README.md`. Unselected colours are muted; selected art becomes
coloured with a small translation. Swipe banners explicitly distinguish YES/NO,
and release guidance remains visible below the card. Transitions use the existing
GSAP dependency with restrained durations, no page-wide colour wipe or bounce.

Audio is synthesized with Web Audio after a user gesture and muted locally.
Both finish handlers now return true only after `finishQuiz` succeeds; only that
result plays the closing sound. Cleanup allows that brief sound to finish and
then closes its context. Account errors and provider failures remain retryable.
The current 3–5-favourite requirement and top-up are retained.

Magic UI and vector-graphics were read. Their documented scopes do not require
adding Magic UI landing effects or PixiJS to this form; neither was installed.
No external artwork is copied. The private prototype was also updated, but is
not deployed as the application and is not committed.

## Verification and release receipt

Pending final build, two-axis review, production deployment SHA/alias verification.
Development browser checks: 9/9 pass, including four viewport sizes, real pointer
swipe/feedback, automatic progression, keyboard/undo, all 18 questions, save failure
and retry, exact sound boundaries via mocked Web Audio, top-up and native-dialog
reopening. Unit/service suite and typecheck pass. Screenshots are synthetic and
private under `.private/taste-quiz/` in the isolated checkout.

## Limits

Real speaker output, physical touch hardware, Safari/iOS, VoiceOver and genuine
Google/cross-device sessions are not newly verified. Qloo requests are intercepted
in browser tests; no ranking-quality uplift is asserted. Existing data semantics,
authentication and catalogue remain unchanged.
