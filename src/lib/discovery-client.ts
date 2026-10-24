import type { Entity } from "./discovery";
export type Selection = { entity: Entity; token: string };
export const MESSAGES: Record<string, string> = {
  quota:
    "We’ve hit our daily limit for searches. Try again later; your Passport is still here.",
  rate_limited:
    "You have made a lot of searches in a short time. Wait about ten minutes and try again; your Passport is still here.",
  busy: "We’re busy right now. Try again in a moment.",
  not_configured: "Search isn’t available right now. Please try again later.",
  provider_unavailable:
    "We couldn’t load places right now. Your choices are still here; try again.",
  provider_access:
    "We can’t load places right now. Your Passport is still here; try again later.",
  expired_selection:
    "Your Passport needs a refresh. Pick your favourites again to see picks for you.",
  invalid_selection:
    "We couldn’t use that saved favourite. Search for it and pick it again.",
  invalid_category: "Choose restaurants or museums.",
  invalid_reference: "Pick a place in that city and category.",
  invalid_city: "Choose one of the listed cities.",
  invalid_feedback: "Your feedback could not be saved. Please try again.",
  invalid_budget: "You can choose a price range for restaurants only.",
  invalid_passport: "Choose 3–5 different favourites in your Passport first.",
  location_unconfirmed:
    "We couldn’t confirm the city, so we didn’t widen your search.",
  signed_out: "Your session has ended. Sign in again to use your account.",
  invalid_collection: "Give the list a name (up to 60 characters) and keep the note under 280 characters.",
  collection_limit: "You’ve reached a saved-list limit. Remove a place or a list before adding more.",
  hidden_limit: "You have hidden 100 places. Open Settings & privacy in your Passport and show some again first.",
  invalid_quiz: "Your quiz answers could not be saved. Take the quiz again.",
  quiz_unresolved:
    "We couldn’t match one of your picks. Try again, or search for your favourites instead.",
  guest_unresolved:
    "We couldn’t load that example Passport. Search for your favourites instead.",
};
export async function discovery<T>(
  body: object,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch("/api/discovery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new Error(
      "We couldn’t connect. Your choices are still here; check your connection and try again.",
    );
  }
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      MESSAGES[data.error] ||
        "We couldn’t complete this search. Please try again.",
    );
  return data as T;
}
export function readSelections(raw: string | null): Selection[] {
  try {
    const a = JSON.parse(raw || "null");
    if (!Array.isArray(a)) return [];
    const seen = new Set();
    return a
      .filter(
        (s: Selection) =>
          s &&
          s.entity &&
          typeof s.entity.id === "string" &&
          typeof s.entity.name === "string" &&
          s.entity.name.length <= 200 &&
          typeof s.token === "string" &&
          s.token.length <= 20000 &&
          !seen.has(s.entity.id) &&
          !!seen.add(s.entity.id),
      )
      .slice(0, 5);
  } catch {
    return [];
  }
}

// UX hint only: server signature verification remains authoritative.
export function selectionExpired(s: Selection, now = Date.now()): boolean {
  try {
    const body = s.token.split(".")[0].replace(/-/g, "+").replace(/_/g, "/");
    const expires = JSON.parse(atob(body)).expires;
    return typeof expires === "number" && expires < now;
  } catch { return false; }
}
