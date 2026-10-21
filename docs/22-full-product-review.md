# 22 — Full product review: functions, UI, UX (21 Oct 2026)

Supersedes the UX/UI parts of docs/21 (that audit only looked at Swap/Explore logic and was too shallow).
Nothing was changed in the code for this review.

**How it was done:** every component read line by line (`src/components/*`, `src/app/*`,
`globals.css`, `design-mockups/tokens.css`, docs/06 brand system), then every page used live
on the production build at 1024 px and 375 px (guest Passport, Paris + Ho Chi Minh City).
Each finding says whether it was **seen live** or **read in code**.
**Not covered:** signed-in flows (Collections, saving, account) were reviewed from code only —
there is no test Google account in this environment. Quiz was reviewed from code, not played through.

Severity: 🔴 broken / blocks the user · 🟠 clearly wrong or confusing · 🟡 weak, worth improving.

---

# 1. Functions and logic

## 1.1 What doesn't work (logically or functionally)

### Saving & Collections
| # | Problem | Where | Sev |
|---|---|---|---|
| F1 | **You can't pick an existing list or create a new one.** "Save to a collection" is a hidden text link that opens a free-text field. Existing lists only show as a browser autocomplete *after* you clear the field. There's no list of your collections, no "＋ New list" option, and no way to save one place to several lists. (code) | `save-to-collection.tsx` | 🔴 |
| F2 | **Wrong default list name.** If you have no lists yet, the field is pre-filled with your current city in Explore, but with **"Paris"** in Swap, whichever city you're actually in (`names[0] ?? "Paris"`). Pressing Save quietly creates a "Paris" list for a Tokyo place. (code) | `save-to-collection.tsx:17`, `swap-workspace.tsx` | 🔴 |
| F3 | **Guests can't save anything.** Saving needs Google sign-in, but Passport, votes and hidden places all work as a guest. A first-time user who finds a place they love hits "Sign in to save places to a collection" in small grey text. (seen live) | Explore, Swap | 🔴 |
| F4 | No way to rename a list, create an empty one, move a place between lists, reorder, or see a list on a map. Delete uses the browser's raw `confirm()` popup, and "Remove" has no undo. (code) | `collections-view.tsx` | 🟠 |
| F5 | A saved place has no "saved" state on its card. After saving, the card looks exactly the same, and the only confirmation is a line of text inside the collapsed panel. (code) | Explore, Swap | 🟠 |

### Explore
| # | Problem | Where | Sev |
|---|---|---|---|
| F6 | **Feedback appears off screen.** Confirmations ("Noted: more places like…", "won't come up again") are written into one status line at the top of the page. When you tap a card further down, that line is out of view (measured: 105 px above the screen). You never see it. (seen live) | `explore-view.tsx` status | 🔴 |
| F7 | **"Not for me" can't be undone where you clicked it.** The card disappears instantly, the grid jumps, and the message (off screen) says to go to the Passport page to undo. (seen live) | `notForMe()` | 🔴 |
| F8 | **"Yes, more like this" can't be undone.** Tapping "Liked ✓" again does nothing. (seen live) | `like()` | 🟠 |
| F9 | Hiding a place doesn't fetch a replacement: 9 results become 8, 7… until you change category. (seen live) | hidden filter | 🟡 |
| F10 | Explore's card tags still use the old filter (`cuisine:place`), so cards show "Happy hour · Social · Lively · Beer" rather than the cuisine. This is the same bug fixed for Swap chips in docs/21. (seen live) | `SHOWN_TAG` | 🟠 |
| F11 | City always resets to Paris, and Explore and Swap don't share the chosen city, so you choose Ho Chi Minh City twice. (seen live) | `useState("Paris")` ×2 | 🟠 |
| F12 | Cafés and coffee shops show up as "Restaurants" (La Moderne / Mandarin coffee, Shakespeare and Company Café). (seen live) | Qloo data, `offCategory` | 🟡 |
| F13 | While loading, all category buttons turn grey and the page shows one line of text. You can't change your mind (switch city/category) until the request ends. (seen live) | `disabled={busy}` | 🟠 |

### Swap
| # | Problem | Where | Sev |
|---|---|---|---|
| F14 | **Every tap re-runs the search on its own.** After the first "Swap it", changing any Keep/Change/Ignore chip or the price triggers a new Qloo request without pressing the button. Results vanish and reload on each tap, and each tap uses up the Swap budget. (code: effect deps include `choices`, `budget`) | `swap-workspace.tsx` | 🔴 |
| F15 | **Changing city or category wipes your progress silently.** The workspace is remounted (`key={city-category}`): chosen place, chips and results disappear with no warning. (code) | `SwapWorkspace` | 🟠 |
| F16 | The "Try museums with this Passport" upsell sits **above** the results, so you see an ad for another feature before your answers. (seen live) | results section | 🟠 |
| F17 | Engineer copy shown to users: "20 eligible candidates · 0 discarded by local validation. Three roles are selected from this candidate set…". (seen live) | results header | 🟠 |
| F18 | Pressing "Swap it" gives no visible feedback: the results are below the fold (docs/21 B3, still open). (seen live) | | 🔴 |

