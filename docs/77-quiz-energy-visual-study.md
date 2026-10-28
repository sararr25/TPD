# Quiz energy — isolated visual study

28 October 2026 · Owner rejected the repaired quiz's visual direction: it must feel energetic, colourful and in the established Beesyde brand. The magazine-test reference describes the unwanted result. This study answers how the quiz should look and react before a new public replacement.

Branch: `codex/quiz-energy-study-20261028`, based on application `5cacbf2`. Prototype code stays on this throwaway branch. No variant has been accepted or folded into the application. Implementation ticket #74 and visual/accessibility follow-up #86 retain the context pointer and owner's eventual verdict.

## Run and compare

`npm install --ignore-scripts` then `npm run dev -- --port 3224`.

Existing host route: `/preview/checks?quizEnergy=1&variant=A` (B/C switch alternatives). `step=0` shows Places, `step=1` Music, default `step=2` Your ideal day abroad. The in-memory demo uses these three real question types; it creates no Passport, performs no discovery request and persists no answers. The final screen explicitly identifies the three-question study. The normal preview/checks fixture remains development-only.

Development has a shared bottom switcher, arrow-key controls, sample-question buttons and a state drawer. Arrows do not intercept fields, buttons or swipe cards. The switcher is omitted from production builds; protected branch previews use direct A/B/C URLs. The study route itself is rejected in the production environment. Closing the study reveals the real app host and a state drawer. Actual auth/data/provider configuration is unchanged.

## Directions

- **A — City playground:** Passport-inspired split scene on desktop, stacked illustrated arena on mobile; native city vector responds to a selection. Four single cells plus a two-cell neutral choice occupy a two-column/three-row grid without empty cells. The dashed walking line and lemon light connect it to the existing Home/City vocabulary.
- **B — Choice runway:** five expansive illustrated panels on desktop, swipeable large panels on mobile. Each option has a full contextual label. This tests focus on one choice at a time rather than the simultaneous A grid.
- **C — Passport theatre:** saturated berry stage, central city and oversized layered answer cards; choice and swipe feedback bring lemon into the foreground. This tests a more immersive treatment while retaining the existing type and palette.

All three use Instrument Serif/Hanken Grotesk, berry/lemon/stone, the existing original quiz illustrations and newly authored native SVG city geometry. No stock images, third-party marks or catalogue/photo imports were added.

## Applied skills and scope adaptations

- `motion-advanced` + prerequisite `motion-foundations`: Motion/react owns drag, motion values and spring release/press; shared prototype tokens own duration, thresholds and spring presets. No framer-motion imports. A swipe requires explicit offset (80 px), or offset >=32 px together with velocity >=550 px/s. New keyed cards start with neutral feedback. Reduced motion disables animated transforms; native Yes/Pass controls remain.
- `gpt-taste`: a real deterministic Python draw (seed161) selected Editorial Split; horizontal panels, typographic ribbon, inline artwork; image entrance and text reveal. Applied to a quiz progression instead of a landing-page AIDA/pricing template. The explicit owner requirement to remain in brand takes precedence over randomly changing fonts. GSAP owns the SVG scene/paths and finite text/scene sequences, separate from Motion's card transforms. Content is visible before enhancement and controls have no decorative wait.
- `vector-graphics`: the named skill is specific to PixiJS; no PixiJS is installed in the app. Its scope explicitly excludes a requirement for general SVG work. Existing native SVG conventions were preserved; no Pixi renderer was added. Geometry stays static while groups/paths move; lifecycle cleanup stays explicit.
- `prototype`: three structurally distinct directions on the existing host, in-memory state surfaced after actions, primary source captured separately. No permanent test suite or production-grade abstraction was added for throwaway code.

## Inspection and limits

Informal browser walkthrough inspected all three at390 and1440 widths: five scale choices, no root horizontal overflow and no page errors. Private synthetic screenshots remain ignored under `.private/quiz-energy-review/`. A Chrome touch-emulation swipe changed Khruangbin to Nina Simone; a tapped scale choice produced its finite scene reaction and advanced to the demo finale. These are prototype checks, not physical S24 acceptance or a user experiment.

Type checking passed. The first isolated build lacked the existing Neon Auth configuration; a second attempt exposed Next worker propagation of Node’s env-file flag. The successful build loaded the existing local configuration into the parent environment without copying or printing secrets; the ticket receipt records the final source SHA and READY branch-preview URLs. Real S24 gesture feel, perceived energy, sound, text enlargement and the owner's visual verdict remain to be reported. No production promotion or update of the real quiz occurred in this study.
