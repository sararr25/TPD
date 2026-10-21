# 23 — UI/UX review after Phase A (21 Oct 2026)

Fresh pass with the ui-pro and ux-pro rules, walked live on `next dev` (desktop + 375 px) as a new user: Home → "Try a sample profile" → guest Passport → Explore → like / save → Swap → Collections. Builds on docs/22; items already fixed in Phase A are not repeated.

Severity: 🔴 blocks or confuses users · 🟠 clearly hurts quality · 🟡 polish.

---

## 1. What I would CHANGE (broken or misleading today)

| # | Sev | What I saw | Rule | Fix |
|---|---|---|---|---|
| C1 | 🔴 | **"Try a sample profile" opens question 1/18 of the quiz.** The sample is hidden behind "I'd rather search for my favourites", then a select, then "Resolve this guest profile", then "This feels like me". 4 taps and 2 screens for a "one-click demo". | UX §6 streamline tasks; promise = result | `?guest=1` loads the sample Passport directly and goes to Explore. Zero extra taps. |
| C2 | 🔴 | **Explore for a new user is a dead end**: a big card "First, a little about you" and nothing else. The city pills on Home look like links but you hit this wall. | UX §6 lazy registration, "try before signup" | Show generic top picks for the city right away with a banner "Make them yours · 3 min". Personalise after. |
| C3 | 🔴 | **Developer words in the UI**: "Resolve this guest profile", "Search Qloo", "3 of 5 selected · live Qloo entities", "Borrow a Passport", "Price level: unknown", "Picked by Qloo for your taste". | UX §5 labels in the user's language | "Use this profile", "Search", "3 of 5 picked", hide unknown price, drop the vendor name from every card (keep it once in the footer). |
| C4 | 🟠 | **Save on first use asks to name a list** ("Name your first list · Create") in a popover that covers the card title. Saving is a 2-step form. | UX §6 one-click where stakes are low | First save goes straight into "{City} trip" with a toast "Saved to Paris trip · Change". The list picker appears only when you tap "Change". |
| C5 | 🟠 | **Like vs Save is unclear**: "More like this" (👍) and "Save" (♡) sit side by side and both mean "I like it". | Hick's law; recognition | Merge: ♡ = save *and* teaches your taste. Keep ✕ "Not for me". Two actions, not three. |
| C6 | 🟠 | **The same disclaimer three times**: top notice bar, a paragraph above the grid, and "Opening hours not verified" in every card footer. | Hierarchy: warnings over delight | One line in the page footer and on the detail view. Remove the top bar and per-card footer. |
| C7 | 🟠 | **Swap shows a 2-column form with an empty right column** ("Step 2 · What to keep — find your restaurant first"). Half the screen is a placeholder. | Progressive disclosure | One column: search field with live suggestions; step 2 appears under it only after picking a place. |
| C8 | 🟠 | **City is a native `<select>`** on Explore and Swap. | ui-pro §7 recognition over recall | Horizontal scrollable chips with the 11 cities (same as Home), current one filled. |

## 2. What I would IMPROVE (works, but looks or feels weak)

### Visual (ui-pro)
1. 🔴 **No images on cards**, even though Qloo returns `properties.images[].url` for every place we sampled (docs/22). A travel app made of white text boxes reads as an admin tool. → 4:3 photo on top of every card, illustrated fallback per category when the image fails.
2. 🟠 **Card hierarchy is upside down**: the name is huge (≈32 px), the full address is the second loudest thing, the *reason it fits you* is missing. → Name 22 px semibold · one "why" line in ink · tags as 2–3 small chips · address shortened to the neighbourhood in grey.
3. 🟠 **Card actions are 4 equal outline buttons on 2 rows** (Save, More like this, Not for me, Map). No primary, they wrap differently per card. → One fixed bottom row: ♡, ✕, ↗ map as icon buttons. Equal card heights, actions bottom-aligned.
4. 🟠 **Two button languages**: dark "ticket" (Make my Passport, This feels like me) vs tiny mono uppercase "stamp" with a double outline (Sign in with Google, Search Qloo, Find the restaurant, Resolve…). The stamps look like disabled tags, yet "Find the restaurant" is the main action of Swap. → Primary = ticket. Secondary = 1 px outline, body font, 44 px tall. Mono only for metadata.
5. 🟠 **Radius chaos**: 3, 4, 6, 8, 12, 16, 999 px plus `var(--radius)` / `var(--radius-card)` in `globals.css`. → Two values: 8 (controls) and 16 (cards/sheets), plus 999 for chips.
6. 🟠 **Spacing off-scale**: 25, 38, 46 px in `globals.css`. → 4-px scale only (8, 16, 24, 32, 48, 64).
7. 🟠 **Pink overload**: hero second line, active nav, active category, "Liked" button, focus ring, seal… → Pink = "yours / selected" only. Hero italic line in ink.
8. 🟡 **Same hero formula on every page** ("A city, / *read through your taste.*", "Keep the feeling. / *Change the place.*", "Places worth keeping. / *Grouped by trip.*"). On inner pages it pushes content down and feels templated. → Keep it on Home only; inner pages get a one-line 32 px title.
9. 🟡 **Type scale gaps**: body 18 px, lead 21 px, eyebrows 11 px grey mono uppercase (hard to read). → Body 16, lead 18, meta 12 with ≥ 4.5:1 contrast.
10. 🟡 **Logo "B" ring**: a 52 px circle with a 12 px letter looks like a placeholder. → A real mark (bee/stamp), or just the wordmark.

