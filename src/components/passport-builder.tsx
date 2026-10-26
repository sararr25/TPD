"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { InkJourney } from "./ink-journey";
import { PassportSecurityLines } from "./passport-art";
import { LearnedFromYou } from "./learned-from-you";
import { PassportProfile } from "./passport-profile";
import { VisitedCities } from "./visited-cities";
import { PassportStamps } from "./passport-stamps";
import { SharePassport } from "./share-passport";
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
  const passportState = usePassportState();
  const busy = localBusy || passportState.state === "saving";
  const [example, setExample] = useState<Selection[]>([]);
  const [examplePicks, setExamplePicks] = useState<
    { place: import("@/lib/discovery").Entity }[] | null
  >(null);
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const quizWasOpen = useRef(false);
  useEffect(() => {
    if (quizOpen) {
      const quiz = document.querySelector<HTMLElement>(".passport-quiz-leaf");
      quiz?.scrollIntoView({ block: "start", behavior: "instant" });
      quiz?.querySelector<HTMLElement>("#quiz-title")?.focus({ preventScroll: true });
    } else if (quizWasOpen.current) {
      const heading = document.querySelector<HTMLElement>(".passport-introduction h1");
      heading?.focus({ preventScroll: true });
      heading?.closest("header")?.scrollIntoView({ block: "start", behavior: "instant" });
    }
    quizWasOpen.current = quizOpen;
  }, [quizOpen]);
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
    } catch (e) {
      setStatus((e as Error).message);
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
      <div className="passport-leaves passport-quiz-leaf">
        <aside className="quiz-cover"><span className="quiz-cover-brand">Beesyde / Taste Passport</span><h1>Begin with<br /><em>what you love.</em></h1><p>No right answers. Just your kind of day, your kind of places, your kind of city.</p><InkJourney /><p className="quiz-cover-note">About 3 minutes. Yours to keep.</p></aside>
        <div className="grid">
          <div>
            <QuizFlow
              busy={busy}
              onFinish={onQuizFinish}
              onCancel={selected.length ? () => setQuizOpen(false) : undefined}
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
      </div>
    );
  const traveller = buildProfile(profile);
  return (
    <div className="passport-leaves passport-remade">
      <header className="passport-introduction">
        <div><p className="passport-eyebrow">Made of what you love</p><h1 tabIndex={-1}>Your Taste Passport</h1>
        <p>A little of you. A different way into every city.</p></div>
        <Link className="btn btn-secondary" href="/explore">Explore with your Passport →</Link>
      </header>
      <div className="grid passport-spread">
        {traveller ? (
          <div className="passport-personal-leaf" data-travel-page>
            <PassportProfile
              profile={traveller}
              holder={session?.user?.name}
              signals={selected.map((s) => s.entity.name)}
            />
            <SharePassport answers={profile} />
          </div>
        ) : selected.length > 0 ? (
          <div className="paper">
            <h3>Your picks so far</h3>
            <ul className="entity-list">
              {selected.map((s) => (
                <li key={s.entity.id}>
                  <div>
                    <strong>{s.entity.name}</strong>
                    {/* Qloo repeats the name as context for artists; show it only when it adds something (a film's year). */}
                    {s.entity.context && s.entity.context !== s.entity.name && (
                      <p className="muted">{s.entity.context}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <p className="muted">
              Take the 3-minute quiz to turn these into your full Taste
              Passport, the card you can share.
            </p>
          </div>
        ) : (
          <EmptyState
            title="Start with what you love"
            action={
              <button
                className="btn btn-primary"
                disabled={busy}
                onClick={() => setQuizOpen(true)}
              >
                Make your Passport
              </button>
            }
          >
            <p>
              A 3-minute quiz helps us pick places for you. Or add your
              favourites with the search beside this card.
            </p>
          </EmptyState>
        )}
        <section className="passport-editor" data-travel-page>
          {(passportState.state === "saving" ||
            passportState.state === "partial" ||
            passportState.state === "expired") && <PassportPrompt />}
          <div className="page-head passport-leaf-heading">
            <PassportSecurityLines />
            <h2>Keep it personal.</h2>
            <p className="lead">The artists, films, books and places you love help us find your side of a city.</p>
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
          <details className="passport-favourites" open={!traveller || selected.length < 3}>
          <summary>Edit your favourites <span>{selected.length} / 5</span></summary>
          <p className="muted">Choose 3–5 favourites. These are what make the picks yours.</p>
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
          </details>
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

      </div>
      <VisitedCities />
      <PassportStamps />
    </div>
  );
}
