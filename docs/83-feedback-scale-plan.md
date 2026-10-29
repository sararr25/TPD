# Feedback round — scale, clarity, colour (2026-10-29)

Core problem: everything is oversized, so the eye has nowhere to land. Fix scale first, then the per-page issues.

## Decisions (grill round)
- Twin page visual: **double helix** — shared "genes" (vibe, price, neighbourhood) are the rungs between your place and its twin.
- Passport favourites: **3 min, 10 max** (was 5).
- City hero: replace the yellow line with a **subtle city outline / pins** animation; hero ~40% shorter.
- Action buttons: **small coloured pills, icon + short label**; saved state obvious (filled + "Saved").

## Steps

### 1. Global scale pass
Tighten the type/spacing scale in `src/app/globals.css` (smaller h1/h2, card padding, buttons ~32–36px, tag chips ~24px). Done: no hero > ~45vh on desktop; buttons and tags visibly smaller.

### 2. Shared action buttons (Save / Not for me / Compare)
One component used by `place-card.tsx`, the place page and `swap-workspace.tsx`. Colour per action, icon + label, `aria-pressed` and filled style when saved. Remove the yellow "Save twin" button. Done: saved vs unsaved readable at a glance.

### 3. Place cards & tags
Smaller, colour-coded tag chips; tighter cards in `place-card.tsx` and the "Other matches" grid. Done: 3+ cards per row on desktop.

### 4. City page hero (`src/components/city-view.tsx`)
Remove the white pear-shaped blob and the yellow line. Shorter hero, subtle outline/pins animation (respects reduced-motion). Done: compact hero, no stray shapes.

### 5. Twin / Matches page (`swap-workspace.tsx`)
Replace the 3 lines + arrow with a DNA double helix linking original and twin; shared traits as rungs. Smaller "Other matches" cards. Done: connector explains why they match.

### 6. Passport (`passport-builder.tsx`)
Smaller passport visual; raise favourites limit to 10 (copy, counter, any server-side validation). Done: can add 10, build passes.

### 7. Verify
`pnpm lint && pnpm build`, run app, screenshot each page desktop + mobile.
