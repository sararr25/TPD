"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { loadAccountPassport, loadAccountQuiz } from "@/lib/account";
import {
  readSelections,
  selectionExpired,
  type Selection,
} from "@/lib/discovery-client";
import { LIVE_PASSPORT_KEY } from "@/lib/discovery";
import { QUIZ_KEY, parseQuiz, type Answers } from "@/lib/quiz";
import {
  PASSPORT_CHANGED,
  pendingPassport,
  passportSaving,
  retryPassportSave,
  stagePassport,
} from "@/lib/quiz-finish";
import { OpenQuizButton } from "./quiz-panel";

type Snapshot = {
  owner: string;
  selections: Selection[];
  quiz: Answers;
  error: string;
  loaded: boolean;
};
const empty: Snapshot = {
  owner: "",
  selections: [],
  quiz: {},
  error: "",
  loaded: false,
};
type PassportState = Snapshot & {
  state:
    | "loading"
    | "error"
    | "new"
    | "needs-favourites"
    | "ready"
    | "saving"
    | "partial"
    | "expired";
  retry: () => void;
};
const Context = createContext<PassportState | null>(null);
export function PassportStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = authClient.useSession();
  const owner = session?.user?.id || "guest";
  const [snapshot, setSnapshot] = useState(empty);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const refresh = () => setVersion((v) => v + 1);
    window.addEventListener(PASSPORT_CHANGED, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(PASSPORT_CHANGED, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  useEffect(() => {
    if (isPending) return;
    let active = true;
    setSnapshot((previous) =>
      previous.owner === owner ? previous : { ...empty, owner },
    );
    (async () => {
      let selections: Selection[], quiz: Answers;
      if (owner !== "guest") {
        const draft = pendingPassport(owner);
        if (draft) {
          if (active)
            setSnapshot({
              owner,
              selections: draft.choices,
              quiz: draft.answers,
              loaded: true,
              error: "",
            });
          return;
        }
        const [account, answers] = await Promise.all([
          loadAccountPassport(),
          loadAccountQuiz(),
        ]);
        selections = account || [];
        quiz = answers || {};
        // Adopt a genuinely unowned guest copy once, never another account's
        // cached copy. An empty-but-existing account is authoritative.
        if (
          active &&
          account === null &&
          answers === null &&
          !localStorage.getItem("beesyde-passport-owner")
        ) {
          const guest = readSelections(localStorage.getItem(LIVE_PASSPORT_KEY));
          const guestQuiz = parseQuiz(localStorage.getItem(QUIZ_KEY));
          if (guest.length || Object.keys(guestQuiz).length) {
            stagePassport(owner, guest, guestQuiz);
            await retryPassportSave(owner);
            selections = guest;
            quiz = guestQuiz;
          }
        }
      } else {
        const foreign = localStorage.getItem("beesyde-passport-owner");
        selections = foreign
          ? []
          : readSelections(localStorage.getItem(LIVE_PASSPORT_KEY));
        quiz = foreign ? {} : parseQuiz(localStorage.getItem(QUIZ_KEY));
      }
      if (active)
        setSnapshot({ owner, selections, quiz, loaded: true, error: "" });
    })().catch(
      (e) =>
        active &&
        setSnapshot({
          ...empty,
          owner,
          loaded: true,
          error: (e as Error).message,
        }),
    );
    return () => {
      active = false;
    };
  }, [owner, isPending, version]);
  const current = snapshot.owner === owner && !isPending ? snapshot : empty;
  const draft =
    owner !== "guest" && typeof window !== "undefined"
      ? pendingPassport(owner)
      : null;
  const state = !current.loaded
    ? "loading"
    : draft
      ? passportSaving(owner)
        ? "saving"
        : "partial"
      : current.error
        ? "error"
        : current.selections.some((s) => selectionExpired(s))
          ? "expired"
          : current.selections.length >= 3
            ? "ready"
            : current.selections.length || Object.keys(current.quiz).length
              ? "needs-favourites"
              : "new";
  return (
    <Context.Provider
      value={{
        ...current,
        state,
        retry: () => {
          if (draft)
            void retryPassportSave(owner).catch(() => setVersion((v) => v + 1));
          else setVersion((v) => v + 1);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function usePassportState() {
  const value = useContext(Context);
  if (!value) throw new Error("PassportStateProvider is missing");
  return value;
}
export function PassportPrompt({ actionClassName = "btn btn-primary" }: { actionClassName?: string } = {}) {
  const passport = usePassportState();
  if (passport.state === "loading")
    return <p role="status">Loading your Passport…</p>;
  if (passport.state === "error")
    return (
      <p role="status">
        Your Passport couldn’t load.{" "}
        <button className="btn btn-quiet" onClick={passport.retry}>
          Try again
        </button>
      </p>
    );
  if (passport.state === "saving")
    return <p role="status">Saving your Passport to your account…</p>;
  if (passport.state === "partial")
    return (
      <p role="status">
        Your choices are safe on this browser. Your account save is incomplete.{" "}
        <button className="btn btn-secondary" onClick={passport.retry}>
          Retry account save
        </button>
      </p>
    );
  if (passport.state === "expired")
    return (
      <p role="status">
        Your favourites need a refresh. Your quiz is still here.{" "}
        <Link className="btn btn-secondary" href="/passport#passport-editor">
          Refresh favourites
        </Link>
      </p>
    );
  if (passport.state === "ready")
    return (
      <Link className="btn btn-quiet" href="/passport">
        Your Passport is ready
      </Link>
    );
  if (passport.state === "needs-favourites")
    return (
      <p>
        Your profile is here. Add {3 - passport.selections.length} more
        favourites to get personal picks.{" "}
        <Link className="btn btn-secondary" href="/passport#passport-editor">
          Complete your favourites
        </Link>
      </p>
    );
  return <OpenQuizButton className={actionClassName} />;
}