### Experience (ux-pro)
1. 🔴 **Mobile: the first place card appears after ~1.5 screens** (notice bar → logo → full-width Google button → 2-row nav → 3-line headline → select → 3 rows of category buttons → 2 disclaimer lines). → Slim top bar (logo + avatar), bottom tab bar (Explore · Swap · Passport · Saved), categories in one horizontal scroll row, no hero on Explore.
2. 🟠 **"Sign in with Google" is the loudest element in the header on every page**, before the user has a reason to sign in. → Small "Sign in" link / avatar; ask in context (after the 3rd save: "Keep your lists on every device").
3. 🟠 **No place detail view.** Tapping a card does nothing; "Map" leaves the site. → Bottom sheet with photos, why it fits you, tags, map, "Find similar" (= Swap), Save.
4. 🟠 **Swap is an island**: separate page, type a name. → "Find similar" on every card pre-fills Swap.
5. 🟠 **Home doesn't show the product**: slogan + 3 generic "Step 1/2/3" cards. → A live example: "Loves Khruangbin + Before Sunrise → in Lisbon:" with 3 real place cards and photos. One CTA.
6. 🟡 **Quiz Q1 is a slider between two icons** with no value label. → Two big tappable cards or 5 discrete steps; "1 of 18 · about 3 min".
7. 🟡 **"Edit favourites" on Swap** sends you away mid-task. → Open as a sheet, return to the same Swap state.

## 3. What I would ADD
1. **Place photos + illustrated fallbacks** — biggest single quality jump.
2. **Map view** toggle on Explore (MapLibre + OSM, already approved), pins matching cards.
3. **Place detail sheet** with "Find similar".
4. **Skeleton cards** while loading.
5. **Travel filters**: price (€–€€€€), neighbourhood, "open now" when data exists.
6. **Passport that fills up**: each saved place / explored city adds an ink stamp (the brand metaphor, today only on the Home illustration).
7. **"Why this fits you" line** citing the user's own favourites.
8. **Share a list** as a link / postcard image (extends the existing PNG share).
9. **Remember city, category and scroll** when coming back.

## 4. What I would REMOVE
1. The **top notice bar** — move to the footer.
2. The **per-card footer** ("Picked by Qloo for your taste / Opening hours not verified").
3. **"Price level: unknown"** — show nothing when unknown.
4. **"More like this" as a separate button** (merged into Save).
5. The **3 "How it works" step cards** on Home (replaced by the live example).
6. The **2-line italic pink hero** on inner pages.
7. The **full address** on cards (neighbourhood only; full address in detail).
8. The **"Borrow a Passport" guest panel** inside the favourites form (the sample link does it directly).
9. **Mono uppercase on buttons** — mono only for dates, codes and MRZ details.

## 5. Suggested order
| Step | Items | Why |
|---|---|---|
| 1 — Unblock the first minute | C1, C2, C3, mobile shell (bottom bar, slim header) | A new user hits a wall or a dev screen within 30 s |
| 2 — The card | Photos + fallback, new hierarchy, icon actions, merge Like/Save, C4, C6 | 80 % of what users look at |
| 3 — Tokens | Radii, spacing, one button system, pink only for "yours", type sizes | Every later screen becomes consistent for free |
| 4 — Flow | Detail sheet, Find similar → Swap, city chips, single-column Swap, Home live example | Turns tools into a journey |
| 5 — Delight | Passport stamps, why-line, map, share list | On top of a solid base |
