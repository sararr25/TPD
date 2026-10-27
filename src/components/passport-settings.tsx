"use client";
import {useTravelState} from "./travel-state";
import {emptyTravel} from "@/lib/travel-state";
import {searchKey} from "@/lib/search-draft";
import { ActionIcon } from "./action-icon";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuizPanel } from "./quiz-panel";
import { usePassportState } from "./passport-state";
import { PassportSecurityLines } from "./passport-art";
import { discardPendingPassport, PASSPORT_CHANGED } from "@/lib/quiz-finish";
import { LearnedFromYou } from "./learned-from-you";
import { dismissTag, FEEDBACK_KEY, type Feedback } from "@/lib/feedback";
import { LIVE_PASSPORT_KEY } from "@/lib/discovery";
import { QUIZ_KEY } from "@/lib/quiz";
import { deleteQuizDraft } from "@/lib/quiz-draft";
import { clearLocalStamps, deleteStamps } from "@/lib/stamps-client";
import { clearVisited, deleteVisited } from "@/lib/visited-cities-client";
import { authClient } from "@/lib/auth/client";
import {
  deleteAccount,
  deleteAccountFeedback,
  deleteAccountPassport,
  deleteAccountQuiz,
  loadFeedback,
  loadHidden,
  saveFeedback,
  unhidePlace,
  HIDDEN_KEY, feedbackKey, hiddenKey,
  type Hidden,
} from "@/lib/account";