### Passport & quiz
| # | Problem | Where | Sev |
|---|---|---|---|
| F19 | One page mixes quiz, sample profiles, search, your picks, learned votes, hidden places and account deletion, all reporting through a **single status line**. Messages overwrite each other and appear far from the action. (code: ≈25 `setStatus` calls) | `passport-builder.tsx` | 🟠 |
| F20 | Search needs you to choose a type first ("Artists & music / Films / Books / Places") and then press "Search Qloo". There's no live suggestion, and a film searched under "Artists" returns nothing. (seen live) | search form | 🟠 |
| F21 | Removing a favourite = tapping its chip, with no confirmation and no undo. It's easy to do by mistake. (code) | selected chips | 🟡 |
| F22 | Developer copy: "Search Qloo", "3 of 5 selected · live Qloo entities", "Old sample choices are not treated as live entities", "Resolve this guest profile". (seen live) | | 🟠 |

### Global
| # | Problem | Where | Sev |
|---|---|---|---|
| F23 | **The menu never shows which page you're on.** The style targets `aria-current=page`, but the layout never sets it. (code + seen live) | `layout.tsx` + CSS | 🟠 |
| F24 | **City pills on the home page look clickable but aren't** (plain list items). (seen live) | `page.tsx` | 🟠 |
| F25 | **Double arrow on main buttons:** the button text ends in "↗" and the `.ticket` style adds another "↗" ("This feels like me ↗ ⁞ ↗", "Swap it ↗", "Make my Passport ↗"). (seen live) | `.ticket:after` | 🟠 |
| F26 | Errors are shown as raw messages in the status line (docs/21 A5). (code) | all views | 🟠 |

## 1.2 What can be better, and how

1. **One feedback system.** Replace the page-level status line with **toasts** (small pop-up messages) that appear near the bottom of the screen, last ~4 s and carry an **Undo** button: "Hidden Le Pont de Seine · Undo", "Saved to Tokyo trip · View". Keep `aria-live` for screen readers.
2. **Save sheet.** "♡ Save" opens a sheet listing your lists with checkboxes (several allowed) plus a "＋ New list" row at the top, pre-named "<City> trip". One tap saves. The heart fills once saved.
3. **Guest saving.** Save into the browser first (like the Passport already does). On first save, offer "Keep it on all your devices → Sign in", and move the lists into the account on sign-in.
4. **Swap search only on the button.** Chip and price changes mark results as "out of date · Update" instead of re-fetching.
5. **Remember the city** across Explore and Swap (one shared value, saved in the browser), and warn before wiping Swap progress.
6. **Undo everywhere it's cheap:** like, not-for-me, remove from list, remove favourite.
7. **Replace hidden places** with the next result so the grid stays full.
8. **One search box for favourites** that suggests artists, films and books together as you type, with an icon per type.
9. **Explain each card:** the shared-feature "why" from Swap (docs/21 A2) also on Explore cards ("Fits your love of quiet, natural wine").
10. **Plain copy pass:** remove "Qloo", "entities", "candidates", "validation" from user-facing text. Keep the data notice in one "About these picks" link.

## 1.3 Logic, functions and features to add

- **Trip mode:** pick city + dates → one place per meal/slot builds a simple day plan from saved places ("Day 1: museum → lunch nearby → bar").
- **Map view** for Explore results, a list, and a neighbourhood (pins + "walk between them" order).
- **Place detail sheet:** photos, why it fits you, tags, price, map, "similar places" (= Swap from here). Swap becomes a button on any place ("Find me something like this"), not a separate tool you must understand first.
- **Filters:** price, "near me / near this place", vegetarian etc. from Qloo tags; open now only if a reliable source is added.
- **Compare two cities** for the same Passport ("Your Lisbon vs your Porto").
- **Shareable lists** (read-only link), building on the existing share card.
- **"Surprise me"** button: one wildcard pick per city, explained.
- **Recently viewed** and **search inside a city** from Explore, so Swap's first step lives where people already are.

---

# 2. UI — brand system and visual quality

## Brand system check (docs/06 vs what ships)

