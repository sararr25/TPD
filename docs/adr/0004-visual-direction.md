# 0004 — Visual direction: Oltremare, with the Atlas layout for Swap

Status: accepted, 22 Oct 2026 (owner, `/loop-me` session for #4). Spec: #3.

## Decision

- **Base style:** `design-mockups/A2-oltremare.html`. Paper background (#F5F3F9), deep ink (#1B1640), ultramarine (#3B2BFF) as the brand colour, red stamp (#E8462E), sun yellow (#FFC23D). Timbri, a passport with real data, serif italic as the accent.
- **Swap results:** the layout from `design-mockups/B-taste-atlas.html`. The starting place is struck through, the twins are numbered on a map, and a keep / change list sits beside them.
- **Colour:** the Oltremare base everywhere. Each city adds one accent colour taken from its cover photo (city header, its stamp).
- **Theme:** light only for now.
- **Motion:** rich. Page transitions, cards entering, the stamp being printed, results re-ordering, parallax on covers. It is always off with `prefers-reduced-motion`, and never blocks reading (content is visible at rest).
- **Typography** (chosen from three rounds of font pairings):
  - Titles: **Instrument Serif**. Upright words are thickened with a text stroke of **0.025em** in the text colour (`-webkit-text-stroke: .025em currentColor; paint-order: stroke fill`). Instrument Serif has a single weight, so this gives the titles more body. The coloured italic accent stays **unthickened** (stroke 0) and uses the brand colour.
  - The stroke is for display sizes only (roughly 22 px and up). Never use it on small text.
  - Text and UI: **Hanken Grotesk** (400 / 500 / 600).
  - Mono, for dates, codes and the MRZ line only: DM Mono.
  - Rejected: Young Serif (too wide), plain Instrument Serif (too light), Fraunces, Bricolage, Familjen Grotesk for text.

## Consequences

- #25 (tokens and CSS rewrite) starts once typography is chosen.
- The current pink (#D61F69) is replaced by the Oltremare palette.

## Amendment — 22 Oct 2026: palette

The owner replaced the Oltremare colours (lavender background and ultramarine felt cold and too blue). New palette, "Berry and lemon on cool stone": cool stone background #E8E9EB, near-white paper #F8F8F9, ink #1E1630, berry violet #7E2B8F as the brand colour, lemon #FFE14D as the sun colour; the red stamp stays. Fonts, layout and motion are unchanged. Values and contrast in `src/styles/tokens.css`.

## Amendment — 23 Oct 2026: city accents

The owner confirmed small accents per city, keeping berry on large surfaces.
City ring marks in the guide, city cards and Passport activity stamps use
curated city inks on paper; covers continue to use muted `--pass`. Accent
values live only in `src/styles/tokens.css` and have 5.67:1 or greater text
contrast on paper. Phu Quoc has no cover photo and keeps the brand fallback.

## Amendment — 24 Oct 2026: Home Passport A

After reviewing local animated HTML studies, the owner chose **A / La rilegatura**.
Home must improve the existing Passport theme, not replace it with a magazine,
desk collage or cinematic theme. The berry cover and paper example page form
one bound Passport, with security linework, stitching, a gutter, paper edges,
lemon bookmark and an example city stamp. Existing fonts, palette, equal City
and Swap entrances, real example results and personal-profile isolation stay.
Motion is limited to page entrances and stamps; the opening cover from option C
is not part of A. See [implementation](../37-home-passport-a.md).
