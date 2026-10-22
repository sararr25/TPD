import "server-only";
import { DiscoveryError } from "./qloo.ts";

// Qloo vs LLM demo (docs/20 D6): the same favourites asked of a general
// chat model. Pollinations needs no key; it has no uptime guarantee and
// the model behind "openai" may change, so the page labels it generically.
// gen.pollinations.ai asks server requests for a key; this legacy endpoint does not.
const ENDPOINT = "https://text.pollinations.ai/openai";
const TIMEOUT_MS = 30000;

export type LlmPick = { name: string; why: string };

export async function askLlm(favourites: string[], city: string, category: string): Promise<LlmPick[]> {
  const prompt =
    `Someone loves ${favourites.join(", ")}. Recommend exactly 3 real ${category}s in ${city} for them. ` +
    `Answer only with JSON: {"picks":[{"name":"...","why":"one short sentence"}]}`;
  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "openai", messages: [{ role: "user", content: prompt }] }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    console.error("[llm] request failed", error);
    throw new DiscoveryError("llm_unavailable", 503);
  }
  if (!response.ok) {
    console.error("[llm] status", response.status);
    throw new DiscoveryError(response.status === 429 ? "llm_busy" : "llm_unavailable", 503);
  }
  const data = await response.json();
  const content: unknown = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new DiscoveryError("llm_unavailable", 503);
  return parsePicks(content);
}

// The model sometimes wraps JSON in a code fence; anything else is an error.
export function parsePicks(content: string): LlmPick[] {
  const start = content.indexOf("{"),
    end = content.lastIndexOf("}");
  let parsed: unknown;
  try {
    parsed = JSON.parse(content.slice(start, end + 1));
  } catch {
    throw new DiscoveryError("llm_unreadable", 502);
  }
  const picks = (parsed as { picks?: unknown })?.picks;
  if (!Array.isArray(picks)) throw new DiscoveryError("llm_unreadable", 502);
  const valid = picks
    .filter((p): p is LlmPick => typeof p?.name === "string" && typeof p?.why === "string" && p.name.length <= 120)
    .map((p) => ({ name: p.name, why: p.why.slice(0, 240) }))
    .slice(0, 3);
  if (!valid.length) throw new DiscoveryError("llm_unreadable", 502);
  return valid;
}
