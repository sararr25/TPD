# Handover — 22 October 2026 (UI/UX reset)

Continues `docs/25-handover.md`. This session reviewed the whole UI, UX and copy, turned the findings into a spec and tickets, decided the structural and visual questions with the owner, and shipped the first fixes and the new visual foundation.

## Where things are

- **Branch:** `claude/clever-brown-c2n03l`, PR **sararr25/TPD#35** into `claude/blissful-gauss-dymbeo`. All checks green, mergeable, **not merged yet**. The Vercel preview is behind Vercel auth. Use the Vercel MCP `get_access_to_vercel_url` to get a share link.
- **Spec and tickets:** spec issue **#3**, with sub-issues **#4–#34**. Blocking edges are GitHub-native dependencies. Labels: `ready-for-agent` and `ready-for-human`.
- **Decisions:** `docs/adr/0001`–`0004` and `GLOSSARY.md`. These are binding for every remaining ticket; read them before touching UI.
- **Agent skills:** `mattpocock/skills` are committed under `.agents/skills/` (symlinked in `.claude/skills/`), so cloud sessions have `/to-spec`, `/to-tickets`, `/loop-me`, `/grilling`, `/triage` and `/handoff`. Tracker config is in `docs/agents/`. In cloud sessions, `gh` GraphQL is blocked: use `gh api` (REST) or the GitHub MCP tools.
- **Owner rules still in force (docs/25):** mockups go only in chat or private artifacts, never in the repo. Split work across subagents: Haiku for mechanical work, Sonnet for normal coding, Opus for design.

## Done in this session (all in PR #35)

| Ticket | What |
|---|---|
| #3 | Spec: full UI/UX/copy review, with 31 sub-issues |
| #4–#7 | Decided with the owner through `/loop-me` and closed. See ADR 0001–0004. |
| #8 | "Find its twin" on a card opens Swap with that place already selected (`?q&category&ref`) |
| #11 | `/explore` is a page listing every city |
| #12 | The mobile header fits at 375 px; sign-in is a small link |
| #14 | Swap results use the shared `PlaceCard`; developer text is gone |
| #16 | ♡ saves in one tap into "{City} trip", with a toast offering Undo and Change |
| #17 | Deleting a list uses the site dialog instead of `confirm()` |
| #18 | **Partly done:** logo-like photos and bars with no kitchen tag are filtered |
| #19 | Developer jargon and duplicate disclaimers removed |
| #25 | Oltremare tokens (`src/styles/tokens.css`), Instrument Serif thickened 0.025em + Hanken Grotesk via `next/font`, one button and one toggle system, CSS split by component |

Also: the `git-guardrails-claude-code` skill was removed (Codex found it fails open). Fonts were picked over 3 private artifact rounds; the result is in ADR 0004.

## Verified

- `npm run typecheck`, `npm test` (now including `check-saved` and `check-photo-tags`) and `npm run build` pass. The build needs placeholder `NEON_AUTH_*` env values when there is no `.env.local`.
- Vercel preview with live data and the guest Passport: Home, Lisbon (cards, map, toasts), Swap ("Find its twin" → auto-selected → 3 twins) and Passport render in the new style. No horizontal scroll at 390 px.

## Not done / known problems

- **#18 still open:** Pensão Amor (a bar) comes back as a restaurant twin with a "Sushi" chip, and "Rua nova do Carvalho" (a street) is returned as a restaurant in Lisbon. The next step is to dump those entities' tags with a live key and write the rule from them.
- **Layouts are unchanged.** Swap still has the old big hero, the city `<select>` and the two-column form. The fake "For you / Swap" toggle on the city page is still there (#9).
- **Not rendered or checked:** the passport-card PNG after the colour change, the quiz profile ("pp") page, and the save sheet's "Change" flow.
- **No per-city accent values yet:** only the `--city-accent` hook exists.
- `design-mockups/tokens.css` still has the old values. The app doesn't import it, but `A4-product-prototype.html` does.
- Several decisions changed tickets written before them: #22 was rewritten (the quiz stays the way in, and the Passport learns from use); #9, #13 and #24 have update comments. Read each issue's comments, not only its body.

## Plan for the next steps

🔑 = needs the owner.

| # | Step | Why | Blocked by |
|---|---|---|---|
| 1 🔑 | Review and merge PR #35 | Everything below builds on it | — |
| 2 | #9, #10, #13 (city tab, Swap without a Passport, honest quiz promise) | Small, unblocked fixes left from the first batch | — |
| 3 | #20 Place page, then #21 Swap inside city and place | The structure the redesign sits on (ADR 0001) | #6 (done), #8 (done) |
| 4 | #26 New direction on every page, #27 City page, #28 Saved | The redesign | #20, #21, #25 |
| 5 | #22 Quiz from anywhere + learning Passport, #23 profile/settings split, #24 tab bar | ADR 0002 and ADR 0001 | #7 (done) |
| 6 | #29 Copy rewrite in the decided voice | After the structure settles | #20–#22 |
| 7 | #30–#34 Home demo, filters, stamps, share a trip, empty states | Extras | as listed in each issue |
| 8 | Finish #18 with live tag data | Data trust | live Qloo key |

## Suggested skills for the next session

- `/to-tickets` or `/triage` to re-slice or re-label issues.
- `/grilling` or `/loop-me` for any new product decision; record the answer as an ADR (`domain-modeling`).
- `/tdd` for the discovery-service changes (#10, #18).
- `/code-review` before pushing.
- `/handoff` at the end of the session.
