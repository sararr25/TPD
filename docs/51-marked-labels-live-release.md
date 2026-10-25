# Marked Twin labels — 25 October 2026

The owner chose proposal B / Etichette segnate from the three interactive studies,
then explicitly requested implementation and a live push. This publication also
includes the previously completed work from this chat (docs/45–50).

## Behavior

- Keep highlights the trait itself in berry; Delete strikes it through; Ignore
  leaves it neutral. All three text actions remain visible, with aria-pressed,
  existing explicit accessible names and keyboard focus outlines.
- The reference/search and DNA editor sit side by side above 900px; narrower
  screens retain source order, with the editor beneath the reference.
- Price is an inline Any / € / €€ / €€€ / €€€€ group, with no dropdown. Existing
  filtering semantics and signed provider inputs are unchanged.
- Coarse pointers/mobile retain 44px-high action targets. Long trait names wrap.
- The alternative hero cartoncini illustration was only a proposal; it is not
  silently substituted as part of the approved filter variant.

## Publication scope

Publish to the existing production branch `claude/blissful-gauss-dymbeo`, verified
as the GitHub default and the existing live deployment source. Do not change the
GitHub default branch, Vercel production branch or provider choices. Remote main
is already an ancestor of this checkout. No force push is needed.

The approved real-visit table was created/metadata-verified in the preceding
step. Persistent environment settings are unchanged in this release; account
travel sync stays browser-local unless VISITED_CITIES_SYNC is separately enabled.

## Verification

Unit/service suite, production build, TypeScript and whitespace checks passed.
The selected browser regressions cover marked label states, text-only price,
side-by-side desktop vs stacked mobile geometry, completed Twin flows, Home,
owner isolation and photographic credits. See the final release receipt below
for the resulting count and remote deployment identity.

Pre-publication browser run: **30/30 passed** on the final production build at
localhost:3106. The four complete-flow sizes (320, 390, 812 landscape, 1440)
also assert label highlighting/strikethrough, price choice/reset and editor
geometry. Other cases cover three categories, empty/single/error results,
reduced motion, CLS, large text, owner changes, Home and source attribution.
No real-user or cross-device test is implied by intercepted fixtures.

## Confirmed live receipt

Application commit `d05395a119ebe2b848f15cf93951e4115663eba8` was pushed normally
to both `codex/twin-motion-ux` and the existing production branch
`claude/blissful-gauss-dymbeo`. Vercel production deployment
`dpl_7AmrY9oVsWKFHfQc4u1yC3NS2ugF` is READY and aliases
https://beesyde.vercel.app with no alias error. Default branch/configuration were
not changed; remote main was not pushed.

Public smoke: Home, Madrid/Twin and photo credits return HTTP 200; public CSS
contains the new marked-label/inline-price controls. Two additional full Twin
browser flows at 390 and 1440 passed against the public domain (intercepted
synthetic APIs, no real-user/provider experiment). This receipt is a documentation
follow-up on the working branch; the live application commit remains d05395a.
