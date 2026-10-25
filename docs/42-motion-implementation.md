# Motion implementation — 25 October 2026

Owner: motion implementation agent; shared checkout, no commit or publication.
Package F / issue #42. Preserve Passport A's bound berry cover and paper page.

## Implemented

- Finite Home entrance: security-line drawing; title/lead stagger; example page
  settling at its binding; emblem; lemon bookmark; stamp impression. Sequence
  ends at about 1.25 seconds, without waiting for discovery. Forms are never
  hidden or disabled by choreography.
- Real scrubbed photo-only parallax on Home, City cover and Place hero:
  ±18px desktop, ±8px mobile. Frames/text/controls remain stationary relative to
  their layout. Separate frame entrance from image transform ownership.
- Overscanned photo layers preserve covered edges. Existing fallback photos and
  captions remain intact; no new media/provider calls.
- Viewport-triggered reveals for Home how-to, city shelf, demo, closing Passport,
  City cards and asynchronous picks. Explicit `data-travel-enter` is available
  to the Twin integrator for the same 24px entrance, with bounded 70ms stagger.
- Existing lower-intensity Passport/Saved/Settings/Compare travel vocabulary is
  preserved. Newly inserted nodes and hidden workspace activation are observed.
- Route cleanup, observer disposal, resize refresh and motion-preference changes
  use the existing scoped GSAP contexts. Reduced motion has no scrub, entrance,
  opacity staging or hover photo transition. CSS never pre-hides server content.

## Validation

Read installed Next `use client` documentation before implementation. Initial
focused typecheck passed, before concurrent domain/UI changes. Browser tests
use synthetic fixtures and do not write to accounts or consume Qloo quota.

The initial focused desktop/mobile/Home reduced-motion run passed **3/3**.
Expanded coverage includes the real Place component via its development-only
fixture. Tests measure photo displacement relative to its frame, so scrolling
an unchanged image cannot pass. They also check repeat visits, settled reveals,
reduced-motion toggling, no horizontal overflow and browser errors.

Run with:

```
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/tpd-playwright npx playwright test scripts/browser/travel-motion.spec.ts --output=.private/motion-results
```

Playwright's ffmpeg recorder was installed only in temporary storage because it
was absent from the host cache. Desktop/mobile test recordings are private
under `.private/motion-results/`, each test's `video.webm`.

A new no-JavaScript test exposed an existing shell limitation: root Suspense
leaves main at “Loading…” while the streamed Home sits hidden. This is separate
from motion CSS; root integrator owns the useful noscript fallback and final
verification. Do not describe the whole application as no-JS functional.

No real-device, production or human-preference acceptance is claimed. The root
integrator owns A/B comparison, independent visual review, suite/build gate and
any corrections resulting from those checks.
