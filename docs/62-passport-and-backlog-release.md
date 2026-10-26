# Passport and pending corrections — publication continuation

27 October 2026. Owner explicitly requested pushing all pending work live,
including earlier changes. This supersedes local-only boundaries in handover 60
for the retained implementation described here. Default/production branch remains
`claude/blissful-gauss-dymbeo`; no deployment configuration change.

## Included work

- Equal-width Passport pages, with only bold Your Passport in the compact berry
  title strip. Full left half below it belongs to actual visited-city stamps.
- Current quiz-derived profile and deliberate inline discovery remain on the right.
- Replaced bare native accordion links with paper panels and a dedicated favourites
  dialog. The action is Add what you love; it does not offer a quiz retake.
- Returning-user quiz changes live in Settings & privacy, using the existing shared
  quiz dialog and save contract. First-time creation remains available. Opening the
  native quiz dialog places focus after showModal, preserving keyboard use.
- Home travel and favourites-recovery links open the appropriate current editor.
- Twin edits during a pending search are marked stale. Same-owner Passport changes
  invalidate/abort old results and require an explicit update. Expired profiles
  cannot start a request that would remain busy without a valid Passport.
- Home empty-example message uses the available row width, keeping its next action
  readable. Test harness uses a shared preview URL, retaining the quiz override.
- All pending specification, acceptance, coverage/catalogue and ADR documentation
  is included. Private payloads, screenshots, videos and credentials remain ignored.

## Verification boundary

Pre-publication checks include the complete unit/service suite, production build,
typecheck, diff check and the complete compiled browser suite. Exact final results,
application commit, deployment ID/READY state and public-alias smoke are recorded
in the release comment on [programme #44](https://github.com/sararr25/TPD/issues/44).
The actual Git SHA and alias must be checked after push; local build success alone
is not production acceptance. All routine browser fixtures intercept provider and
account endpoints; no personal production data is modified.

Previous detailed evidence and corrected initial failures are in handover 60.
The final tests use the settings quiz entry, favourites-only editor and current
Passport title rather than obsolete controls. Development-only fixtures are checked
separately; historical A/B comparisons remain explicitly opt-in.

## Remaining work

Physical phones, native Safari/VoiceOver, actual audio output, field performance,
fresh genuine-account checks and whole-site independent visual review remain open.
Independent source/fix rechecks and bounded recovery UI review do not substitute
for these. Publication does not close #36–43 automatically.

Visited-city sync stays under its existing configuration gate. No schema migration,
import, provider/auth change, new service or storage provision occurs. Events is
still a separate Paris-only municipal pilot. The Lisbon catalogue packet remains
a bounded proposal with missing selection/rights/cost evidence, not an import.

## Continuation

Original workspace remains authoritative on `codex/twin-motion-ux`. The release
push advances this branch and the production branch without force; no old worktree
should overwrite it. Final release receipt is linked from programme #44 above.

## Final pre-publication gate

Complete unit/service suite, current production build, typecheck and diff check
pass. Full compiled browser run: 112 pass, 8 intended skips, 1 failure caused by
a photo selector matching both visible content and Next's hidden streaming copy.
Scoped that selector to the visible image; targeted rerun passes (1/1). No app
source change was needed for that failure; do not describe the initial full run
as entirely green. Logs: `/tmp/tpd-live-release-unit.log`,
`/tmp/tpd-live-release-browser.log`, `/tmp/tpd-live-release-photo.log`.
