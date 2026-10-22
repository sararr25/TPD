"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PassportCard } from "./passport-card";
import { PassportProfile } from "./passport-profile";
import { SharePassport } from "./share-passport";
import { QuizFlow } from "./quiz-flow";
import { QUIZ_KEY, parseQuiz, buildProfile, type Answers } from "@/lib/quiz";
import { FEEDBACK_KEY, STRONG, strongSignals, type Feedback } from "@/lib/feedback";
import { LIVE_PASSPORT_KEY } from "@/lib/discovery";
import {
  discovery,
  readSelections,
  type Selection,
} from "@/lib/discovery-client";
import { authClient } from "@/lib/auth/client";
import {
  loadAccountPassport,
  saveAccountPassport,
  deleteAccountPassport,
  loadAccountQuiz,
  saveAccountQuiz,
  deleteAccountQuiz,
  loadHidden,
  unhidePlace,
  deleteAccount,
  loadFeedback,
  saveFeedback,
  deleteAccountFeedback,
  HIDDEN_KEY,
  type Hidden,
} from "@/lib/account";
export function PassportBuilder() {
  const [selected, setSelected] = useState<Selection[]>([]),
    [matches, setMatches] = useState<Selection[]>([]),
    [query, setQuery] = useState(""),
    [type, setType] = useState("artist"),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [ready, setReady] = useState(false),
    [showGuest, setShowGuest] = useState(false),
    [guestProfile,setGuestProfile]=useState(0),
    [hidden, setHidden] = useState<Hidden[]>([]),
    [quizOpen, setQuizOpen] = useState(false),
    [profile, setProfile] = useState<Answers>({}),
    [feedback, setFeedback] = useState<Feedback>({ votes: [], dismissed: [] });
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  // Places marked "Not for me" in Swap (E06), with a way to show them again.
  useEffect(() => {
    if (!ready) return;
    let active = true;
    loadHidden(!!userId)
      .then((list) => active && setHidden(list))
      .catch((e) => active && setStatus((e as Error).message));
    return () => {
      active = false;
    };
  }, [ready, userId]);
  // Strong signals learned from "Yes" / "Not for me" votes (D3).
  useEffect(() => {
    if (!ready) return;
    let active = true;
    loadFeedback(!!userId)
      .then((fb) => active && setFeedback(fb))
      .catch((e) => active && setStatus((e as Error).message));
    return () => {
      active = false;
    };
  }, [ready, userId]);
  async function undoSignal(tagId: string, name: string) {
    const next = { ...feedback, dismissed: [...feedback.dismissed, tagId] };
    setFeedback(next);
    try {
      await saveFeedback(next, !!userId);
      setStatus(`"${name}" no longer steers your results.`);
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  async function showAgain(place: Hidden) {
    try {
      await unhidePlace(place.id, !!userId);
      setHidden((list) => list.filter((h) => h.id !== place.id));
      setStatus(`${place.name} can come up in your Swaps again.`);
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  async function removeAccount() {
    (document.querySelector("#delete-account") as HTMLDialogElement).close();
    setBusy(true);
    setStatus("Deleting your account…");
    try {
      await deleteAccount();
    } catch (e) {
      setStatus((e as Error).message);
      setBusy(false);
      return;
    }
    try {
      localStorage.removeItem(LIVE_PASSPORT_KEY);
      localStorage.removeItem(HIDDEN_KEY);
      localStorage.removeItem(QUIZ_KEY);
      localStorage.removeItem(FEEDBACK_KEY);
    } catch {
      setStatus(
        "Your account is deleted. This browser's copy could not be cleared: remove it in browser settings.",
      );
      return;
    }
    location.assign("/passport");
  }
  // Account writes run one after another so the last edit is the one kept.
  const writes = useRef<Promise<unknown>>(Promise.resolve());
  useEffect(() => {
    try {
      const local = readSelections(localStorage.getItem(LIVE_PASSPORT_KEY));
      setSelected(local);
      setProfile(parseQuiz(localStorage.getItem(QUIZ_KEY)));
      // No Passport yet: the quiz is the way in.
      setQuizOpen(!local.length);
    } catch {
      setStatus(
        "Browser storage is unavailable. Keep this page open to retain your choices.",
      );
    }
    setShowGuest(new URLSearchParams(location.search).has("guest"));
    setReady(true);
  }, []);
  // Signed in: the account copy wins; an empty account adopts this browser's Passport.
  useEffect(() => {
    if (!ready || !userId) return;
    let active = true;
    setBusy(true);
    setStatus("Loading your Passport from your account…");
    (async () => {
      // Quiz answers: the account copy wins; an empty account adopts this browser's.
      const accountQuiz = await loadAccountQuiz();
      if (!active) return;
      if (accountQuiz) {
        setProfile(accountQuiz);
        try {
          localStorage.setItem(QUIZ_KEY, JSON.stringify(accountQuiz));
        } catch {}
      } else {
        let localQuiz: Answers = {};
        try {
          localQuiz = parseQuiz(localStorage.getItem(QUIZ_KEY));
        } catch {}
        if (Object.keys(localQuiz).length) await saveAccountQuiz(localQuiz);
        if (!active) return;
      }
      const account = await loadAccountPassport();
      if (!active) return;
      if (account) {
        setSelected(account);
        storeLocally(account);
        setQuizOpen(false);
        setStatus("Loaded your Passport from your account.");
        return;
      }
      let local: Selection[] = [];
      try {
        local = readSelections(localStorage.getItem(LIVE_PASSPORT_KEY));
      } catch {}
      if (!local.length) return setStatus("");
      await saveAccountPassport(local);
      if (active) setStatus("This browser's Passport is now saved to your account.");
    })()
      .catch((e) => active && setStatus((e as Error).message))
      .finally(() => active && setBusy(false));
    return () => {
      active = false;
    };
  }, [ready, userId]);
  function storeLocally(next: Selection[]) {
    try {
      localStorage.setItem(LIVE_PASSPORT_KEY, JSON.stringify(next));
      return true;
    } catch {
      return false;
    }
  }
  function save(next: Selection[]) {
    setSelected(next);
    const local = storeLocally(next);
    if (!userId) {
      setStatus(
        local
          ? "Saved on this browser."
          : "Browser storage could not save these choices. Keep this page open.",
      );
      return;
    }
    setStatus("Saving to your account…");
    writes.current = writes.current
      .then(() => saveAccountPassport(next))
      .then(() => setStatus("Saved to your account."))
      .catch((e) => setStatus((e as Error).message));
  }
  async function finishQuiz(answers: Answers, cards: string[]) {
    setBusy(true);
    setStatus("Building your Passport…");
    try {
      const data = await discovery<{ choices: Selection[] }>({
        action: "quiz",
        cards,
      });
      save(data.choices);
      setProfile(answers);
      try {
        localStorage.setItem(QUIZ_KEY, JSON.stringify(answers));
      } catch {}
      if (userId)
        writes.current = writes.current
          .then(() => saveAccountQuiz(answers))
          .catch((e) => setStatus((e as Error).message));
      setQuizOpen(false);
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function search(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMatches([]);
    setStatus("Searching…");
    try {
      const data = await discovery<{ choices: Selection[] }>({
        action: "search",
        query,
        type,
      });
      setMatches(data.choices);
      setStatus(
        data.choices.length
          ? "Pick the one you mean."
          : "No match found. Try another name.",
      );
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function useGuest() {
    setBusy(true);
    setStatus("Loading the example Passport…");
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
  async function erase() {
    (document.querySelector("#erase-passport") as HTMLDialogElement).close();
    if (userId) {
      setBusy(true);
      try {
        await deleteAccountPassport();
        await deleteAccountQuiz();
        await deleteAccountFeedback();
      } catch (e) {
        setStatus((e as Error).message);
        setBusy(false);
        return;
      }
      setBusy(false);
    }
    try {
      localStorage.removeItem(LIVE_PASSPORT_KEY);
      localStorage.removeItem("tpd-passport-v1");
      localStorage.removeItem("tpd-design-v1");
      localStorage.removeItem(QUIZ_KEY);
      localStorage.removeItem(FEEDBACK_KEY);
      setStatus(
        userId
          ? "Passport deleted from your account and this browser."
          : "Local Passport and old prototype data deleted.",
      );
    } catch {
      setStatus(
        "Could not clear browser storage. Use browser settings to remove saved data.",
      );
    }
    setSelected([]);
    setProfile({});
    setFeedback({ votes: [], dismissed: [] });
  }
  if (quizOpen)
    return (
      <div className="grid">
        <div>
          <QuizFlow
            busy={busy}
            onFinish={finishQuiz}
            onCancel={selected.length ? () => setQuizOpen(false) : undefined}
          />
          <p role="status" aria-live="polite">
            {status}
          </p>
          {!selected.length && (
            <button className="btn btn-quiet" disabled={busy} onClick={() => setQuizOpen(false)}>
              I&apos;d rather search for my favourites
            </button>
          )}
        </div>
        <PassportCard signals={selected.map((s) => s.entity.name)} />
      </div>
    );
  const traveller = buildProfile(profile);
  return (
    <>
      <div className="grid">
        <section>
          <div className="page-head">
            <span className="meta">Your Passport</span>
            <h1>
              A few favourites, <em>a starting point.</em>
            </h1>
            <p className="lead">Choose 3–5 artists, films, books or places you love.</p>
          </div>
          <button className="btn btn-secondary" disabled={busy || !ready} onClick={() => {
              setStatus("");
              setQuizOpen(true);
            }}>
            {traveller ? "Redo the quiz" : "Take the 3-minute quiz"}
          </button>
          {showGuest && (
            <div className="paper">
              <h3>Try an example Passport</h3>
              <label htmlFor="guest-profile">Choose a starting point</label><select id="guest-profile" disabled={busy} value={guestProfile} onChange={e=>setGuestProfile(Number(e.target.value))}><option value={0}>Music & cinema</option><option value={1}>Music first</option></select><p>{guestProfile===0?"Khruangbin · Nina Simone · Before Sunrise (1995)":"Khruangbin · Nina Simone · Patti Smith"}</p>
              <button
                disabled={busy || !ready}
                className="btn btn-secondary"
                onClick={useGuest}
              >
                Use this example
              </button>
            </div>
          )}
          <form onSubmit={search} className="search-form">
            <label htmlFor="kind">What kind of favourite?</label>
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
            <button className="btn btn-secondary" disabled={busy || !ready} type="submit">
              Search
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
                  className="btn btn-quiet"
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
                className="btn btn-secondary btn-chip"
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
            {selected.length} of 5 chosen
          </p>
          <div className="actions">
            {ready && selected.length >= 3 ? (
              <Link className="btn btn-primary" href="/explore">
                This feels like me
              </Link>
            ) : (
              <button disabled className="btn btn-primary">
                Choose at least 3
              </button>
            )}
          </div>
          <p className="muted">
            {userId
              ? "Saved to your account and this browser."
              : "Saved on this browser. No account needed; sign in to keep it across devices."}{" "}
          </p>
          <button
            className="btn btn-quiet"
            disabled={!ready || busy}
            onClick={() =>
              (
                document.querySelector("#erase-passport") as HTMLDialogElement
              ).showModal()
            }
          >
            {userId ? "Delete my Passport" : "Delete my local Passport"}
          </button>
          {feedback.votes.length > 0 && (
            <div className="divider">
              <span className="meta">Learned from your votes</span>
              {(() => {
                const strong = strongSignals(feedback);
                const rows = [
                  ...strong.keep.map((s) => ({ ...s, label: "More" })),
                  ...strong.avoid.map((s) => ({ ...s, label: "Less" })),
                ];
                return rows.length ? (
                  <ul className="entity-list">
                    {rows.map((r) => (
                      <li key={r.id}>
                        <div>
                          <strong>
                            {r.label}: {r.name}
                          </strong>
                          <p className="muted">
                            {r.yes} yes · {r.no} not for me
                          </p>
                        </div>
                        <button className="btn btn-quiet" disabled={busy} onClick={() => undoSignal(r.id, r.name)}>
                          Undo
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">
                    {feedback.votes.length} vote{feedback.votes.length === 1 ? "" : "s"} so far. Each one gently
                    reorders your results; when {STRONG} agree on the same thing it changes your Passport.
                  </p>
                );
              })()}
            </div>
          )}
          {hidden.length > 0 && (
            <div className="divider">
              <span className="meta">Hidden from your Swaps</span>
              <ul className="entity-list">
                {hidden.map((h) => (
                  <li key={h.id}>
                    <div>
                      <strong>{h.name}</strong>
                    </div>
                    <button className="btn btn-quiet" disabled={busy} onClick={() => showAgain(h)}>
                      Show again
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {userId && (
            <div className="divider">
              <span className="meta">Your account</span>
              <p className="muted">
                Deleting your account removes your Passport, collections and
                hidden places from Beesyde, and signs you out.
              </p>
              <button
                className="btn btn-quiet"
                disabled={busy}
                onClick={() =>
                  (document.querySelector("#delete-account") as HTMLDialogElement).showModal()
                }
              >
                Delete my account
              </button>
            </div>
          )}
        </section>
        {traveller ? (
          <div>
            <PassportProfile
              profile={traveller}
              holder={session?.user?.name}
              signals={selected.map((s) => s.entity.name)}
            />
            <SharePassport answers={profile} />
          </div>
        ) : (
          <PassportCard signals={selected.map((s) => s.entity.name)} />
        )}
      </div>
      <dialog id="erase-passport">
        <h2>{userId ? "Delete your Passport?" : "Clear your local edition?"}</h2>
        <p>
          {userId
            ? "This removes your Passport from your account and from this browser."
            : "This removes your Passport and old prototype data from this browser."}{" "}
          This cannot be undone.
        </p>
        <div className="actions">
          <button className="btn btn-secondary" onClick={erase}>
            {userId ? "Delete Passport" : "Delete local data"}
          </button>
          <button
            className="btn btn-quiet"
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
      <dialog id="delete-account">
        <h2>Delete your account?</h2>
        <p>
          This permanently deletes your Beesyde account with its Passport,
          collections and hidden places. Your Google account is not affected.
          This cannot be undone.
        </p>
        <div className="actions">
          <button className="btn btn-secondary" onClick={removeAccount}>
            Delete my account
          </button>
          <button
            className="btn btn-quiet"
            onClick={() =>
              (document.querySelector("#delete-account") as HTMLDialogElement).close()
            }
          >
            Keep my account
          </button>
        </div>
      </dialog>
    </>
  );
}