| Brand rule | Reality | Verdict |
|---|---|---|
| One ticket (primary) CTA per screen; secondary as stamp or text | Mostly respected, but the ticket shows a double arrow (F25), and "Sign in with Google" in the header is a heavy stamp that competes with the hero CTA | 🟠 |
| Stamp pink = selection, accent | Pink is used for selection, links, italic headings, the status line (so errors look like accents), role labels and conflicts. **Pink means everything, so it means nothing** | 🟠 |
| Third colour #D9860B (reserved accent) | Never used | 🟡 |
| Radius 8 / 16 | Cards 12 and 16, chips 6, buttons 3 and 6, pills 999: five different radii | 🟠 |
| Space scale 4–32 | Margins like 25, 38, 46, 56 px all over `globals.css` | 🟡 |
| Passport metaphor (stamps, cover, MRZ line) | Strong on the landing card and the profile card, **absent everywhere else**: Explore, Swap and Collections are plain forms and white boxes | 🔴 |
| Mono for metadata | Overused: buttons, notices, labels, stubs and footer are all small uppercase mono, so the page reads like a terminal | 🟠 |

## Where it looks "AI-sloppy" or too basic

1. **No imagery at all.** A travel product with zero photos, maps or illustrations of places. Every result is a white box with a name and an address. This alone makes it feel like an admin tool. (seen live)
2. **Template layout:** hero with a slogan in two lines, the second in italic pink → "How it works" with 3 identical icon cards → a list of pills. This is the standard AI landing page. (seen live)
3. **Actions are underlined text** ("Open in Maps ↗", "Yes, more like this", "Not for me", "Save to a collection", "Remove", "Delete collection"). They don't look tappable, they wrap differently on each card ("Not for me" jumps to its own line after liking, seen live), and destructive actions look the same as harmless ones.
4. **Uneven cards:** heights, button rows and footers don't line up because content length varies. (seen live)
5. **Operational footers on every card:** "Picked by Qloo for your taste / Opening hours not verified" in mono on grey. Warnings come first, delight never.
6. **Disabled = grey ghost:** during loading the category buttons fade to 40% opacity with no spinner. It looks broken rather than busy. (seen live)
7. **Mobile header** takes ~40% of the first screen (notice bar + logo + big Google button + two-row menu) before any content. (seen live at 375 px)
8. **Native controls unstyled:** the city `<select>`, the `<details>` "What we verified", `confirm()` dialogs, and datalist autocomplete all look like the browser, not the brand.
9. Headings all come from the same family at similar sizes; there's no clear rhythm between page title, section and card.

## 2.1 Big improvements

1. **Make it look like travel, not a form.**
   - **Photos:** Qloo may return images for places. Check that they're available on the hackathon key before relying on them. Fallback: a branded illustrated "postcard" per category and city, never a blank box.
   - **City covers:** each city gets a cover with a big name, the local name (東京, Lisboa) and the stamp ring.
   - **A map** as a first-class view (free and keyless, e.g. MapLibre + OpenStreetMap tiles).
2. **Extend the passport metaphor everywhere:**
   - **Cities = visa pages:** opening a city "stamps" it.
   - **Saved places = stamps on your Passport:** the Passport fills up as you travel.
   - **Lists = trip folders** with a cover.
   - **Swap = "change ticket":** the old place is struck through and the new one is printed.
3. **A real design-token pass:** 2 radii (8 / 16), the docs/06 spacing scale only, mono only for true metadata (dates, codes), pink only for "selected / yours" and stamps, the amber third colour for "new / surprise".
4. **Buttons that look like buttons:** primary (filled ticket, single arrow) · secondary (outline) · icon buttons for card actions (♡ save, ✕ not for me, ↗ map) with visible labels on desktop · text links only inside sentences.
5. **Mobile-first shell:** slim top bar (logo + avatar), **bottom tab bar** (Explore · Swap · Passport · Saved), the data notice moved into the footer / "About".

## 2.3 UI elements to add or change

| Element | Change |
|---|---|
| Place card | Photo/illustration on top, name, one "why" line, 2–3 tag chips (cuisine first), price as €€, distance; icon actions in a fixed bottom row; equal heights |
| Category picker | Horizontal row of illustrated tiles (Restaurants, Bars, Museums, Hotels, Neighbourhoods) rather than grey boxes |
| City picker | Visual city cards (cover + name), replacing the dropdown |
| Toasts | Bottom-centre, with Undo / View actions |
| Save sheet | Bottom sheet on mobile, popover on desktop; lists with checkboxes + "＋ New list" |
| Skeleton cards | Animated placeholders while loading; controls stay usable |
| Empty states | Illustrated, with one next action |
| Confirm dialogs | Branded `<dialog>` (already used on the Passport page) replacing `confirm()` |
| Swap results | "Your pick → 3 alternatives", with the original card shown struck through |
| Active nav | Pink underline (fix F23) |
| Remove | Double arrow (F25), unclickable-looking city pills (F24) |

