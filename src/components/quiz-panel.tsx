"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { QuizFlow } from "./quiz-flow";
import { AuthButton } from "./auth-button";
import { authClient } from "@/lib/auth/client";
import { finishQuiz } from "@/lib/quiz-finish";
import type { Answers } from "@/lib/quiz";

// The 18-question quiz as a dialog that opens over any page. Closing or
// finishing leaves the page where it was: no navigation. At the end it offers
// Google sign-in so the Passport follows the user across devices (ADR 0002).
export const QUIZ_CTA = "Make your Passport";

const QuizPanelContext = createContext<(() => void) | null>(null);

export function useQuizPanel(): () => void {
  const open = useContext(QuizPanelContext);
  if (!open) throw new Error("useQuizPanel must be used inside <QuizPanelProvider>");
  return open;
}

export function QuizPanelProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false),
    [done, setDone] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const origin = useRef<HTMLElement | null>(null);
  const { data: session, isPending } = authClient.useSession();
  const signedIn = !!session?.user?.id;
  const owner = session?.user?.id || "guest";
  const currentOwner = useRef(owner), ownerGeneration = useRef(0);
  if (currentOwner.current !== owner) { currentOwner.current = owner; ownerGeneration.current++; }
  const openedOwner = useRef(owner);
  const queuedOpen = useRef(false);
  useEffect(() => {
    setOpen(false); setDone(false); setBusy(false); setError("");
  }, [owner]);
  useEffect(() => {
    if (!isPending && queuedOpen.current) { queuedOpen.current = false; show(); }
  }, [isPending, owner]);
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      el.querySelector<HTMLElement>("#quiz-title")?.focus({ preventScroll: true });
    }
    if (!open && el.open) el.close();
  }, [open]);
  useEffect(() => {
    if (done) dialog.current?.querySelector<HTMLElement>(".quiz-done h2")?.focus({ preventScroll: true });
  }, [done]);
  function show() {
    if (isPending) { queuedOpen.current = true; return; }
    origin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    openedOwner.current = owner;
    setDone(false);
    setError("");
    setOpen(true);
  }
  async function onFinish(answers: Answers, cards: string[]) {
    const submittedOwner = owner;
    const submittedGeneration = ownerGeneration.current;
    const isCurrent = () => currentOwner.current === submittedOwner && ownerGeneration.current === submittedGeneration;
    setBusy(true);
    setError("");
    try {
      await finishQuiz(answers, cards, session?.user?.id || false, isCurrent);
      if (!isCurrent()) return false;
      setDone(true);
      return true;
    } catch (e) {
      if (isCurrent()) setError((e as Error).message);
      return false;
    } finally {
      if (isCurrent()) setBusy(false);
    }
  }
  return (
    <QuizPanelContext.Provider value={show}>
      {children}
      <dialog
        ref={dialog}
        className="quiz-panel"
        aria-label="Make your Passport"
        onCancel={e => { if (busy) e.preventDefault(); }}
        onClose={() => {
          setOpen(false);
          const target = origin.current?.isConnected ? origin.current : document.querySelector<HTMLElement>(".pf-cover h1, main h1");
          if (target) { if (!target.hasAttribute("tabindex") && target.tagName === "H1") target.tabIndex = -1; target.focus({ preventScroll: true }); }
        }}
      >
        {open && openedOwner.current === owner &&
          (done ? (
            <section className="quiz-done">
              <h2 tabIndex={-1}>Your Passport is ready.</h2>
              {signedIn ? (
                <p>It is saved to your account.</p>
              ) : (
                <>
                  <p>
                    <strong>Save your Passport on every device.</strong> Sign in with Google and it
                    follows you. Or skip it: it stays on this browser.
                  </p>
                  <AuthButton label="Save with Google" />
                </>
              )}
              <div className="actions">
                <button className="btn btn-primary" onClick={() => setOpen(false)}>
                  Back to where I was
                </button>
              </div>
            </section>
          ) : (
            <>
              <QuizFlow key={owner} draftOwner={owner} busy={busy} onFinish={onFinish} onCancel={() => setOpen(false)} />
              <p role="alert">{error}</p>
            </>
          ))}
      </dialog>
    </QuizPanelContext.Provider>
  );
}

// The one Passport call to action. Same label everywhere.
export function OpenQuizButton({ className = "btn btn-primary" }: { className?: string }) {
  const show = useQuizPanel();
  return (
    <button type="button" className={className} onClick={show}>
      {QUIZ_CTA}
    </button>
  );
}
