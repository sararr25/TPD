"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PassportCard } from "./passport-card";
import { LIVE_PASSPORT_KEY } from "@/lib/discovery";
import {
  discovery,
  readSelections,
  type Selection,
} from "@/lib/discovery-client";
export function PassportBuilder() {
  const [selected, setSelected] = useState<Selection[]>([]),
    [matches, setMatches] = useState<Selection[]>([]),
    [query, setQuery] = useState(""),
    [type, setType] = useState("artist"),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [ready, setReady] = useState(false),
    [showGuest, setShowGuest] = useState(false),
    [guestProfile,setGuestProfile]=useState(0);
  useEffect(() => {
    try {
      setSelected(readSelections(localStorage.getItem(LIVE_PASSPORT_KEY)));
    } catch {
      setStatus(
        "Browser storage is unavailable. Keep this page open to retain your choices.",
      );
    }
    setShowGuest(new URLSearchParams(location.search).has("guest"));
    setReady(true);
  }, []);
  function save(next: Selection[]) {
    setSelected(next);
    try {
      localStorage.setItem(LIVE_PASSPORT_KEY, JSON.stringify(next));
      setStatus("Saved on this browser.");
    } catch {
      setStatus(
        "Browser storage could not save these choices. Keep this page open.",
      );
    }
  }
  async function search(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMatches([]);
    setStatus("Searching Qloo…");
    try {
      const data = await discovery<{ choices: Selection[] }>({
        action: "search",
        query,
        type,
      });
      setMatches(data.choices);
      setStatus(
        data.choices.length
          ? "Select the exact entity you mean."
          : "No matching entity found. Try another name.",
      );
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function useGuest() {
    setBusy(true);
    setStatus("Resolving the guest Passport with Qloo…");
    try {
      const data = await discovery<{ choices: Selection[] }>({
        action: "guest",
        profile:guestProfile,
      });
      save(data.choices);
      setMatches([]);
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function add(s: Selection) {
    if (selected.some((x) => x.entity.id === s.entity.id)) {
      setStatus("Already in your Passport.");
      return;
    }
    if (selected.length >= 5) {
      setStatus("Choose up to 5. Remove one to add another.");
      return;
    }
    save([...selected, s]);
  }
  function erase() {
    try {
      localStorage.removeItem(LIVE_PASSPORT_KEY);
      localStorage.removeItem("tpd-passport-v1");
      localStorage.removeItem("tpd-design-v1");
      setStatus("Local Passport and old prototype data deleted.");
    } catch {
      setStatus(
        "Could not clear browser storage. Use browser settings to remove saved data.",
      );
    }
    setSelected([]);
    (document.querySelector("#erase-passport") as HTMLDialogElement).close();
  }
  return (
    <>
      <div className="grid">
        <section>
          <span className="meta">01 / Your cultural identity</span>
          <h1>
            A few favourites.
            <br />
            <em>A starting point.</em>
          </h1>
          <p>Choose 3–5 artists, films, books or places you love.</p>
          {showGuest && (
            <div className="paper">
              <h3>Borrow a Passport</h3>
              <label htmlFor="guest-profile">Choose a starting point</label><select id="guest-profile" disabled={busy} value={guestProfile} onChange={e=>setGuestProfile(Number(e.target.value))}><option value={0}>Music & cinema</option><option value={1}>Music first</option></select><p>{guestProfile===0?"Khruangbin · Nina Simone · Before Sunrise (1995)":"Khruangbin · Nina Simone · Patti Smith"}</p>
              <button
                disabled={busy || !ready}
                className="stamp"
                onClick={useGuest}
              >
                Resolve this guest profile
              </button>
            </div>
          )}
          <form onSubmit={search} className="search-form">
            <label htmlFor="kind">Look for</label>
            <select
              disabled={busy}
              id="kind"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setMatches([]);
              }}
            >
              <option value="artist">Artists & music</option>
              <option value="movie">Films</option>
              <option value="book">Books</option>
              <option value="place">Places already loved</option>
            </select>
            <label htmlFor="favourite">A favourite</label>
            <input
              disabled={busy || !ready}
              id="favourite"
              minLength={2}
              maxLength={120}
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="An artist, a film, a book…"
            />
            <button className="stamp" disabled={busy || !ready} type="submit">
              Search Qloo
            </button>
          </form>
          <p role="status" aria-live="polite">
            {status}
          </p>
          <ul className="entity-list">
            {matches.map((s) => (
              <li key={s.entity.id}>
                <div>
                  <strong>{s.entity.name}</strong>
                  <p className="muted">
                    {s.entity.address || s.entity.context || s.entity.type}
                  </p>
                </div>
                <button
                  className="text"
                  disabled={
                    busy ||
                    selected.some((x) => x.entity.id === s.entity.id) ||
                    selected.length >= 5
                  }
                  onClick={() => add(s)}
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
          <div className="chips">
            {selected.map((s) => (
              <button
                disabled={busy}
                className="choice"
                key={s.entity.id}
                onClick={() =>
                  save(selected.filter((x) => x.entity.id !== s.entity.id))
                }
                aria-label={"Remove " + s.entity.name}
              >
                {s.entity.name} ×
              </button>
            ))}
          </div>
          <p className="meta">
            {selected.length} of 5 selected · live Qloo entities
          </p>
          <div className="actions">
            {ready && selected.length >= 3 ? (
              <Link className="ticket" href="/swap">
                This feels like me ↗
              </Link>
            ) : (
              <button disabled className="ticket">
                Choose at least 3
              </button>
            )}
          </div>
          <p className="muted">
            Saved on this browser. No account needed. Old sample choices are not
            treated as live entities.
          </p>
          <button
            className="text"
            disabled={!ready || busy}
            onClick={() =>
              (
                document.querySelector("#erase-passport") as HTMLDialogElement
              ).showModal()
            }
          >
            Delete my local Passport
          </button>
        </section>
        <PassportCard signals={selected.map((s) => s.entity.name)} />
      </div>
      <dialog id="erase-passport">
        <h2>Clear your local edition?</h2>
        <p>
          This removes your Passport and old prototype data from this browser.
          This cannot be undone.
        </p>
        <div className="actions">
          <button className="stamp" onClick={erase}>
            Delete local data
          </button>
          <button
            className="text"
            onClick={() =>
              (
                document.querySelector("#erase-passport") as HTMLDialogElement
              ).close()
            }
          >
            Keep my Passport
          </button>
        </div>
      </dialog>
    </>
  );
}
