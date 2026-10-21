# 24 — Structure & experience reset (21 Oct 2026)

docs/22 and docs/23 list detail fixes. This doc goes one step back: **is the site built around the right pages and the right journey?** Answer: no. Fixing cards and buttons will not save it, because the problem is the skeleton.

Method: ux-pro (IA, flows, interaction cost), ui-pro (hierarchy, consistency), ui-ux-pro-max (product/style match). Evidence: live walk-through on 21 Oct (docs/23) + the product brief (docs/00).

> Note: the ui-ux-pro-max `--design-system` generator suggested an "App Store landing, dark OLED, pink + cyan" system. It doesn't fit (Beesyde is a web product with no app to download), so I didn't use it.

---

## 1. The diagnosis in one paragraph

The brief says the product is **"Keep what you love. Change what doesn't work."**: start from a place you wanted, get alternatives that keep its soul. The site instead is **four separate tools of equal weight** (Explore, Taste Passport, Swap a place, Collections). Before any of them works you have to pass a **profile gate** (quiz or favourites). There is **no page for a city** and **no page for a place**, so nothing connects: you can't go from a place to "similar ones", from a city to its swaps, or from your Passport to what it found. Each page explains itself with a slogan and a form because none of them has a clear job. That is why every page feels broken: **it's a set of forms, not a journey.**

## 2. Page-by-page structural check

| Page | Job it should do | What it does today | Verdict |
|---|---|---|---|
| **Home** `/` | In 5 seconds: "what is this, and what's in it for me?" Start the journey. | Slogan + passport illustration + 3 "step" cards + city pills + 2 CTAs (quiz / sample). Shows no real place. City pills lead to the Explore gate. | 🔴 Doesn't show the product; 2 competing entrances, both into a form |
| **Taste Passport** `/passport` | Light, optional profile that improves results. | One 598-line component doing 5 jobs: quiz (18 questions), favourites search, guest "borrow a Passport", profile view, share card. The sample link lands on quiz Q1. | 🔴 Overloaded, and positioned as a **mandatory gate** instead of an enhancer |
| **Explore** `/explore` | "Show me *this city* for me." | Without a profile: a blocking card. With a profile: city select + 5 category buttons + a grid of text cards. No city identity, no map, no place detail. | 🔴 Dead end for newcomers; with a profile it's a list, not a city |
| **Swap a place** `/swap` | **The core promise**: "my place is full/wrong, give me one that keeps what I loved." | A separate menu item, 3rd of 4. A two-step form (type a name → pick what to keep) with an empty second column. Only restaurants + museums. Not reachable from any place. | 🔴 The heart of the product is hidden as a secondary tool |
| **Collections** `/collections` | "My trip": what I've saved, per city. | Lists of text rows plus a sign-in pitch. No link back to the city, no map, no order. | 🟠 Works, but is a storage drawer, not a trip |
| **Place** (missing) | Everything about one place + "find similar". | Doesn't exist. Cards are dead ends; "Map" leaves the site. | 🔴 Missing the object the whole product is about |
| **City** (missing) | The destination: identity, picks for you, map, swaps. | Doesn't exist; the city is a dropdown value. | 🔴 Missing the travel context |

### Navigation
- Top nav = 4 tools with equal weight, and the loudest element is "Sign in with Google". The nav describes **features**, not **user goals** (ux-pro §5: focused navigation, user language).
- "Taste Passport" and "Swap a place" are brand terms a newcomer can't decode.
- Front doors fail (ux-pro §5): someone landing directly on `/explore` or `/swap` gets no orientation and no content.

### Journey today (interaction cost)
New user who wants "a bar in Lisbon I'd like":
Home → Take the quiz → 18 questions → Passport page → Explore → change city select → Bars → read cards → Save → name a list.
**≈ 25 taps, 4 pages, 3+ minutes before the first result.** The value arrives last.

## 3. Root causes

