# 0004 — Visual direction: Oltremare, with the Atlas layout for Swap

Status: accepted in part, 22 Oct 2026 (owner, `/loop-me` session for #4). Spec: #3. Typography is still open (font pairings shown to the owner as a private artifact).

## Decision

- **Base style:** `design-mockups/A2-oltremare.html`. Paper background (#F5F3F9), deep ink (#1B1640), ultramarine (#3B2BFF) as the brand colour, red stamp (#E8462E), sun yellow (#FFC23D). Timbri, a passport with real data, serif italic as the accent.
- **Swap results:** the layout from `design-mockups/B-taste-atlas.html`. The starting place is struck through, the twins are numbered on a map, and a keep / change list sits beside them.
- **Colour:** the Oltremare base everywhere. Each city adds one accent colour taken from its cover photo (city header, its stamp).
- **Theme:** light only for now.
- **Motion:** rich. Page transitions, cards entering, the stamp being printed, results re-ordering, parallax on covers. It is always off with `prefers-reduced-motion`, and never blocks reading (content is visible at rest).
- **Typography:** to be decided. Options A (Instrument Serif + Familjen Grotesk), B (Fraunces + Familjen Grotesk), C (Bricolage Grotesque + Instrument Serif italic) and D (Young Serif + Hanken Grotesk).

## Consequences

- #25 (tokens and CSS rewrite) starts once typography is chosen.
- The current pink (#D61F69) is replaced by the Oltremare palette.
