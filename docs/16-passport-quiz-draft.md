# Passport quiz — draft v0 (for review)

Replaces the current "pick 5 signals" Passport. 12 questions, ~2 minutes, one question per screen, every question skippable, progress bar always visible. Visuals: emoji / simple illustrations only.

Reference: [Klook "The Best You"](https://www.experiencethebestyou.com/en-GB/) (see `docs/04-design-direction-research.md`): one question per screen, draggable cards, a suitcase to fill. Keep the mechanics, not the look: no holographic purple passport, no mascot. Unlike Klook, the result is not a fixed personality type: it is a living Passport the user can edit.

## Formats

| Code | Format | Interaction |
|---|---|---|
| SW | Swipe yes/no | One card at a time; right = yes, left = no, up = skip. Buttons too (accessibility). |
| TO | This or that | Two cards side by side; tap one (or swipe toward it). |
| P3 | Pick up to 3 | Grid of 6–9 emoji tiles; choose 1–3. |
| SL | Slider | One axis between two labelled ends, 5 stops. |

## Outputs of each answer

Every answer writes to two places:
- **Qloo signals** — named entities or tags that the Swap sends to Qloo (artists, films, place types). Exact entity IDs must be looked up with Qloo search before build; names below are candidates, not verified IDs.
- **Profile traits** — short plain-language facts kept for Claude (e.g. `pace: slow`, `crowds: avoids`).

## Questions

### Travel (4)

1. **SL — Your ideal day abroad** · "Every hour planned 🗓️" ↔ "Wake up and see 🎲"
   → trait `planning: 1–5`.
2. **TO — Where do you wake up?** · 🏙️ "Tiny flat above a market" vs 🌿 "Quiet guesthouse out of town"
   → trait `base: central | remote`; place-type hint.
3. **SL — Crowds** · "Love the buzz 🎉" ↔ "Empty streets only 🤫"
   → trait `crowds: 1–5`; can down-weight very popular places in Swaps.
4. **SL — Spend** · "Street food & hostels 🎒" ↔ "Treat myself 🥂"
   → trait `budget: 1–5`; price level of suggested places.

### Taste (5)

5. **SW — Music** (4 cards: artist + genre emoji, e.g. Khruangbin, Nina Simone, Daft Punk, Bad Bunny)
   → each "yes" = Qloo artist signal; trait `music_likes`.
6. **SW — Films** (4 cards: Before Sunrise, In the Mood for Love, Amélie, Mad Max: Fury Road)
   → each "yes" = Qloo movie signal.
7. **TO — Dinner** · 🍜 "Plastic stool, best noodles in town" vs 🍷 "Natural wine bar, small plates"
   → place-type signal; trait `food_style`.
8. **P3 — What you'd walk into** · 📚 bookstore · 🖼️ small gallery · 🛍️ vintage shop · 🎷 jazz club · 🌳 park · 🏛️ big museum · ☕ café · 🍺 brewery
   → place-type signals (reuses current signals: independent bookstores, small art galleries, neighbourhood cafés).
9. **TO — Two playlists for the trip** · "List A: soul, jazz, bossa nova" vs "List B: electronic, indie, hip-hop"
   → genre signals; trait `music_mood`.

### Imagination (3)

10. **P3 — Your backpack for one week** · 📷 film camera · 📖 novel · 🎧 headphones · 🥾 hiking boots · 👗 a nice outfit · 🗺️ paper map · 🧴 sunscreen · 📓 sketchbook
    → traits only (`creative`, `outdoors`, `nightlife`, `analog`…); maps to place-type hints.
11. **TO — You can only leave with…** · 🎧 "Your headphones" vs 📚 "One book"
    → trait `sound_vs_story`; light weight toward music or literary places.
12. **SW — Would you do it?** (3 cards: "Ask a local where they eat", "Get lost on purpose", "Join a stranger's party")
    → trait `openness: 0–3`; how far Swaps can stray from the original place.

Mix: 3 SL, 4 TO, 2 P3, 3 SW blocks (11 cards in total for the SW questions).

## End screen

"Your Passport" card: 3–5 top signals + 3 one-line traits ("Slow mornings, soul records, places without a queue"). Buttons: Save · Redo quiz · Start a Swap.

## Open points for review

- Card examples in 5 and 6 are placeholders: pick ones your audience will recognise.
- Should results feed the share card (E07)?
- Should a signed-in user be able to redo only one section?
- Passports already saved in the old format: convert or ask to redo the quiz?