1. **Gate before value**: the profile is required up front, so the first minute is all effort and no reward (ux-pro §6, lazy registration).
2. **Features as pages**: the IA mirrors the API (discovery, quiz, passport, collections), not the trip.
3. **No core objects**: City and Place don't exist as pages, so there's nothing to link between, and every page reinvents a form.
4. **The core promise is buried**: Swap is the differentiator but lives behind a menu item.
5. **No visual concept for content**: the brand (passport, stamps) lives only on the Home illustration; content pages are generic white boxes, so the look can't be fixed card by card.

## 4. Proposed structure

### Sitemap
```
/                     Home: "Where are you going?" + live example + Swap search
/[city]               City page (the hub)
   ├─ For you         picks per category (works without a profile, better with one)
   ├─ Map             same picks on a map
   └─ Swap            "Had a place in mind? Find its twin"
/place/[id]           Place page: photo, why it fits you, tags, map, Save,
                      ★ "Find similar here" (= Swap, pre-filled)
/passport             Your taste: optional, editable any time, stamps of
                      cities/places you saved, share card
/trips (Saved)        Saved places grouped by city/trip, map, share
```
Quiz and favourites become **one onboarding sheet** that opens from anywhere ("Make it yours · 3 min"), not a page you must pass.

### Navigation
- Desktop: logo · city switcher · **Saved** · **Passport** (avatar). Swap is no longer a nav item: it's on every city and place.
- Mobile: bottom bar **Explore · Saved · Passport**, slim top bar with the city switcher.
- Sign-in asked in context (3rd save, or "use on other devices"), never the loudest header element.

### Core journeys after the reset
1. **"I'm going to Lisbon"**: Home → tap Lisbon → city page with picks and photos. **1 tap to value.** A banner offers "Make it yours"; votes on cards teach your taste even without the quiz.
2. **"My restaurant is full"** (the core promise): Home or city → Swap search → pick the place → 3 twins with "kept: cosy, natural wine · changed: less touristy". **≤ 3 taps.** Also reachable from any place page via "Find similar".
3. **"Plan my trip"**: save from cards (one tap, into "Lisbon trip") → Saved shows the trip on a map → share.
4. **"Make it mine"**: onboarding sheet (favourites first, quiz optional) → results re-rank live → Passport gets its first stamp.

## 5. Visual concept to rebuild on (not card-level tweaks)

One idea applied to every page: **"a travel journal with a passport."**
- **City page = a visa page**: big city name + local name, cover photo, stamp ring, then the picks.
- **Place = a postcard**: photo first, name, one "why it fits you" line, small tags. Same shape everywhere (grid, map popup, Saved, Swap results).
- **Swap = a changed ticket**: the original place struck through, the twins printed beside it with "kept / changed".
- **Passport = stamps that fill up** as you save and explore.
- **Tokens**: keep the current fonts (Familjen Grotesk + Martian Mono), mono only for metadata; pink only for "yours / stamped"; 2 radii (8/16); 4-px spacing; photos carry the colour, the UI stays neutral (paper background, ink text).
- Light theme only for now; contrast ≥ 4.5:1; touch targets ≥ 44 px; skeletons instead of faded controls; motion ≤ 300 ms, off with reduced motion.

## 6. What happens to today's pages

| Today | After |
|---|---|
| Home | Rebuilt: city picker + live example + Swap search |
| /explore | Becomes `/[city]` (For you / Map / Swap) |
| /swap | Folded into city and place pages; `/swap` redirects |
| /passport | Split: onboarding sheet (quiz + favourites + sample) and a light profile page |
| /collections | Renamed Saved / trips, with map and links back to places |
| — | New: `/place/[id]` |

Logic that stays: Qloo discovery, Swap ranking, feedback votes, saving (guest + account), share card. **This is mostly a front-end restructure**; the APIs stay. Exception: Explore without a profile needs a "generic city picks" mode in the discovery service (to check).

## 7. Suggested order
1. **Grey wireframes** for Home, City, Place, Saved and the onboarding sheet. Check the 4 journeys with a 5-person hallway test before any styling (ux-pro §7).
2. Place card + Place page (the shared object).
3. City page with "For you" working **without** a profile.
4. Swap inside City/Place.
5. Onboarding sheet replacing the Passport gate.
6. Visual concept pass (tokens, visa/postcard/ticket).
7. Saved + map, then delight (stamps).
