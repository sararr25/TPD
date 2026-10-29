"use client";
import { ActionIcon } from "./action-icon";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { type Choice, type Result, chipTags, hasTrait } from "@/lib/discovery";
import { discovery, type Selection } from "@/lib/discovery-client";

const REFERENCE = "96296410-62EB-408E-96C6-FD60AAAF9216";
type Demo = { reference: Selection; choices: Choice[]; results: Result[] };
const label = (name: string) => name.replace(/[_-]+/g, " ").toLowerCase();

// A real, deliberately impersonal Swap. It never reads or replaces the
// visitor's Passport, saved places or feedback.
export function HomeSwapDemo() {
  const [busy, setBusy] = useState(false),
    [demo, setDemo] = useState<Demo | null>(null),
    [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  async function run() {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    setDemo(null);
    try {
      const { choices: matches } = await discovery<{ choices: Selection[] }>({
        action: "search", query: "Time Out Market", type: "place",
        reference: true, category: "restaurant", city: "Lisbon",
      }, controller.signal);
      const reference = matches.find((s) => s.entity.id.toUpperCase() === REFERENCE);
      if (!reference) throw new Error("We couldn’t find the Lisbon starting place. Try again later, or open Lisbon to choose another.");
      const tags = chipTags(reference.entity, "restaurant");
      const keep = tags.find((t) => label(t.name) === "seafood");
      const change = tags.find((t) => label(t.name) === "casual");
      if (!keep || !change) throw new Error("The starting place’s details have changed. Open Lisbon to choose what you’d like to keep.");
      const choices: Choice[] = [
        { tagId: keep.id, mode: "keep" },
        { tagId: change.id, mode: "change" },
      ];
      const { results } = await discovery<{ results: Result[] }>({
        action: "swap", category: "restaurant", city: "Lisbon",
        reference: reference.token, passport: [], choices,
        exclude: [], quiz: {}, feedback: {},
      }, controller.signal);
      if (!results.length) throw new Error("No twins matched this example today. Open Lisbon and try keeping fewer things.");
      if (!controller.signal.aborted) setDemo({ reference, choices, results });
    } catch (e) {
      if (!controller.signal.aborted) setError((e as Error).message);
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  function traits(result: Result, mode: "keep" | "change") {
    return demo!.choices.filter((c) => c.mode === mode &&
      hasTrait(result.place, demo!.reference.entity.tags.find(t => t.id === c.tagId)!) === (mode === "keep"))
      .map((c) => label(demo!.reference.entity.tags.find((t) => t.id === c.tagId)!.name));
  }

  return (
    <section className="home-swap-demo" aria-labelledby="swap-demo-title">
      <div className="home-swap-intro">
        <span className="meta">Try a real Twin search · Lisbon</span>
        <h2 id="swap-demo-title">If Time Out Market is full, where next?</h2>
        <p>Keep the seafood. Exclude the casual setting. See up to three real alternatives, without making a Passport.</p>
        <button className="btn btn-primary" disabled={busy} onClick={run}>
          {busy ? "Finding its twins…" : demo ? "Find these twins again" : error ? "Try again" : "Find its twin"}
        </button>
      </div>
      <div aria-busy={busy}>
        {!busy && !demo && !error && (
          <div className="h-swap-sheet" aria-label="Illustration of this Twin search, not search results">
            <div className="h-page-top" aria-hidden="true"><span>Find its twin</span><span>B / 002</span></div>
            <p className="meta">The place you wanted</p>
            <h3>Time Out Market</h3>
            <div className="h-swap-traits"><span>Keep · seafood</span><span>Delete · casual</span></div>
            <p className="h-swap-next">Another address.<br /><em>Still your kind of evening.</em></p>
            <p className="muted">An illustration. Find its twin to see today’s alternatives.</p>
          </div>
        )}
        {busy && <><p role="status">Looking for alternatives in Lisbon…</p><div className="place-grid" aria-hidden>{[0, 1, 2].map((i) => <div className="place-card skeleton" key={i} />)}</div></>}
        {error && <p className="h-error" role="alert">{error}</p>}
        {demo && (
          <>
            <p className="meta" role="status"><span className="h-demo-all">{demo.results.length} alternative{demo.results.length === 1 ? "" : "s"} to Time Out Market</span><span className="h-demo-one">Closest alternative to Time Out Market</span> · Keep is a preference, so check each result.</p>
            <div className="place-grid">
              {demo.results.map((r, i) => {
                const kept = traits(r, "keep"), changed = traits(r, "change");
                return (
                  <article className={i ? "place-card h-demo-extra" : "place-card"} key={r.place.id}>
                    <div className="place-body">
                      <span className="place-role">{r.role}</span>
                      <h3><Link href={`/lisbon/${r.place.id.toLowerCase()}`}>{r.place.name}</Link></h3>
                      <p className="place-why"><strong>Keeps:</strong> {kept.length ? kept.join(", ") : "Seafood isn’t listed for this alternative."}</p>
                      <p className="place-why"><strong>Leaves behind:</strong> {changed.length ? `Moves away from ${changed.join(", ")}.` : "No change confirmed in these details."}</p>
                      <p>{r.different}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
        {(error || demo) && <p><Link className="btn btn-quiet" href="/lisbon?tab=swap">Choose your own starting place <ActionIcon name="right" /></Link></p>}
      </div>
    </section>
  );
}
