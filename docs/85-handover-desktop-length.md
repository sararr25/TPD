# Handover — desktop length and Passport cover, 29–30 Oct 2026

Branch: `claude/blissful-gauss-dymbeo` · Last commit of this round: `c32096c`. Read after [docs/84](84-handover-feedback-fix.md).

## Owner feedback (verbatim idea)

On the web version, "too big" is about **length**, not width. Some things (Twin place cards) are also too wide, but the Passport book was right at its wide size. Keep widths, cut height.

## What shipped (all pushed)

| Commit | Change |
|---|---|
| `813cbd4`, `8e779ad` | Purple Passport cover on the left, chalk stamps in three shapes, category-coloured favourite chips, stamps show city code + "VISITED" on phones. |
| `4a3c516` | Passport book back to full 980px width (the 760px cap was wrong). Height 925 → 755px: the illustration no longer reserves a 170px strip under the heading (desktop only). |
| `93e8e04` | "Your Passport" title larger and lighter (34–44px, weight 500). Removed "Your real travels, stamped on your pages." and the "Visited-city choices stay on this browser only." fallback. The note still shows when there is a real message or an account sync line. |
| `fc323df` | Twin result card capped at 680px on desktop (`swap.css`). |
| `d291cc6`, `c32096c` | New `src/styles/desktop-compact.css` (imported last in `globals.css`, all rules `min-width: 851px`): tighter Home, Cities and city-page spacing; Cities grid 5 per row from 1100px; Home Twin demo shows one card; slimmer "Three ways in" and closing band. City grid on Home untouched by owner request. |

Measured at 1440px wide: Home 3330 → 2696px, Cities 1680 → 1348px, Passport book 925 → 755px.

## Decisions and lessons

- Do not cap the Twin "Other matches" grid: narrower cards wrap their pills and get taller (214px at 602px wide, 268–330px when narrower). Left as it was.
- The Home Twin demo hides cards 2–3 with CSS on desktop (`.h-demo-extra`); the count line switches to "Closest alternative…" via `.h-demo-one`. Phones still show all cards.
- `pnpm lint` does not run this project's linter (there is no lint script). Use `pnpm typecheck`.
- The discovery API rate-limits repeated test searches ("You have made a lot of searches in a short time"); it clears after about ten minutes.

## Not verified / still open

- Desktop pages not touched: Saved, Compare, single place page, Twin "Other matches".
- Nothing was measured with real saved data or a Passport with timbri and ten favourites after the title change.
- Home Twin demo with real results (rate limited during testing) and the final band were not seen on screen after the change.
- Button consistency from the last check (docs/84 §7): city-card "Find its twin" grey 36px vs coloured 30px pills; saved list uses text links; place-page "Saved" is grey instead of filled purple. Owner has not decided; changing them alters several pages.
- Possible empty map beside the saved list (screenshot was mid-animation).
