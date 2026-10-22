import type { Entity } from "./discovery";
export type Selection = { entity: Entity; token: string };
export const MESSAGES: Record<string, string> = {
  quota:
    "The discovery service has reached its limit. Try again later; your Passport is still here.",
  rate_limited:
    "You have made a lot of searches in a short time. Wait about ten minutes and try again; your Passport is still here.",
  busy: "A few discoveries are in progress. Try again in a moment.",
  not_configured: "Discovery is not configured on this server yet.",
  provider_unavailable:
    "Qloo did not respond. Your choices are still here; try again.",
  provider_access:
    "The provider connection needs attention. Your Passport is still here.",
  expired_selection:
    "Your Passport needs a refresh. Pick your favourites again to see picks for you.",
  invalid_selection:
    "A saved selection could not be validated. Search for and select it again.",
  invalid_category: "Choose restaurants or museums.",
  invalid_reference: "Choose a reference in the selected category and city.",
  invalid_city: "Choose one of the listed cities.",
  invalid_feedback: "Your feedback could not be saved. Please try again.",
  invalid_budget: "Price tiers are only available for restaurant searches.",
  invalid_passport: "Choose 3–5 different favourites in your Passport first.",
  location_unconfirmed:
    "The provider did not confirm the city. We have not widened your search.",
  signed_out: "Your session has ended. Sign in again to use your account.",
  invalid_collection: "Give the collection a name (up to 60 characters) and keep the note under 280.",
  collection_limit: "This collection, or your account, is full. Remove something first.",
  hidden_limit: "You have hidden 100 places. Show some again on your Passport page first.",
  invalid_quiz: "Your quiz answers could not be saved. Take the quiz again.",
  quiz_unresolved:
    "Qloo could not confirm one of your picks. Try again, or search for your favourites instead.",
  guest_unresolved:
    "The guest profile could not be resolved unambiguously. Please search for your favourites instead.",
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
      "The server could not be reached. Your choices are still here.",
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
