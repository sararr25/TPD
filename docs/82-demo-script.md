# 90-second demo script — 29 October 2026

Ticket #104 (programme #93). Draft for the owner to rehearse on the live site; not yet timed on a real run.

## Before you start

- Use a fresh browser profile (no Passport), on the production alias.
- Open Lisbon once beforehand so photos are cached.
- The per-visitor budget is 15 place searches per 10 minutes. Example mode spends 2 per category view: open at most Restaurants and one other category, and don't reload repeatedly.
- Fallback if the provider is slow or rate-limited: show the screenshots of the example page and the Pastéis de Belém Twin.

## Script

| Time | Screen | Say | Do |
|---|---|---|---|
| 0:00 | Home | "Travel apps ask what you want to eat. Beesyde starts from what you love: music, films, books." | Point at the cover and the example Passport card. |
| 0:12 | Home → Lisbon example | "Here is someone who loves Khruangbin, Nina Simone and Before Sunrise." | Click **See Lisbon through this Passport**. |
| 0:22 | Lisbon, example | "Every pick says which favourite it comes from. Qloo ranks places once per favourite; if none returns a place, we show no reason instead of inventing one." | Scroll two cards; point at "Because they love …". |
| 0:40 | Card → Twin | "Now the real problem: the place you wanted is full." | On Pastéis de Belém, click **Find its twin**. |
| 0:50 | Twin | "Keep what you loved, delete what you didn't. Same taste, another address." | Keep one trait, run the search, show the featured twin. |
| 1:10 | How it works | "Taste from Qloo, address checks from OpenStreetMap — and we say what we don't claim: no live hours, no bookings." | Footer → **How it works**. |
| 1:25 | Close | "Your taste, your next place." | Click **Make your Passport** to show the quiz opening. |

## Verified facts behind the claims

- Example reasons: implemented in 9d56328 (#94), 9/9 Lisbon restaurant cards credited locally on 29 October.
- Pastéis de Belém Twin: three real results on production, docs/81.
- Limits wording: `/how-it-works`, matches README and docs/81.
- In example mode Pastéis de Belém may not be among the picks; reach it from the plain Lisbon list (Popular picks) if needed.
