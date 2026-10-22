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
