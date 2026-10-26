"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PassportSecurityLines } from "./passport-art";
import { LearnedFromYou } from "./learned-from-you";
import { PassportFolio } from "./passport-folio";
import { PassportStamps } from "./passport-stamps";
import { QuizFlow } from "./quiz-flow";
import { EmptyState, LoadingCards } from "./empty-state";
import { usePassportState, PassportPrompt } from "./passport-state";
import {
  PASSPORT_CHANGED,
  finishQuiz,
  stagePassport,
  retryPassportSave,
} from "@/lib/quiz-finish";
import { buildProfile, type Answers } from "@/lib/quiz";
import { type Feedback } from "@/lib/feedback";
import { LIVE_PASSPORT_KEY } from "@/lib/discovery";
import { discovery, type Selection } from "@/lib/discovery-client";
import { authClient } from "@/lib/auth/client";
import { loadFeedback } from "@/lib/account";
export function PassportBuilder() {
  const [selected, setSelected] = useState<Selection[]>([]),
    [matches, setMatches] = useState<Selection[]>([]),
    [searchState, setSearchState] = useState<
      "idle" | "loading" | "done" | "empty" | "error"
    >("idle"),
    [query, setQuery] = useState(""),
    [type, setType] = useState("artist"),
    [localBusy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [ready, setReady] = useState(false),
    [showGuest, setShowGuest] = useState(false),
    [guestProfile, setGuestProfile] = useState(0),
    [quizOpen, setQuizOpen] = useState(false),
    [profile, setProfile] = useState<Answers>({}),
    [feedback, setFeedback] = useState<Feedback>({ votes: [], dismissed: [] });
  const quizWasOpen = useRef(false);
  useEffect(() => {
    if (quizWasOpen.current && !quizOpen) document.querySelector<HTMLElement>(".pf-cover h1, .passport-editor h1")?.focus({ preventScroll: true });
    quizWasOpen.current = quizOpen;
  }, [quizOpen]);
  const passportState = usePassportState();
  const busy = localBusy || passportState.state === "saving";
  const [example, setExample] = useState<Selection[]>([]);
  const [examplePicks, setExamplePicks] = useState<
    { place: import("@/lib/discovery").Entity }[] | null
  >(null);
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  useEffect(() => {
    setQuizOpen(false);
    setExample([]);
    setStatus("");
  }, [userId]);
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
  useEffect(() => {
    setShowGuest(new URLSearchParams(location.search).has("guest"));
  }, []);
  useEffect(() => {
    setReady(passportState.loaded);
    setSelected(passportState.selections);
    setProfile(passportState.quiz);
  }, [passportState.loaded, passportState.selections, passportState.quiz]);
  function storeLocally(next: Selection[]) {
    try {
      localStorage.setItem(LIVE_PASSPORT_KEY, JSON.stringify(next));
      if (userId) localStorage.setItem("beesyde-passport-owner", userId);
      else localStorage.removeItem("beesyde-passport-owner");
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
      window.dispatchEvent(new Event(PASSPORT_CHANGED));
      return;
    }
    setBusy(true);
    setStatus("Saving to your account…");
    try {
      stagePassport(userId, next, profile);
    } catch {
      setStatus(
        "Browser storage could not keep your pending choices. Try again.",
      );
      setBusy(false);
      return;
    }
    void retryPassportSave(userId)
      .then(() => setStatus("Saved to your account."))
      .catch((e) => setStatus((e as Error).message))
      .finally(() => setBusy(false));
  }

  async function onQuizFinish(answers: Answers, cards: string[]) {
    setBusy(true);
    setStatus("Building your Passport…");
    try {
      const choices = await finishQuiz(answers, cards, userId || false);
      setSelected(choices);
      setProfile(answers);
      setStatus(userId ? "Saved to your account." : "Saved on this browser.");
      setQuizOpen(false);
      return true;
    } catch (e) {
      setStatus((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function search(e: React.FormEvent) {
    e.preventDefault();
    await runSearch();
  }
  async function runSearch() {
    setBusy(true);
    setSearchState("loading");
    setMatches([]);
    setStatus("Searching…");
    try {
      const data = await discovery<{ choices: Selection[] }>({
        action: "search",
        query,
        type,
      });
      setMatches(data.choices);
      setSearchState(data.choices.length ? "done" : "empty");
      setStatus(
        data.choices.length
          ? "Pick the one you mean."
          : "No match found. Try another name.",
      );
    } catch (e) {
      setSearchState("error");
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
        profile: guestProfile,
      });
      setExample(data.choices);
      setExamplePicks(null);
      setStatus("Example preview only. Your Passport is unchanged.");
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
  if (passportState.state === "error")
    return (
      <EmptyState
        title="Your Passport couldn’t load"
        action={
          <button className="btn btn-primary" onClick={passportState.retry}>
            Try again
          </button>
        }
      >
        <p>{passportState.error}</p>
      </EmptyState>
    );
  if (!ready || passportState.state === "loading")
    return <LoadingCards label="Loading your Passport…" count={2} />;
  if (quizOpen)
    return (
      <div className="passport-leaves passport-quiz-leaf" data-travel-page>
        <div className="grid">
          <div>
            <QuizFlow
              busy={busy}
              onFinish={onQuizFinish}
              onCancel={() => setQuizOpen(false)}
            />
            <p role="status" aria-live="polite">
              {status}
            </p>
            {!selected.length && (
              <button
                className="btn btn-quiet"
                disabled={busy}
                onClick={() => setQuizOpen(false)}
              >
                I&apos;d rather search for my favourites
              </button>
            )}
          </div>
        </div>
        <PassportStamps />
      </div>
    );
  const traveller = buildProfile(profile);
  const editor = (
<section className="passport-editor" data-travel-page>
          {(passportState.state === "saving" ||
            passportState.state === "partial" ||
            passportState.state === "expired") && <PassportPrompt />}
          <div className="page-head passport-leaf-heading">
            <PassportSecurityLines />
            <h1 tabIndex={-1}>Your Taste Passport</h1>
            <p className="lead">
              What you love, so we can pick places for you. Add 3–5 favourite
              artists, films, books or places.
            </p>
          </div>
          <button
            className="btn btn-secondary"
            disabled={busy || !ready}
            onClick={() => {
              setStatus("");
              setQuizOpen(true);
            }}
          >
            {traveller ? "Redo the quiz" : "Make your Passport"}
          </button>
          {showGuest && (
            <div className="paper">
              <h3>Try an example Passport</h3>
              <label htmlFor="guest-profile">Choose a starting point</label>
              <select
                id="guest-profile"
                disabled={busy}
                value={guestProfile}
                onChange={(e) => setGuestProfile(Number(e.target.value))}
              >
                <option value={0}>Music & cinema</option>
                <option value={1}>Music first</option>
              </select>
              <p>
                {guestProfile === 0
                  ? "Khruangbin · Nina Simone · Before Sunrise (1995)"
                  : "Khruangbin · Nina Simone · Patti Smith"}
              </p>
              <button
                disabled={busy || !ready}
                className="btn btn-secondary"
                onClick={useGuest}
              >
                Preview this example
              </button>
            </div>
          )}
          {example.length > 0 && (
            <section className="paper" aria-label="Example preview">
              <h3>Example · not your Passport</h3>
              <p>{example.map((s) => s.entity.name).join(" · ")}</p>
              <button
                className="btn btn-secondary"
                disabled={busy}
                onClick={() => {
                  save(example);
                  setExample([]);
                }}
              >
                Replace my favourites with this example
              </button>
              <button
                className="btn btn-secondary"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const result = await discovery<{
                      results: { place: import("@/lib/discovery").Entity }[];
                    }>({
                      action: "explore",
                      city: "Lisbon",
                      category: "restaurant",
                      passport: example.map((s) => s.token),
                      quiz: {},
                      exclude: [],
                      feedback: {},
                    });
                    setExamplePicks(result.results);
                  } catch (e) {
                    setStatus((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                See example picks in Lisbon
              </button>
              <button className="btn btn-quiet" onClick={() => setExample([])}>
                Close preview
              </button>
              {examplePicks && (
                <ul>
                  {examplePicks.length ? (
                    examplePicks.map(({ place }) => (
                      <li key={place.id}>
                        <Link href={`/lisbon/${place.id.toLowerCase()}`}>
                          {place.name}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li>No picks for this example today.</li>
                  )}
                </ul>
              )}
            </section>
          )}
          {passportState.state === "needs-favourites" && (
            <p role="status">
              Your profile is here. Choose {3 - selected.length} more favourites
              to get personal picks. You don’t need to redo the quiz.
            </p>
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
                setSearchState("idle");
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
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchState("idle");
              }}
              placeholder="An artist, a film, a book…"
            />
            <button
              className="btn btn-secondary"
              disabled={busy || !ready}
              type="submit"
            >
              Search
            </button>
          </form>
          <p role="status" aria-live="polite">
            {status}
          </p>
          {searchState === "loading" && (
            <LoadingCards label="Looking for your favourite…" count={1} />
          )}
          {searchState === "empty" && (
            <EmptyState
              title="No match for that name"
              action={
                <button
                  className="btn btn-secondary"
                  onClick={() => document.getElementById("favourite")?.focus()}
                >
                  Try another name
                </button>
              }
            >
              <p>
                Try the full title or a different favourite. Your choices so far
                are still here.
              </p>
            </EmptyState>
          )}
          {searchState === "error" && (
            <EmptyState
              title="This search couldn’t load"
              action={
                <button
                  className="btn btn-secondary"
                  disabled={busy}
                  onClick={() => void runSearch()}
                >
                  Try again
                </button>
              }
            >
              <p>{status}</p>
            </EmptyState>
          )}
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
          <p className="meta">{selected.length} of 5 chosen</p>
          <div className="actions">
            {ready && passportState.state === "ready" ? (
              <Link className="btn btn-primary" href="/explore">
                Browse cities
              </Link>
            ) : (
              <button disabled className="btn btn-primary">
                Choose at least 3
              </button>
            )}
          </div>
          <p className="muted">
            {userId
              ? "Account save status is shown above."
              : "Saved on this browser. No account needed; sign in to keep it across devices."}{" "}
          </p>
          {feedback.votes.length > 0 && (
            <div className="divider">
              <span className="meta">Learned from you</span>
              <LearnedFromYou feedback={feedback} />
            </div>
          )}
          <p>
            <Link className="btn btn-quiet" href="/passport/settings">
              Settings &amp; privacy
            </Link>
          </p>
        </section>
  );
  return <PassportFolio key={passportState.owner} answers={profile} favourites={selected.map(s => s.entity.name)} holder={session?.user?.name} editor={editor} onStartQuiz={() => { setStatus(""); setQuizOpen(true); }}/>;
}
