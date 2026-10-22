# Glossary

Terms used in the product and in tickets. See docs/adr/ for the decisions behind them.

- **Taste Passport (Passport):** the user's taste profile. It is built by the quiz and refined by use (swaps, saves, "Not for me"). Always shown with its function the first time on a page.
- **Find its twin:** the core action. Starting from a place you wanted, find places that keep what you loved about it. The menu and tab are called **Swap**.
- **Twin:** a place returned by Find its twin.
- **Starting place:** the place the user wanted (full, closed, not quite right), the input of Find its twin.
- **Keep / Change:** the traits of the starting place the user wants to keep, or to avoid, in its twins.
- **City page:** `/[city]`, with the tabs **For you** (picks for this city) and **Swap**.
- **Place page:** `/[city]/[place]`, everything about one place. A bottom sheet on mobile.
- **Saved / trip:** saved places, grouped per city as "{City} trip".
- **Stamp:** a mark added to the Passport for each city opened and place saved.
- **Learned from you:** what the Passport picked up from use, shown in the Passport and undoable.
- **Not for me:** hides a place and teaches the Passport.

Avoid: entity, signal, visa, candidates, resolve, "Qloo" in user-facing copy (except the single data credit in the footer).