---

# 3. UX and interactions

## Current journey, as a new user lives it (seen live)
1. Home: a slogan, no example of what you get, three generic step cards. *What is this?*
2. Quiz or "sample profile". The sample lands on a dense Passport page full of forms and developer words.
3. Explore: Paris by default. Pick a category, wait behind a line of text, get 9 white boxes.
4. Tap "Yes, more like this": nothing visible happens (message is off screen).
5. Tap "Not for me": the card vanishes and the grid jumps. *Did I break it?*
6. Want to keep a place: you must sign in with Google first.
7. Swap is a separate tool whose purpose you must read about first.

Nothing is fun, and many taps give no visible response.

## 3.1 Fixes and improvements

**Clarity**
- Home shows a **live example** instead of a slogan: "Loves Khruangbin + Before Sunrise → in Lisbon: this bar, this museum, this street" as three real cards. One CTA: "Get my Passport · 3 min".
- Each page opens with one sentence and one obvious action. Explore needs no explanation if it opens straight on *your* city with cards.

**Flow**
- After the quiz: a **reveal moment** (Passport printed, stamped) → "Where are you going?" (city cards) → Explore opens on that city. One continuous path, no menu needed.
- Swap starts from any place card ("Find similar") and from a search box in Explore. The separate Swap page stays for "my booking fell through", with search-as-you-type.
- Remember city, category and scroll position when coming back.

**Feedback (rule: every tap answers within 100 ms, where your finger is)**
- Like → heart pops and fills; tap again to undo.
- Not for me → card slides away, toast "Hidden · Undo", the next pick slides in.
- Save → heart fills, toast "Saved to Lisbon trip · Change".
- Loading → skeleton cards in place, controls stay usable, the older request is cancelled.
- Swap it → short "printing ticket" animation, page scrolls to the results, heading focused.
- Errors → friendly toast with a retry button.

**Efficiency**
- Search-as-you-type for favourites and for Swap's starting place.
- Swipe on mobile cards: right = save, left = not for me (buttons remain for accessibility).

**Accessibility (keep what's good, fix the rest)**
- Keep `aria-pressed`, focus rings and reduced motion (already there).
- Toasts announced via `aria-live`; Undo reachable by keyboard; all motion off under `prefers-reduced-motion`.

## 3.2 Making it fun and entertaining

1. **Stamp collecting:** each city you explore and each place you save stamps your Passport with an animated ink stamp (thud + slight rotation). A "visa page" per city fills up. Pure delight, and it's the brand metaphor.
2. **Vibe meter:** each card shows a playful match ("Very you" / "Worth a try") based on how many of your signals point at it. It must not pretend to be a precise percentage.
3. **"Swipe the city" mode:** a quick stack of 10 places. Swipes train your votes, and at the end: "You're a *Late-night Lisbon* traveller".
4. **Traveller-type badges** that evolve with votes ("Slow Wanderer → Night Owl"), shown on the share card.
5. **Surprise envelope:** one sealed card per city: tap to open a wildcard pick with a reason.
6. **Micro-copy with personality:** "Not for me" → "Nah, next" · empty list "Nothing yet. Your passport is suspiciously clean." · loading "Asking locals with your taste…".
7. **Postcard share:** any saved list becomes a shareable postcard image (extends the existing PNG share card).
8. **Trip countdown:** for a dated trip, a small countdown and a checklist of saved places.

Keep fun optional and quick: animations ≤ 400 ms, never blocking, all off under reduced motion.

---

# 4. Suggested order of work

| Phase | What | Why first |
|---|---|---|
| A — Stop the breakage | F14 (Swap auto-search), F6/F7/F8 toasts + undo, F1/F2/F3 save sheet + guest saving, F25/F23/F24, F10, F15 | Users currently can't tell what happened, and lose work |
| B — Shell & tokens | Mobile bottom nav, button system, radii/spacing/colour pass, copy pass (F17, F22) | Everything after builds on it |
| C — Travel look | Place card redesign with images or illustrated fallback, city covers, map view, skeletons | Biggest perceived-quality jump |
| D — Journey | Home live example, post-quiz reveal → city → Explore, Swap from any card, detail sheet | Makes the product understandable |
| E — Delight | Stamps, vibe meter, swipe mode, surprise envelope, micro-copy | On top of a solid base |
| F — Features | Trip mode, filters, compare cities, shareable lists | After the core works |

Open questions before building: (1) Are Qloo images available on the hackathon key? (needs a quick live check). (2) Should guests save in the browser (recommended) or must saving stay account-only? (3) Is a map dependency acceptable (MapLibre + OSM tiles are free and keyless)?
