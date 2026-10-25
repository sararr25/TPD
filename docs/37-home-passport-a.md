# Home — owner-selected Passport A

24 October 2026. Local baseline: `9e39f8c`, release branch
`claude/blissful-gauss-dymbeo`. No commit, push or deployment was performed for
this change. The running local production build is at http://127.0.0.1:3000.

## Decision

The owner rejected the first magazine/desk/cinema alternatives because they
moved away from the original Passport idea. After reviewing revised local HTML
studies, the owner selected **A / La rilegatura**. This is an evolution of the
existing berry cover and paper example page, not a new visual theme. The cover
opening from C was not selected and is not implemented on Home.

The source studies remain private under
`.private/passport-refinements-2026-10-24/`. The earlier `/preview/home` is
historical development-only exploration, not the selected direction.

## Implemented

- Cover and live example share one binding: stitching, security linework,
  gutter, paper edges, lemon bookmark and example Lisbon stamp. Instrument
  Serif, Hanken Grotesk, berry/lemon and existing navigation are retained.
- Short two-line display heading; both original search modes keep their actual
  behavior, validation, city/category context and routes. Skip-to-cities remains
  available. On mobile, the two leaves stack without a rotated or pinned book.
- The right page still loads real guest example selections and three distinct
  provider picks. The profile is explicitly an example, not the visitor's data.
  No canned recommendations from the HTML mockups were imported into the app.
- Hero photographs label a place photo versus the city fallback. A failed place
  photo falls back to the city; when that also fails, an explicit plain state
  replaces the image. Failure before hydration is detected. City fallback uses
  the existing higher-resolution cover URL, without downloading provider photos.
- GSAP/useGSAP gives the book a short entrance and stamps an impression motion;
  city cards enter on scroll. Effects are scoped and reverted on unmount;
  matchMedia removes them when reduced motion is requested. No scroll pinning,
  forced cover opening or provider-dependent entrance is introduced.
- City links and the closing Passport band inherit the same paper/emblem
  treatment. The real Swap demo keeps its live behavior; its resting illustration
  is labeled and disappears when a search starts or returns a result/error.
- No auth, Passport state, provider, database/schema or catalogue logic changed.

## Verification

- `npm test`: passed existing checks.
- `npm run typecheck`: passed after the build.
- `npm run build`: passed, including production-only preview-route boundaries.
- `git diff --check`: passed.
- `npm run test:browser`: **27/27** passed in development, including the prior
  20 acceptance checks and seven Home checks.
- The seven Home checks also passed against the local production build, checking
  the production stylesheet order and interactive behavior.
- Home matrix: 320/390/768/1440 px; long example names, both forms, invalid city
  recovery and navigation, broken photo/provider error, reduced motion,
  keyboard submission and navigation back. No horizontal overflow or browser
  JavaScript errors in those checks.
- Desktop/mobile screenshots visually inspected using isolated synthetic APIs.
  Tests did not consume provider quota or mutate an account. Screenshots remain
  private in `.private/passport-a-implementation-*.png`.

This is local implementation verification, not a deployment receipt or physical
phone/assistive-technology acceptance. Publication was subsequently authorized to main; the final cross-product scope
and verification are recorded in [the delivery board](38-passport-world-task-board.md).
