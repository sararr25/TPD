# Passport A across the product — delivery board

Owner request: extend selected **A / La rilegatura** to all product pages,
with meaningful travel/passport/discovery motion, followed by independent
ui-ux-pro-max review and implementation of its feedback. Retain fonts, palette,
functionality, privacy and provider choices.

25 October scope correction: the owner approved code-authored GSAP/SVG after
Rive Editor repeatedly exported an empty, unrelated artboard. Rive does not ship.
No paid subscription is needed. Invalid input exports remain local/ignored.

| ID | Task / owner | State | Result |
|---|---|---|---|
| P1 | Inventory / root | Done | Home, Cities, City, Place, Swap, Passport, Settings, Saved, shared trip, Compare, quiz and states |
| P2 | Shared paper/binding system / root | Done | Existing Instrument Serif/Hanken, berry, lemon, paper, folios and security lines |
| P3 | Cities, City, Place, Swap, Compare / root | Done | Bound covers, guide spreads and itinerary art; existing interaction logic retained |
| P4 | Passport, Settings, Saved, shared trip / passport_collections | Done | Paper leaves and shared covers; storage/auth/privacy logic retained |
| P5 | Motion / root | Done | GSAP page/route/photo/stamp vocabulary; coded booklet-opening, route, arrival-pin and stamp sequence |
| P6 | Checks / root | Done | Build, TypeScript and unit checks; browser matrices and regressions below |
| P7 | Independent UI/UX review / ui_review | Done | [Review and follow-up](39-passport-world-review.md) |
| P8 | Feedback implementation / root | Done | Action-only save imprint, once-only viewport entrances, compact short-landscape Swap, responsive inline SVG |

## Motion behavior

JourneyAnimation is an original inline SVG and finite GSAP timeline. It opens
the Passport cover, traces an itinerary, settles the destination pin and prints
a stamp. IntersectionObserver pauses it offscreen and stops observing when it
finishes. No loop or replay on scrolling back. Reduced-motion users receive the
static illustration. MatchMedia/useGSAP revert animation and disconnect observers
on unmount/navigation. Decorative artwork is hidden from assistive technology.

The other travel entrances start only when visible. A SAVED imprint is triggered
by a successful save action, never by loading existing membership or editing a
note. Real Passport activity remains owned by existing storage/API behavior.
No synthetic achievement or geographical guarantee is introduced.

## Verification

- Production build, TypeScript, full unit command and whitespace checks pass.
- Earlier complete development regression run: 33/33 passed, covering prior
  navigation, partial-save/account isolation and seven Home checks.
- Final production Home/world run: **15/15 passed**. Includes responsive matrices, large text,
  reduced motion, existing-vs-new save, once-only photo reveal and coded journey
  completion/no replay/static restoration; no live provider calls or personal
  account writes.
- Screenshots and logs are private. Review covered screenshot matrices and source;
  it does not claim independent real-device, VoiceOver or sign-in acceptance.

## Publication destination

The owner explicitly requested push to **main**. Remote verification found main
at `9e39f8c`, matching the local implementation base. GitHub's default branch is
still `claude/blissful-gauss-dymbeo` (remote at `55d757b`); these are distinct.
Push this implementation to main without changing either GitHub's default branch
or Vercel's production-branch configuration. The existing production alias was
last verified at `55d757b`, so a main push alone is not proof of a production
release. Check the resulting deployment status and report it accurately.
