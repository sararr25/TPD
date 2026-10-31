# Handover — mobile polish before submission, 30–31 Oct 2026

Branch: `claude/blissful-gauss-dymbeo` (release, auto-deploys to https://beesyde.vercel.app). Read after [docs/86](86-handover-hackathon-submission.md).

## Why this round existed

The owner asked for a full UI/UX, functionality and Qloo-usage check on web and mobile before the Qloo hackathon deadline (**31 Oct 2026, 04:45 Italian time**), then reported that the mobile Passport looked like two separate levels and asked for every remaining fix to go live.

## What changed (all live and verified on production at 375 px)

- `24e7771` Twin: when no trait is marked Keep, the match sentence explains that it follows the place's overall profile (`sharedSentence` in `src/components/swap-workspace.tsx`).
- `3c307fb`:
  - Mobile Passport is one card: cover and visa page joined with a dashed fold, offset sheets hidden, empty top space removed (`src/styles/home.css`, `@media (max-width:760px)`).
  - City map no longer pushed down 96 px under 850 px (`src/styles/city.css`, `.city-map-wrap` `top:0`).
  - Category chip row aligns with the page gutter (`scroll-padding-inline`).
  - `/saved` → `/collections` and `/twin` → `/swap` redirects (`next.config.ts`).
  - Favourite search results hide a subtitle that repeats the name (no raw `urn:` type) and each Add button has a distinct accessible name (`src/components/passport-builder.tsx`).
- `.claude/launch.json`: adds a `beesyde-dev` preview entry on port 3219 (local tooling only).

## Verified

Typecheck passes, `npm test` 0 FAIL, local `npm run build` passes, Vercel deploy READY. Live: New York lists and map, Twin from Katz's (Crif Dogs, Russ & Daughters), full quiz on mobile, Qloo favourite search, personalised Lisbon picks ("shaped by Nina Simone · Khruangbin"), no horizontal scroll on any main page.

## Local build note

A failed `next/font/google` fetch was cached in `.next`, so every later local build failed with "next/font/google queries have exactly one entry". It was not network and not the code. Fix: `rm -rf .next && npm run build`.

## Open / known

- Prices show € in every city: intentional, € marks Qloo's 1–4 price tier.
- One unidentified 404 in the Lisbon page console; map works.
- Twin takes ~15–20 s and home examples a few seconds (Qloo latency).
- Only tested in an emulated 375 px viewport, not on a physical phone.
- No agent/MCP in the submission (owner decision, see docs/86) remains an eligibility risk.
- The Devpost submission itself is the owner's to make before the deadline.
