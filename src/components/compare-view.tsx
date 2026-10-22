"use client";
import { useState } from "react";
import { CITIES, type Entity } from "@/lib/discovery";
import { discovery, type Selection } from "@/lib/discovery-client";

type LlmPick = { name: string; why: string };
type Side<T> = { status: "idle" | "loading" | "done" | "error"; items: readonly T[]; error: string };
const IDLE = { status: "idle", items: [], error: "" } as const;
const CATEGORIES = ["restaurant", "museum", "bar"] as const;
const LLM_MESSAGES: Record<string, string> = {
  llm_busy: "The free AI model is busy. Try again in a minute.",
  llm_unavailable: "The free AI model didn’t respond. Try again.",
  llm_unreadable: "The AI model answered in a form we couldn’t read. Try again.",
  rate_limited: "You have made a lot of searches in a short time. Wait about ten minutes.",
};

// Qloo vs LLM (docs/20 D6): one example Passport, two sources, side by side.
// Qloo names come from its place data; the AI model's names are not checked.
export function CompareView() {
  const [city, setCity] = useState("Lisbon"),
    [category, setCategory] = useState<(typeof CATEGORIES)[number]>("restaurant"),
    [who, setWho] = useState<string[]>([]),
    [qloo, setQloo] = useState<Side<Entity>>(IDLE),
    [llm, setLlm] = useState<Side<LlmPick>>(IDLE);
  const busy = qloo.status === "loading" || llm.status === "loading";

  async function run() {
    setQloo({ ...IDLE, status: "loading" });
    setLlm({ ...IDLE, status: "loading" });
    let choices: Selection[];
    try {
      ({ choices } = await discovery<{ choices: Selection[] }>({ action: "guest", profile: 0 }));
    } catch (e) {
      const error = (e as Error).message;
      setQloo({ ...IDLE, status: "error", error });
      setLlm({ ...IDLE, status: "error", error });
      return;
    }
    const names = choices.map((c) => c.entity.name);
    setWho(names);
    await Promise.all([
      discovery<{ results: { place: Entity }[] }>({
        action: "explore",
        city,
        category,
        passport: choices.map((c) => c.token),
        quiz: {},
        exclude: [],
        feedback: {},
      }).then(
        (r) => setQloo({ status: "done", items: r.results.slice(0, 3).map((x) => x.place), error: "" }),
        (e) => setQloo({ ...IDLE, status: "error", error: (e as Error).message }),
      ),
      fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favourites: names, city, category }),
      })
        .then(async (r) => {
          const data = await r.json();
          if (!r.ok) throw new Error(LLM_MESSAGES[data.error] || "The AI model request failed. Try again.");
          setLlm({ status: "done", items: data.picks, error: "" });
        })
        .catch((e) => setLlm({ ...IDLE, status: "error", error: (e as Error).message })),
    ]);
  }

  return (
    <>
      <div className="page-head">
        <span className="meta">Qloo vs a general AI model</span>
        <h1>
          Same taste, <em>two answers.</em>
        </h1>
        <p className="lead">
          One example Passport asks Qloo and a free general AI model for the same thing. Qloo picks from
          real places it knows; the AI model writes names that sound right, and nobody checks them.
        </p>
      </div>
      <section className="paper cmp-form">
        <label>
          City
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            {Object.keys(CITIES).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Looking for
          <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c[0].toUpperCase() + c.slice(1) + "s"}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-primary" onClick={run} disabled={busy}>
          {busy ? "Asking both…" : "Compare"}
        </button>
      </section>
      {who.length > 0 && (
        <p className="meta cmp-who">
          Passport: {who.join(", ")} · {category}s in {city}
        </p>
      )}
      <div className="cmp-grid">
        <Column title="Qloo" note="Places from Qloo’s data, each with an address and a place ID." side={qloo}>
          {(p: Entity) => (
            <>
              <strong>{p.name}</strong>
              <span>{p.address ?? "Address not listed"}</span>
            </>
          )}
        </Column>
        <Column
          title="General AI model"
          note="Free model via Pollinations.ai. Names are not checked and may not exist."
          side={llm}
        >
          {(p: LlmPick) => (
            <>
              <strong>{p.name}</strong>
              <span>{p.why}</span>
            </>
          )}
        </Column>
      </div>
    </>
  );
}

function Column<T>({ title, note, side, children }: { title: string; note: string; side: Side<T>; children: (item: T) => React.ReactNode }) {
  return (
    <section className="paper cmp-col" aria-busy={side.status === "loading"}>
      <h2>{title}</h2>
      <p className="meta">{note}</p>
      {side.status === "idle" && <p>Press Compare to ask.</p>}
      {side.status === "loading" && <p>Asking…</p>}
      {side.status === "error" && <p role="alert">{side.error}</p>}
      {side.status === "done" &&
        (side.items.length ? (
          <ol>
            {side.items.map((item, i) => (
              <li key={i}>{children(item)}</li>
            ))}
          </ol>
        ) : (
          <p>No places for this city and category.</p>
        ))}
    </section>
  );
}
