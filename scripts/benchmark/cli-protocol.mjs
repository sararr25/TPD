import { validateItems } from "./core.mjs";
// CLI diagnostic errors/warnings are not model tool calls.
const NON_TOOL_ITEMS = new Set(["agent_message", "reasoning", "error"]);
export function isToolEvent(event) {
  return !!event?.item && !NON_TOOL_ITEMS.has(event.item.type);
}
export function parseCliResponse(raw) {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*\n([\s\S]*?)\n```$/i, "$1");
  const parsed = JSON.parse(cleaned);
  return validateItems(parsed?.items);
}
export function auditCliEvents(raw) {
  const events = raw.trim().split("\n").filter(Boolean).map(line => JSON.parse(line));
  if (!events.some(e => e.type === "turn.completed")) throw Error("CLI turn did not complete");
  if (events.some(e => e.type === "turn.failed" || e.type === "error")) throw Error("CLI turn failed");
  if (events.some(isToolEvent)) throw Error("CLI used an external tool");
  if (!events.some(e => e.type === "item.completed" && e.item?.type === "agent_message")) throw Error("No final model message observed");
  return { observedToolCalls: 0 };
}
