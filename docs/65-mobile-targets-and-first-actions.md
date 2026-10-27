# Touch controls and earlier Home/City actions — 27 October 2026

Continuation of the approved audit programme #45 and the local quiz work in docs/64. Owner requested the next priorities: #49 and #50. The existing uncommitted quiz implementation is preserved. No push/deployment, schema, provider, auth or production setting change.

## Delivered locally

### #49 — comfortable targets and readable controls

- Twin Keep/Delete/Ignore and all four price tiers have at least 44×44 CSS-pixel targets. Prices can wrap on narrow screens; trait states and semantics are unchanged.
- Quiz text controls, including Skip, have a 44px minimum width as well as height. Important mobile labels/status are enlarged without replacing the artwork or changing question values.
- Map buttons have 44px hit areas around the original small numbered marks; zoom and popup-close controls are also 44px. Active feedback changes the mark rather than displacing its interactive area.
- Overlapping map hit areas merge into a single “N places here. Choose a place.” control, recalculated after movement/resize. Its chooser preserves each place's list number and name. Escape and the close button return focus to the pin; selecting a place returns to List and focuses the corresponding place title after it becomes visible.
- Header sign-in and bottom navigation can adapt to enlarged text rather than overflowing. The regular header still reserves the existing auth slot.

44px is the chosen comfort target, not a claim that every smaller control previously violated WCAG AA. No screen-reader or real-device certification is implied.

### #50 — earlier search and results

- Home city/Twin forms now precede the decorative emblem in reading and visual order. The bound Passport, berry/paper halves, example page and finite motion remain. Decorative size/spacing is reduced; forms remain outside the animation timeline.
- Mobile City retains its cover photograph, name, local name, country, change-city control and Twin ink artwork with a shorter introduction and more compact layout.
- Categories use a constrained horizontally scrollable row on mobile/tablet. It stays within the page and keeps keyboard focus/labels, rather than widening the whole grid.
- Secondary City filters are collapsed initially on mobile, while desktop controls remain directly available. The mobile Filters and List/Map controls share a row. Active choices and Clear filters remain visible when the fields are closed.
- Filters retain per-category URL/history state. Reset clears only the current category's choices. The existing result filtering and map/list numbering contracts remain unchanged.
- The guest Passport invitation is compact; its recovery/error/refresh messages are still visible. It does not block browsing the results.

## Verification and corrections

Existing Playwright fixtures are the approved test seam, with provider/auth/map-style responses intercepted. New scenarios check both Home entrances in the first viewport at 1440×900, 1440×780 and 375×812; Twin target sizes at 320/375/768; mobile guest/personal first results before y=700; filter persistence/reset; overlapping-place chooser, numbering and focus; 320px and landscape filters with text enlarged 200%.

During implementation the checks exposed an intrinsically wide category row, a popup closing on its opening click, focus moving before List was visible, and enlarged header/navigation overflow. These were fixed. One filter test initially used an overly strict label selector; a guest measurement was also stabilised against transient skeleton replacement. The final outcome below is separate from those initial failures.

The earlier development run had 48 passing browser scenarios. Subsequent targeted enlarged-text checks passed after the shell fixes. Final compiled integration run: **74 pass, 5 intentional skips**, across quiz, Passport folio, acceptance, review refinements and Cities/Twin release checks. The five skips are development-only Place fixtures: internal return plus four broken-photo widths. This is a targeted integrated run, not the whole browser repository. Full unit/service suite, production build, typecheck and diff check pass; no live provider probe is used for these tests.

Private screenshots under `.private/priorities/` were inspected, including the Home at 1440×780 and City at 320px with 200% text. Fixture photographs are deliberate flat placeholders, not production-image acceptance. Logs remain private under `/tmp/tpd-priorities-*`.

## Boundary and continuation

The local production preview is http://127.0.0.1:3213. No publication occurred. #49/#50 stay open for integration/review, consistent with #46–48. Physical phones, native Safari/VoiceOver/TalkBack, actual audio, genuine accounts/cross-device and field performance remain separate #43/#44 acceptance gates.

Follow-up #51 (consistent SVG actions and image continuity) and #52 (reasons, Twin differences and honest Passport copy) are now implemented locally; see [docs/66](66-icons-photos-and-honest-copy.md). Preserve the existing glossary, ADRs and latest local quiz work when continuing.
