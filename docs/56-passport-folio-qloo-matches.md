# Personal Passport folio and category matches — 26 October 2026

## Owner direction

Replace the Passport mockup with actual site UI. Preserve the purple upper-left
Taste Passport cover; place explicit real-visit city stamps below it, inside the
bound page, with Add stamps when empty. Retain Explore cities. The right page
shows the quiz-derived traveller category, more precise answer-grounded traits
and analysis. Replace the prototype's From your answers disclosures with actions
leading to Qloo-powered category matches in visited cities.

## Implementation location and baseline

Worktree `/private/tmp/tpd-quiz-live`, local branch `codex/passport-qloo-folio`,
based on released `790f00d`. The original main workspace still contains older
unpublished Home/Passport changes and old quiz sources; do not overwrite the
released quiz with that workspace. No push/deployment is authorized or performed
by this implementation turn. Local site: http://127.0.0.1:3191/passport.

## Behavior

- New `PassportFolio` for empty, partial and completed quiz states. Existing
  favourites/quiz editor is retained in a disclosure; Share and learning/settings
  behavior remain. Guide/save activity is separately accessible below the book.
- Visited stamps use `useVisitedCities` and the existing real-visit editor inside
  a native dialog. Existing guest/account isolation, pending saves and sync gate
  remain; no schema/config/auth change.
- Answer-grounded `passportInsights` supplies up to four concrete descriptions
  and supported category links. Existing quiz scoring and traveller titles stay.
  Category-dependent original SVG illustration, ink entrance and stamp impressions
  use finite CSS motion; reduced motion retains full content. No engine installed.
- `/passport/matches?category=bar` (also cafe/restaurant/museum/hotel) prioritizes
  the sorted, explicitly visited city list; the user can choose any supported city.
  With no visits or explicit city, choose a city before requesting results.
- Matches reuse the actual `CityView` and same-origin discovery API, including
  signed favourites, quiz preferences, feedback, hidden places, save controls,
  error/empty states and existing provider cache/budget. No duplicate provider
  adapter or direct client Qloo calls. One selected city is searched at a time.
- Visits select geography; they are not falsely sent as extra taste signals.
  Bars are not labelled verified live music or open late. Outdoor preferences
  can lead to hotels, explicitly without implying trail/park filtering.

## Evidence and limits

Unit/service suite, typecheck and initial build passed. Four compiled Passport
scenarios passed after correcting the synthetic visited-storage shape. Full
updated development suite: 16/16 Passport and live-quiz scenarios passed,
including 375/768/1440 Passport layouts, category+signed-profile request, city
switch, no-history gate, stamp save/reload, quiz controls on four viewports,
18-question save failure/retry, audio boundaries, focus and reduced motion.
Initial quiz checks needed their entry updated to open the new editor disclosure;
no quiz component implementation changed.

Bounded real-provider sample through the existing local API: example Passport,
Lisbon, bars, 9 results, `Picked for your Passport.` No personal account writes
or ranking-quality claim. A first request missing Origin was rejected by the
local API before provider access; the proper same-origin request succeeded.

Private synthetic screenshots: `.private/passport-folio-desktop.png` and
`.private/passport-folio-mobile.png`. Unit/build logs in `/tmp/tpd-passport-*.log`.
Final rebuild and compiled rerun receipt follows. Physical devices, VoiceOver,
Safari/iOS and fresh Google/cross-device persistence are not verified here.

## Final receipt

Final build and whitespace check pass. Full combined development and compiled
runs each passed 16/16 scenarios. After removing the duplicate empty-guest quiz
prompt, its targeted development regression passed and the final rebuilt app
passed all 5/5 Passport scenarios. The quiz source remains unchanged; only its
test entry opens the new editor disclosure. Production-mode local review URL:
http://127.0.0.1:3192/passport. No push, deployment or production data changes.
