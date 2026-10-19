# Product structure design (Qloo Agentic Hackathon 2026)

**Date:** 2026-10-19 · **Status:** approved in brainstorming · **Product name:** Beesyde
**Builds on:** `DECISIONS.md`, `docs/02-b2c-product-structure.md`

## 1. Scope

All of the following ship for the demo (no feature is optional):

- **Taste Passport**: 3–5 taste signals (artists/music, movies/TV/books, loved places).
- **Swap**: replace a specific place with taste-matched alternatives in the same city.
- **Explore ("I'm here")**: discovery in the current city from the Passport alone.
- **Transfer**: the same taste applied to another category after a result.
- **Discovery**: alternative destinations, from a loved city (with Keep/Change chips) **or** from the Passport alone. The reference city is optional.
- **Login and collections.**

Scope risk is accepted. It is mitigated by one shared pipeline (section 2): flows differ only in their inputs.

## 2. Architecture

**Stack:** Next.js + TypeScript on Vercel · Neon Postgres · Neon Auth with Google sign-in. The Qloo key lives only in server routes (`QLOO_API_KEY` in `.env`).

**Single pipeline:**

```
Input → Intent → Qloo query → Verification → 3 cards (Closest cultural · Best practical · Unexpected but relevant)
```

| Flow | Reference | Qloo type | Constraint |
|---|---|---|---|
| Swap | a place | place, same category | same city |
| Explore | none (Passport only) | place | current city |
| Transfer | last result + Passport | place, different category | same city |
| Discovery | loved city (optional) | destination | none, or a region |

**Intent resolution:** the home screen has one field. A recognized place means Swap. A recognized city means Discovery. An empty field with location on means Explore. Three small buttons below the field (Replace · I'm here · Where to go) force the intent manually. Transfer is offered after every result set.

**Modules** (each with one entry point):

- `qloo/`: the only Qloo access point. HTTP to `hackathon.api.qloo.com`, using `/v2/insights`, `/search` and `/v2/tags`. It checks that the sent parameters are reflected in each response, because Qloo silently ignores invalid parameters.
- `verify/`: Google Places, Ticketmaster and Viator, selected through the country × category → provider registry. It assigns verification levels L0–L3.
- `intent/`: classifies the input and maps it to pipeline parameters.
- `passport/`: signals, exclusions and feedback. It stores locally for guests and in Neon for users.
- `db/`: Neon access.

## 3. Screens (mobile-first)

1. **Landing**: promise, "Create your Passport" or "Try as guest" (2–3 prefilled profiles).
2. **Passport builder**: entity search, 3–5 picks, live taste-card preview. Without an account it is stored locally.
3. **Home**: single "What are you looking for?" field, three small mode buttons, last search, collections.
4. **Reference + Keep/Change**: recognized place or city card, 4–6 chips (Keep / Change / Ignore) built from Qloo tags, hard constraints (city, budget). If the reference is ambiguous, the app asks the user to confirm.
5. **Results**: three role cards, map, "Qloo vs LLM" toggle, Transfer prompt.
6. **Detail**: Why it matches you · What's different · What we verified (L0–L3), map/directions, Save, thumbs up/down feedback.
7. **Collections**: grouped by trip.
8. **Passport card**: shareable image.
9. **States**: loading, no results, low-coverage city, quota exhausted, error. Errors are shown explicitly, with no silent fallbacks.

Login is requested on the first Save or Share. The local Passport is migrated to the account.

## 4. Data (Neon)

| Table | Content |
|---|---|
| `users` | managed by Neon Auth |
| `passports` | user_id, signals (entities, tags), exclusions, feedback |
| `collections`, `collection_items` | name; place ID, note, created_at |
| `qloo_cache` | query hash → response, with expiry; private and never committed |
| `benchmark_cases` | precomputed Qloo vs LLM cases |

No permanent copy of Qloo data is kept, only the cache with expiry, per the hackathon rules.

## 5. Testing

- Unit tests: Qloo adapter (request building, parameter echo check), intent classification.
- End-to-end test: guest path Passport → Swap → Transfer.
- Manual check of each flow on the deployed URL before submission.

## 6. Still open

- Visual identity (name decided: Beesyde).
- Final demo cities, chosen after the Qloo verification queries.
- Quota and rate limits of the key.
