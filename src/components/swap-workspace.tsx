"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  LIVE_PASSPORT_KEY,
  type Choice,
  type Result,
  type PlaceCategory,
} from "@/lib/discovery";
import {
  discovery,
  readSelections,
  type Selection,
} from "@/lib/discovery-client";
import { authClient } from "@/lib/auth/client";
import { loadAccountPassport } from "@/lib/account-passport";
import type { CheckStatus } from "@/lib/venue-check";
type Payload = {
  results: Result[];
  checkedAt: string;
  candidateCount: number;
  discarded: number;
  notice: string;
};
const CHECK_LABEL: Record<CheckStatus, string> = {
  confirmed: "name, category and address agree",
  conflict: "conflict found — check before going",
  ambiguous: "several places share this name nearby",
  not_found: "not listed nearby (coverage is incomplete)",
  unavailable: "could not be checked right now",
};
export function SwapWorkspace() {
  const [category, setCategory] = useState<PlaceCategory>("restaurant");
  return (
    <>
      <div className="chips" role="group" aria-label="Discovery category">
        {(["restaurant", "museum"] as const).map((value) => (
          <button
            className="choice"
            key={value}
            aria-pressed={category === value}
            onClick={() => setCategory(value)}
          >
            {value === "restaurant" ? "Restaurants" : "Museums"}
          </button>
        ))}
      </div>
      <CategoryWorkspace key={category} category={category} onTransfer={setCategory} />
    </>
  );
}
function CategoryWorkspace({ category, onTransfer }: {
  category: PlaceCategory;
  onTransfer: (category: PlaceCategory) => void;
}) {
  const museum = category === "museum";
  const searchController = useRef<AbortController | null>(null);
  useEffect(() => () => searchController.current?.abort(), []);
  const [passport, setPassport] = useState<Selection[]>([]),
    [ready, setReady] = useState(false),
    [query, setQuery] = useState(""),
    [matches, setMatches] = useState<Selection[]>([]),
    [reference, setReference] = useState<Selection | null>(null),
    [choices, setChoices] = useState<Choice[]>([]),
    [budget, setBudget] = useState(""),
    [searching, setSearching] = useState(false),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [data, setData] = useState<Payload | null>(null),
    [started, setStarted] = useState(false),
    [attempt, setAttempt] = useState(0);
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  // Signed in: use the account Passport (freshly signed, works on any device).
  useEffect(() => {
    if (isPending) return;
    try {
      setPassport(readSelections(localStorage.getItem(LIVE_PASSPORT_KEY)));
    } catch {
      setStatus(
        "Your browser Passport could not be read. Reopen the Passport and choose your favourites.",
      );
    }
    if (!userId) return setReady(true);
    let active = true;
    loadAccountPassport()
      .then((account) => {
        if (!active || !account) return;
        setPassport(account);
        try {
          localStorage.setItem(LIVE_PASSPORT_KEY, JSON.stringify(account));
        } catch {}
      })
      .catch((e) => active && setStatus((e as Error).message))
      .finally(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, [isPending, userId]);
  useEffect(() => {
    if (!started || !reference) return;
    const controller = new AbortController();
    let active = true;
    setBusy(true);
    setData(null);
    setStatus("Finding alternatives with Qloo…");
    discovery<Payload>(
      {
        action: "swap",
        category,
        reference: reference.token,
        passport: passport.map((s) => s.token),
        choices,
        ...(budget ? { maxPrice: Number(budget) } : {}),
      },
      controller.signal,
    )
      .then((result) => {
        if (active) {
          setData(result);
          setStatus(
            result.results.length
              ? `${result.results.length} alternatives. City and category checked against the Qloo response.`
              : "No alternatives passed your constraints. Try ignoring a preference or choosing another reference; Paris stays fixed.",
          );
        }
      })
      .catch((error) => {
        if (active && error.name !== "AbortError") setStatus(error.message);
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [started, reference, passport, choices, budget, attempt, category]);
  async function search(e: React.FormEvent) {
    e.preventDefault();
    searchController.current?.abort();
    const controller = new AbortController();
    searchController.current = controller;
    setSearching(true);
    setMatches([]);
    setStatus(`Looking for your ${category} in Paris…`);
    try {
      const found = await discovery<{ choices: Selection[] }>({
        action: "search",
        query,
        type: "place",
        reference: true,
        category,
      }, controller.signal);
      if (controller.signal.aborted) return;
      setMatches(found.choices);
      setStatus(
        found.choices.length
          ? `Confirm the ${category} and its address.`
          : `No Paris ${category} with address and coordinates was resolved. Try a more precise name.`,
      );
    } catch (error) {
      if (!controller.signal.aborted) setStatus((error as Error).message);
    } finally {
      if (!controller.signal.aborted) setSearching(false);
    }
  }
  function select(s: Selection) {
    setReference(s);
    setData(null);
    setStarted(false);
    setBusy(false);
    setChoices(
      s.entity.tags
        .filter((t) => t.id !== `urn:tag:genre:place:${category}`)
        .slice(0, 6)
        .map((t) => ({ tagId: t.id, mode: "ignore" })),
    );
    setStatus(
      "Choose what to keep and what to change. City and category stay fixed.",
    );
    setMatches([]);
  }
  function changeTag(tagId: string, mode: Choice["mode"]) {
    setData(null);
    setChoices((values) =>
      values.map((c) => (c.tagId === tagId ? { ...c, mode } : c)),
    );
  }
  return (
    <>
      <span className="meta">02 / {museum ? "Museum" : "Restaurant"} Swap · Paris pilot</span>
      <h1>
        Keep the feeling.
        <br />
        <em>Change the place.</em>
      </h1>
      <p className="lead">
        A different {category} in the same city, guided by your cultural taste.
        {museum && " Your music, film and book favourites travel with you. Admission prices and exhibitions are not checked."}
      </p>
      {ready && passport.length < 3 ? (
        <section className="paper">
          <h2>First, a little about you.</h2>
          <p>
            Choose 3–5 real favourites so your Passport can guide this search.
          </p>
          <Link className="ticket" href="/passport">
            Make my Passport ↗
          </Link>
        </section>
      ) : (
        <>
          <div className="grid">
            <section className="paper">
              <span className="meta">01 / Your first choice</span>
              <form onSubmit={search}>
                <label htmlFor="reference">The {category} you wanted</label>
                <input
                  id="reference"
                  placeholder={museum ? "Museum name, e.g. Musée d’Orsay" : "Restaurant name, e.g. Le Baratin"}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  minLength={2}
                  maxLength={120}
                  required
                  disabled={!ready || searching}
                />
                <label htmlFor="city">Stay in</label>
                <input id="city" value="Paris · pilot" readOnly />
                <div className="actions">
                  <button className="stamp" disabled={!ready || searching}>
                    Find the {category}
                  </button>
                </div>
              </form>
              <ul className="entity-list">
                {matches.map((s) => (
                  <li key={s.entity.id}>
                    <div>
                      <strong>{s.entity.name}</strong>
                      <p className="muted">{s.entity.address}</p>
                    </div>
                    <button className="text" onClick={() => select(s)}>
                      Choose
                    </button>
                  </li>
                ))}
              </ul>
              {reference && (
                <div className="divider">
                  <h3>{reference.entity.name}</h3>
                  <p>{reference.entity.address}</p>
                  <span className="meta">
                    Reference selected · Qloo identity only
                  </span>
                </div>
              )}
            </section>
            <section>
              <span className="meta">02 / Keep what matters</span>
              {reference ? (
                <>
                  <p>
                    These tags come from your reference’s Qloo data. Keep
                    influences taste; Change excludes the selected tag.
                  </p>
                  {choices.length ? (
                    choices.map((choice) => {
                      const tag = reference.entity.tags.find(
                        (t) => t.id === choice.tagId,
                      )!;
                      return (
                        <div className="segment" key={choice.tagId}>
                          <span>{tag.name}</span>
                          <div role="group" aria-label={tag.name}>
                            {(["keep", "change", "ignore"] as const).map(
                              (mode) => (
                                <button
                                  type="button"
                                  key={mode}
                                  aria-pressed={choice.mode === mode}
                                  onClick={() => changeTag(choice.tagId, mode)}
                                >
                                  {mode}
                                </button>
                              ),
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>
                      No suitable taste tags were returned. Your reference and
                      Passport still guide the search.
                    </p>
                  )}
                  {!museum && (
                    <>
                      <label htmlFor="budget">Maximum Qloo price tier</label>
                      <select
                        id="budget"
                        value={budget}
                        onChange={(e) => {
                          setData(null);
                          setBudget(e.target.value);
                        }}
                      >
                        <option value="">No price constraint</option>
                        <option value="1">1 / lowest tier</option>
                        <option value="2">2 / moderate</option>
                        <option value="3">3 / higher</option>
                        <option value="4">4 / highest tier</option>
                      </select>
                      <p className="muted">
                        An indicative tier, not a live menu price. Unknown tiers are
                        excluded when a limit is set.
                      </p>
                    </>
                  )}
                  <div className="actions">
                    <button
                      className="ticket"
                      disabled={busy}
                      onClick={() => {
                        setStarted(true);
                        setAttempt((n) => n + 1);
                      }}
                    >
                      {busy ? "Finding alternatives…" : "Swap it ↗"}
                    </button>
                  </div>
                </>
              ) : (
                <p>Select a {category} to see its Keep / Change tags.</p>
              )}
              <div className="divider">
                <span className="meta">Your Passport</span>
                <p className="muted">
                  {passport.map((s) => s.entity.name).join(" · ")}
                </p>
                <Link href="/passport">Edit favourites</Link>
              </div>
            </section>
          </div>
        </>
      )}
      <p role="status" aria-live="polite">
        {status}
      </p>
      <section aria-label="Alternatives" aria-busy={busy}>
        {data && (
          <>
            <p className="muted">
              {data.candidateCount} eligible candidates · {data.discarded}{" "}
              discarded by local validation. Three roles are selected from this
              candidate set; roles may be absent if there is insufficient
              evidence.
            </p>
            <div className="divider">
              <h2>Same Passport. A different experience.</h2>
              <p>Carry your favourites into {museum ? "restaurants" : "museums"} in Paris. Choose a new reference to guide the next Swap.</p>
              <button className="stamp" onClick={() => onTransfer(museum ? "restaurant" : "museum")}>
                Try {museum ? "restaurants" : "museums"} with this Passport ↗
              </button>
            </div>
            <div className="cards">
              {data.results.map((result) => (
                <article className="result" key={result.place.id}>
                  <div className="body">
                    <span className="role">{result.role}</span>
                    <h2>{result.place.name}</h2>
                    <p>{result.place.address}</p>
                    {!museum && <p className="muted">
                      Qloo price tier: {result.place.price ?? "not provided"}
                    </p>}
                    <h3>Why it matches you</h3>
                    <p>{result.why}</p>
                    <h3>What’s different</h3>
                    <p>{result.different}</p>
                    <details>
                      <summary>What we verified</summary>
                      <p>
                        Qloo returned a {category} in Paris with an address and
                        coordinates
                        {budget ? ", within your chosen price tier" : ""}. We
                        filtered out the reference, duplicates, closed flags and
                        excluded tags.
                      </p>
                      <p>
                        Qloo data only (L0). Existence, current opening hours,
                        {museum ? "admission prices, exhibitions and ticket availability" : "menu prices and table availability"} are not independently
                        verified.
                      </p>
                      {result.check && (
                        <>
                          <p>
                            OpenStreetMap cross-check: {CHECK_LABEL[result.check.status]}.
                            {result.check.match && (
                              <>
                                {" "}Matched{" "}
                                <a href={result.check.match.url} target="_blank" rel="noreferrer">
                                  {result.check.match.name} ↗
                                </a>{" "}
                                ({result.check.match.category}={result.check.match.type},{" "}
                                {result.check.match.distanceM} m from the Qloo position).
                              </>
                            )}
                          </p>
                          {result.check.notes.map((note) => (
                            <p key={note}>{note}</p>
                          ))}
                        </>
                      )}
                      <p className="meta">
                        Response checked:{" "}
                        {new Date(data.checkedAt).toLocaleString()}
                      </p>
                    </details>
                    {result.place.lat !== null && result.place.lon !== null && (
                      <div className="actions">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${result.place.lat},${result.place.lon}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open directions ↗
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="stub" data-check={result.check?.status}>
                    L0 · Qloo taste recommendation
                    <br />
                    {result.check
                      ? `OpenStreetMap: ${CHECK_LABEL[result.check.status]}`
                      : "Operational verification pending"}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