// Settings & privacy: everything that changes or removes what Beesyde keeps about you.
function OwnedPassportSettings() {
  const live=useRef(true);useEffect(()=>{live.current=true;return()=>{live.current=false;};},[]);
  const travel = useTravelState();
  const openQuiz = useQuizPanel();
  const passport = usePassportState();
  const [feedback, setFeedback] = useState<Feedback>({ votes: [], dismissed: [] }),
    [hidden, setHidden] = useState<Hidden[]>([]),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [ready, setReady] = useState(false);
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  useEffect(() => setReady(true), []);
  useEffect(() => {
    if (!ready) return;
    let active = true;
    loadHidden(!!userId,userId)
      .then((list) => active && setHidden(list))
      .catch((e) => active && setStatus((e as Error).message));
    loadFeedback(!!userId,userId)
      .then((fb) => active && setFeedback(fb))
      .catch((e) => active && setStatus((e as Error).message));
    return () => {
      active = false;
    };
  }, [ready, userId]);

  async function undoSignal(tagId: string, name: string) {
    const next = dismissTag(feedback, tagId);
    setFeedback(next);
    try {
      await saveFeedback(next, !!userId,userId);
      setStatus(`"${name}" no longer steers your results.`);
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  async function showAgain(place: Hidden) {
    try {
      await unhidePlace(place.id, !!userId,userId);
      setHidden((list) => list.filter((h) => h.id !== place.id));
      setStatus(`${place.name} can appear in your picks again.`);
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  async function erase() {
    (document.querySelector("#erase-passport") as HTMLDialogElement).close();
    if (userId) {
      setBusy(true);
      try {
        await discardPendingPassport(userId);
        if(!live.current)return;
        await deleteAccountPassport(userId);
        if(!live.current)return;
        await deleteAccountQuiz(userId);
        if(!live.current)return;
        await deleteAccountFeedback(userId);
        if(!live.current)return;
        await deleteStamps(userId);
        if(!live.current)return;
        await deleteVisited(userId);
        if(!live.current)return;
      } catch (e) {
        setStatus((e as Error).message);
        setBusy(false);
        return;
      }
      setBusy(false);
    }
    try {
      if (!userId) { await discardPendingPassport(); await deleteStamps(); await deleteVisited("guest"); }
      localStorage.removeItem(searchKey(userId||"guest"));
      localStorage.removeItem(LIVE_PASSPORT_KEY);
      localStorage.removeItem("tpd-passport-v1");
      localStorage.removeItem("tpd-design-v1");
      localStorage.removeItem(QUIZ_KEY);
      deleteQuizDraft(userId || "guest");
      localStorage.removeItem(feedbackKey(userId));
      window.dispatchEvent(new Event(PASSPORT_CHANGED));
      setStatus(
        userId
          ? "Passport deleted from your account and this browser."
          : "Your Passport and earlier browser copies have been deleted from this device.",
      );
    } catch {
      setStatus("Could not clear browser storage. Use browser settings to remove saved data.");
    }
    setFeedback({ votes: [], dismissed: [] });
  }
  async function removeAccount() {
    (document.querySelector("#delete-account") as HTMLDialogElement).close();
    setBusy(true);
    setStatus("Deleting your account…");
    try {
      await discardPendingPassport(userId);
        if(!live.current)return;
      await deleteAccount(userId);
        if(!live.current)return;
    } catch (e) {
      setStatus((e as Error).message);
      setBusy(false);
      return;
    }
    try {
      // The server cascade already removed the account's stamps. Clear the
      // browser's pending copy without another authenticated request.
      clearLocalStamps(userId);
      if (userId) clearVisited(userId);
      clearVisited("guest");
      clearLocalStamps();
      if (userId) deleteQuizDraft(userId);
      deleteQuizDraft("guest");
      localStorage.removeItem("beesyde-travel-v1:guest");
      localStorage.removeItem(searchKey(userId||"guest"));
      localStorage.removeItem(LIVE_PASSPORT_KEY);
      localStorage.removeItem(hiddenKey(userId));
      localStorage.removeItem(QUIZ_KEY);
      localStorage.removeItem(feedbackKey(userId));
    } catch {
      setStatus(
        "Your account is deleted. This browser's copy could not be cleared: remove it in browser settings.",
      );
      return;
    }
    location.assign("/passport");
  }

  return (
    <>

      <section className="passport-settings-leaf" data-travel-page>
        <div className="page-head passport-leaf-heading">
          <PassportSecurityLines />
          <Link className="meta" href="/passport">
            <ActionIcon name="left" /> Your Passport
          </Link>
          <h1>Settings &amp; privacy</h1>
          <p className="lead">
            See what Beesyde has learned from you, and change or delete any of it.
          </p>
        </div>
      <section className="travel-panel"><h2>Trip organisation &amp; visit feedback</h2><p>Private groups, order and visits are separate from your Passport and saved notes.</p><button className="btn btn-secondary" disabled={travel.busy||!travel.ready} onClick={()=>void travel.change(emptyTravel())}>Clear trip organisation and visits</button>{travel.error&&<p role="alert">{travel.error}</p>}</section>
        <p role="status" aria-live="polite">
          {status}
        </p>
        <section className="divider" aria-labelledby="settings-taste-title">
          <h2 id="settings-taste-title">Your taste profile</h2>
          <p className="muted">Your quiz describes how you like to travel. Revisit it whenever your tastes change.</p>
          <button className="btn btn-secondary" disabled={busy || !passport.loaded || passport.state === "saving"} onClick={event=>{event.currentTarget.focus();openQuiz();}}>{Object.keys(passport.quiz).length ? "Redo the quiz" : "Take the quiz"}</button>
        </section>
        <div className="divider">
          <span className="meta">Learned from you</span>
          {feedback.votes.length > 0 ? (
            <LearnedFromYou feedback={feedback} onUndo={undoSignal} busy={busy} />
          ) : (
            <p className="muted">
              Nothing yet. Save places you like or choose Not for me. The tastes you keep choosing will show up here.
            </p>
          )}
        </div>
        <div className="divider">
          <span className="meta">Hidden from your picks</span>
          {hidden.length > 0 ? (
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
          ) : (
            <p className="muted">No hidden places. When you choose Not for me on a place, you can bring it back here.</p>
          )}
        </div>
        <div className="divider">
          <span className="meta">Your Passport</span>
          <p className="muted">
            {userId
              ? "Your Passport is saved to your account and this browser."
              : "Your Passport is saved on this browser only. Sign in to keep it across devices."}
          </p>
          <button
            className="btn btn-quiet"
            disabled={!ready || busy}
            onClick={event=>{event.currentTarget.focus();(document.querySelector("#erase-passport") as HTMLDialogElement).showModal();}}
          >
            {userId ? "Delete my Passport" : "Delete my local Passport"}
          </button>
        </div>
        {userId && (
          <div className="divider">
            <span className="meta">Your account</span>
            <p className="muted">
              Deleting your account removes your Passport, saved lists and hidden places from Beesyde, and signs you
              out.
            </p>
            <button
              className="btn btn-quiet"
              disabled={busy}
              onClick={event=>{event.currentTarget.focus();(document.querySelector("#delete-account") as HTMLDialogElement).showModal();}}
            >
              Delete my account
            </button>
          </div>
        )}
      </section>
      <dialog id="erase-passport">
        <h2>{userId ? "Delete your Passport?" : "Delete your Passport from this device?"}</h2>
        <p>
          {userId
            ? "This removes your Passport, learned tastes and stamps from your account and this browser."
            : "This removes your Passport, learned tastes, stamps and earlier browser copies from this device."}{" "}
          This cannot be undone.
        </p>
        <div className="actions">
          <button className="btn btn-secondary" onClick={erase}>
            Delete Passport
          </button>
          <button
            className="btn btn-quiet"
            onClick={() => (document.querySelector("#erase-passport") as HTMLDialogElement).close()}
          >
            Keep my Passport
          </button>
        </div>
      </dialog>
      <dialog id="delete-account">
        <h2>Delete your account?</h2>
        <p>
          This permanently deletes your Beesyde account with its Passport, saved lists and hidden places. Your Google
          account is not affected. This cannot be undone.
        </p>
        <div className="actions">
          <button className="btn btn-secondary" onClick={removeAccount}>
            Delete my account
          </button>
          <button
            className="btn btn-quiet"
            onClick={() => (document.querySelector("#delete-account") as HTMLDialogElement).close()}
          >
            Keep my account
          </button>
        </div>
      </dialog>
    </>
  );
}

export function PassportSettings(){const {data:session,isPending}=authClient.useSession();return isPending?<p role="status">Opening your Passport…</p>:<OwnedPassportSettings key={session?.user?.id||'guest'}/>;}
