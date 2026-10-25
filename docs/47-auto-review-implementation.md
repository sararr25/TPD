# Auto-review follow-through — 25 October 2026

Baseline: `b6795cd`, local `codex/twin-motion-ux`. Implements the owner's
requested sequence from [the auto-review](46-ui-motion-self-review.md).
No remote push, deployment, provider request or production data write.

## Implemented

- **F01 / F03:** smaller mobile emblem/cover spacing; both complete City and
  Twin entrances clear the bottom bar at 375×812 and 390×844. Header navigation
  has a server fallback and a reserved slot; auth loading uses the final slot;
  main fallback reserves a viewport so the footer does not jump through it.
- **F02:** cover and example entrances are separate. Page/bookmark start with
  the example in view; the stamp has its own photo-visibility trigger. Once-only
  triggers and reduced-motion cleanup retain readable content and controls.
- **F04 / F05 / F11:** mobile featured match retains a photo and explicit Save;
  other-match action is secondary. Reference → listed shared Keep traits → named
  result and returned difference form one scene. Submitted Delete exclusions
  remain explicit, including Delete-only searches. No inferred synonyms,
  percentages or invented differences. Search, success, empty and error keep
  their reference context; the animation never delays a ready response.
- **F06, partial:** Twin demo precedes the long catalogue and instructions.
- **F08:** unified segmented controls, neutral Ignore, lemon/check Keep and
  berry/cross Delete; all three labels and minimum 44px targets remain.
- **F09, partial:** designed, explicitly labelled missing city-photo fallback.
- **F10:** cover security lines and emblem have separate scroll depths; text
  and controls remain stable, existing photo overscan remains in place.
- **F12:** Events identifies the Paris pilot before click. Unsupported cities
  offer a direct Paris pilot link and official Paris agenda; Lisbon retains
  its own official agenda link.

## Pending owner decisions

The report does not specify which 3–4 Home cities to curate or replacement
photographic assets. The owner explicitly required questions instead of guesses.
Both questions were sent in chat. The eleven-city list, existing covers and
Home grid therefore remain; **F06 shortlist / F07 grid composition and F09
photographic replacement are not complete**. No image-rights claim is made.

## Verification and diagnosis

Before fixing, the new browser regression failed at both mobile sizes: City
CTA bottom 811.94 vs bar top 755 at 375px; 813.91 vs 787 at 390px.
The original stability harness reproduced local summed input-free shifts
0.66946 / 0.66418 desktop and 0.04456 mobile. Large sources were MAIN, brand and
auth during shell/fallback replacement. After reserving the shell/fallback,
the production-mode protocol measured **0.00423 / 0.02078 desktop, 0 mobile**;
remaining sources were text/entrance/example actions, with no auth/footer source.
These are three local cold-context observations over 3.5 seconds, not field
Core Web Vitals or real-device acceptance.

Smooth scrolling initially failed in 812×375 landscape: removal of the tall
editor made the browser clamp scroll before the requested destination. A
reproducing browser trace showed outcome y=-270 and result name above the
viewport. Computing the destination after the clamp (two animation frames,
with cleanup) plus compact landscape scene restores the result in view.

- `npm test`, final typecheck, final production build and `git diff --check` pass.
- New refinement tests cover both entrances, auth geometry, featured photo/Save,
  honest shared traits, named destination, Delete-only searches, bookmark/stamp
  visibility and once behavior, reduced motion, repeated cold CLS sources and
  enlarged text reachability.
- Existing Home/Twin/Events/motion tests run against a separate local production
  server using `MOTION_BASE_URL`; development-only Place and service-page fixtures
  are checked on the development server. See final check results below.
- The Events selector was updated for the intentional new label. The city-card
  reveal assertion now waits for the settled transform rather than assuming a
  one-second delay proves the animation finished.
- Independent review via the repository `code-review` skill: Standards found no
  actionable issues. Spec found a missing Delete-only narrative; corrected and
  re-reviewed with no new concrete bug. This is code/spec review, not independent
  visual acceptance on a real device.

Private evidence: `.private/design-self-review/stability-before-refinements.json`,
`stability-after-refinements.json`, `stability-production-refinements.json` and
`.private/design-refinements/` screenshots/videos. Synthetic declared guest
fixtures intercept all personal/discovery API requests; no owner account used.
Screenshots with reused fixture photographs do not establish real result variety.

No fresh real-phone, screen-reader, Google or cross-device acceptance is claimed.

## Final check results

- **35/35 production browser scenarios PASS**, using the final build at
  `http://127.0.0.1:3104`; log `/tmp/tpd-refinements-complete.log`.
- **28/28 development acceptance/Passport-world scenarios PASS**, plus the
  development-only Place photo-motion scenario PASS. Logs:
  `/tmp/tpd-refinements-world.log`, `/tmp/tpd-place-motion.log`.
- Full application suite PASS: `/tmp/tpd-refinements-tests.log`.
- Final build/typecheck PASS: `/tmp/tpd-refinements-build-complete.log`,
  `/tmp/tpd-refinements-typecheck-complete.log`; whitespace check PASS.
- Enlarged-text check doubles computed font sizes and line heights, including
  pixel-based display/UI text. It is a synthetic text-scaling check, not physical
  phone or native browser text-zoom acceptance.
- Final geometry regressions cover 320/390/1440px and 812×375 landscape; Save
  and the other-match arrow remain visible where the viewport can contain them.
  The outcome now aligns below the actual header rather than preserving an
  unsafe offset from the submit button. At 320px a postcard header keeps the
  photo beside the name and lets the reason use the full card width.
- Scroll transforms for the emblem use an outer decorative wrapper; entrance
  rotation stays on the SVG. Security-line opacity cleanup does not clear its
  scroll transform.

The remaining owner choices above are intentionally unresolved. Do not mark
F06/F07/F09 complete or close the broader integration issues on this receipt.
