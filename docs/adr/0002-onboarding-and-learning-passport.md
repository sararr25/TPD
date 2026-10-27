# 0002 — Onboarding: the quiz builds the Passport, use refines it

Status: accepted, 22 Oct 2026 (owner, `/loop-me` session for #7). Spec: #3.

## Decision

- **The 18-question quiz stays the way in.** It creates the Taste Passport. The Home and the Passport page must say it takes about 3 minutes; the "about a minute" promise goes.
- **The Passport learns over time.** Swaps, saves (♡) and "Not for me" (✕) refine it, building on the existing feedback votes.
- **The learning is visible in three ways:**
  1. a "Learned from you" section in the Passport ("You keep choosing: natural wine, small rooms"), where each item can be undone;
  2. a toast when a taste becomes strong ("Your Passport learned: you like quiet places");
  3. stamps: each city opened and each place saved adds a stamp to the Passport.
- At the end of the quiz, the user is invited to sign in to keep the Passport across devices.

## Consequences

- #22 changes. It is no longer a "3 favourites, quiz optional" panel. It is about where the quiz opens from (any page) and returning to the same state afterwards.
- #23 (profile vs settings) keeps "Learned from you" in the profile, where it is visible, and the undo controls in settings.
- #32 (stamps) is confirmed.

## Amendment — 27 Oct 2026: Passport displays; settings manages quiz

Owner clarified that the Passport is primarily the resulting taste profile and
actual visited-city stamps, not an invitation to repeat the quiz. Returning
visitors change the quiz from Settings & privacy. The Passport retains a focused
Add what you love action for favourite artists, films, books and places; that
editor does not offer retaking the quiz. First-time Passport creation remains
available for visitors who have not completed the quiz.

## Amendment — 27 Oct 2026: unfinished quiz recovery

Owner approved the UI/UX audit and urgent quiz corrections. All quiz entry
points use the shared native dialog. Unfinished answers are a separate,
browser-only draft per guest/account, with explicit Continue your quiz or
Start again and a seven-day restore window. Drafts do not steer discovery,
replace the saved Passport or migrate implicitly between owners. Successful
completion and the corresponding data deletion clear the draft. Browser mute
preference persists separately; resume does not play a start sound. See
the local implementation receipt in docs/64.
