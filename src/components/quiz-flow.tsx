"use client";
import {motionTokens as m} from "@/lib/motion-tokens";
import { ActionIcon } from "./action-icon";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { QuizArtwork } from "./quiz-artwork";
import { BOTH, ENTITY_CARDS, MIN_ENTITIES, MAX_ENTITIES, likedEntities, type Answers } from "@/lib/quiz";
import { QUIZ_ORDER as ordered, readQuizDraft, saveQuizDraft, deleteQuizDraft, readQuizMuted, saveQuizMuted } from "@/lib/quiz-draft";

const motion = { fade: m.duration.panel, exit: m.duration.panel, settle: m.duration.panel, ease: m.ease.enter };
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
type Gesture = { x: number; y: number; lastX: number; time: number; velocity: number; axis: "x" | "y" | null };

export function QuizFlow({ busy, onFinish, onCancel, draftOwner }: {
  busy: boolean;
  onFinish: (answers: Answers, cards: string[]) => Promise<boolean>;
  onCancel?: () => void;
  draftOwner: string;
}) {
  const [started, setStarted] = useState(false), [step, setStep] = useState(0), [answers, setAnswers] = useState<Answers>({});
  const [history, setHistory] = useState<Record<string, boolean[]>>({}), [extra, setExtra] = useState<string[]>([]);
  const [muted, setMuted] = useState(readQuizMuted), [message, setMessage] = useState("");
  const [savedDraft, setSavedDraft] = useState(() => readQuizDraft(draftOwner));
  const [draftUnavailable, setDraftUnavailable] = useState(false);
  const root = useRef<HTMLElement>(null), cardNode = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null), gesture = useRef<Gesture | null>(null);
  const locked = useRef(false), alive = useRef(true), pendingDecision = useRef<(() => void) | null>(null);
  const audio = useRef<AudioContext | null>(null), mutedRef = useRef(muted), soundClosing = useRef<ReturnType<typeof setTimeout> | null>(null);
  const q = ordered[step], final = step >= ordered.length;
  const hist = q ? history[q.id] ?? [] : [], deck = q?.kind === "swipe" ? q.cards : [], card = deck[hist.length];
  const seeds = likedEntities(answers);
  const validExtra = extra.filter(id => !seeds.includes(id)).slice(0, Math.max(0, MAX_ENTITIES - seeds.length));
  const selectedFavourites = [...new Set([...seeds, ...validExtra])].slice(0, MAX_ENTITIES);
  const remaining = Math.max(0, MIN_ENTITIES - selectedFavourites.length);
  useEffect(() => {
    if (started && !busy) setDraftUnavailable(!saveQuizDraft(draftOwner, { step, answers, history, extra }));
  }, [started, busy, draftOwner, step, answers, history, extra]);
  function begin(resume: boolean) {
    if (resume && savedDraft) {
      setStep(savedDraft.step); setAnswers(savedDraft.answers); setHistory(savedDraft.history); setExtra(savedDraft.extra);
    } else {
      setStep(0); setAnswers({}); setHistory({}); setExtra([]);
    }
    setSavedDraft(null); setMessage(""); setStarted(true);
    // Resuming never produces an unsolicited start sound.
    if (!resume) play("start");
  }
  function cancelAdvance() { if (timer.current) clearTimeout(timer.current); timer.current = null; }
  function play(kind: "start" | "result") {
    if (mutedRef.current || document.hidden) return;
    try {
      audio.current ??= new AudioContext();
      const ctx = audio.current;
      if (ctx.state === "suspended") void ctx.resume().catch(() => {});
      const tones = kind === "start" ? [440, 550] : [440, 550, 660];
      tones.forEach((frequency, index) => {
        const osc = ctx.createOscillator(), gain = ctx.createGain(), at = ctx.currentTime + index * .075;
        osc.type = "sine"; osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(.035, at + .01); gain.gain.exponentialRampToValueAtTime(.0001, at + .2);
        osc.connect(gain); gain.connect(ctx.destination); osc.start(at); osc.stop(at + .21);
      });
    } catch { /* Audio is optional; never interrupt the quiz. */ }
  }
  useEffect(() => {
    alive.current = true;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (soundClosing.current) clearTimeout(soundClosing.current);
    const hide = () => { if (document.hidden) cancelAdvance(); };
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => {
      if (!media.matches) return;
      gesture.current = null;
      const body = root.current?.querySelector(".taste-body");
      if (body) { gsap.killTweensOf(body); gsap.set(body, { clearProps: "transform,opacity" }); }
      if (cardNode.current) { gsap.killTweensOf(cardNode.current); gsap.set(cardNode.current, { clearProps: "transform,opacity" }); cardNode.current.dataset.intent = ""; }
      pendingDecision.current?.();
    };
    media.addEventListener("change", stop); document.addEventListener("visibilitychange", hide);
    return () => {
      alive.current = false; document.body.style.overflow = previousOverflow; cancelAdvance(); pendingDecision.current = null;
      media.removeEventListener("change", stop); document.removeEventListener("visibilitychange", hide);
      if (cardNode.current) gsap.killTweensOf(cardNode.current);
      soundClosing.current = setTimeout(() => { void audio.current?.close().catch(() => {}); }, 650);
    };
  }, []);
  useEffect(() => {
    root.current?.querySelector<HTMLElement>("#quiz-title")?.focus({ preventScroll: true });
  }, [step, started]);
  useEffect(() => {
    locked.current = false;
    if (cardNode.current) gsap.set(cardNode.current, { clearProps: "transform,opacity" });
    if (!reduced() && root.current) {
      const tween = gsap.fromTo(root.current.querySelector(".taste-body"), { opacity: .4, y: 6 }, { opacity: 1, y: 0, duration: motion.fade, ease: motion.ease });
      return () => { tween.kill(); };
    }
  }, [step, started, hist.length]);
  useEffect(() => { if (started && cardNode.current) cardNode.current.focus({ preventScroll: true }); }, [hist.length]);
  function schedule(action: () => void, delay = 1050) {
    cancelAdvance(); timer.current = setTimeout(() => { timer.current = null; if (alive.current && !document.hidden && !busy) action(); }, delay);
  }
  function move(next: number) { if (busy || locked.current) return; cancelAdvance(); setMessage(""); setStep(Math.max(0, Math.min(ordered.length, next))); }
  function store(value: Answers[string] | undefined) {
    const next = { ...answers };
    if (value === undefined) delete next[q.id]; else next[q.id] = value;
    setAnswers(next); return next;
  }
  async function finish() {
    if (busy || locked.current) return;
    cancelAdvance(); locked.current = true; setMessage("Building your Passport…");
    try {
      const ok = await onFinish(answers, selectedFavourites);
      if (ok) { try { deleteQuizDraft(draftOwner); } catch { /* A blocked browser cannot remove its old draft. */ } play("result"); }
      else if (alive.current) setMessage("Your choices are still here. Try building your Passport again.");
    } catch { if (alive.current) setMessage("Your choices are still here. Try again."); }
    finally { locked.current = false; }
  }
  function choose(id: string) {
    if (busy || locked.current) return;
    cancelAdvance();
    if (q.kind === "pick") {
      const picked = Array.isArray(answers[q.id]) ? answers[q.id] as string[] : [];
      if (!picked.includes(id) && picked.length >= q.max) { setMessage(`Choose up to ${q.max}. Deselect one first.`); return; }
      const next = picked.includes(id) ? picked.filter(x => x !== id) : [...picked, id];
      store(next); setMessage(`${next.length} / ${q.max} selected`);
      if (next.length === q.max) schedule(() => move(step + 1));
    } else { store(id); setMessage("Noted. Moving on…"); schedule(() => move(step + 1)); }
  }
  function feedback(dx: number) {
    const el = cardNode.current; if (!el) return;
    el.dataset.intent = Math.abs(dx) < 12 ? "" : dx > 0 ? "yes" : "no";
    const status = root.current?.querySelector<HTMLElement>("[data-drag-status]");
    if (status) status.textContent = Math.abs(dx) < 12 ? "Drag right for yes, left for no" : `${dx > 0 ? "YES · Keep" : "NO · Pass"}${Math.abs(dx) >= 70 ? " — release to confirm" : " — keep dragging"}`;
  }
  function settle() {
    gesture.current = null; feedback(0);
    if (cardNode.current) gsap.to(cardNode.current, { x: 0, y: 0, rotation: 0, duration: reduced() ? 0 : motion.settle, ease: motion.ease, overwrite: true });
  }
  function decide(yes: boolean) {
    if (busy || locked.current || !card) return;
    cancelAdvance(); locked.current = true; gesture.current = null; feedback(yes ? 100 : -100);
    const done = () => {
      if (pendingDecision.current !== done) return;
      pendingDecision.current = null;
      const next = [...hist, yes]; setHistory(h => ({ ...h, [q.id]: next }));
      store(deck.filter((_, i) => next[i]).map(c => c.id));
      locked.current = false;
      if (next.length === deck.length) schedule(() => move(step + 1), 850);
    };
    pendingDecision.current = done;
    if (reduced() || !cardNode.current) done();
    else gsap.to(cardNode.current, { x: (yes ? 1 : -1) * Math.max(450, window.innerWidth * .6), rotation: yes ? 12 : -12, opacity: 0, duration: motion.exit, ease: "power2.in", onComplete: done });
  }
  function undo() {
    if (busy || locked.current || !hist.length) return;
    cancelAdvance(); const next = hist.slice(0, -1); setHistory(h => ({ ...h, [q.id]: next })); store(deck.filter((_, i) => next[i]).map(c => c.id));
  }
  const value = q ? answers[q.id] : undefined;
  const canContinue = q?.kind === "swipe" || (q?.kind === "pick" ? Array.isArray(value) && value.length > 0 : value !== undefined);
  return <section className="taste-quiz" ref={root} aria-label="Make your Taste Passport" aria-busy={busy}
    onKeyDown={event => {
      if (event.key === "Escape" && onCancel) { event.preventDefault(); event.stopPropagation(); if (!busy) { cancelAdvance(); onCancel(); } }
      if (event.key !== "Tab") return;
      const controls = [...event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), [tabindex='0']")];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement?.id === "quiz-title")) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}>
    <header className="taste-top"><span className="taste-brand">beesyde<span>.</span></span><span className="taste-counter">{started ? final ? "Final favourites" : `${step + 1} / ${ordered.length}` : "About 3 minutes"}</span>
      <button type="button" className="taste-text" aria-pressed={muted} onClick={() => { mutedRef.current = !muted; setMuted(!muted); saveQuizMuted(!muted); }}>{muted ? "Sound off" : "Sound on"}</button>
      {onCancel && <button type="button" className="taste-text" disabled={busy} onClick={() => { cancelAdvance(); onCancel(); }}>Close quiz</button>}
    </header>
    <div className="taste-progress" role="progressbar" aria-label="Quiz progress" aria-valuemin={0} aria-valuemax={ordered.length} aria-valuenow={started ? step : 0}><i style={{ transform: `scaleX(${started ? step / ordered.length : 0})` }} /></div>
    {!started ? <div className="taste-body taste-intro"><div><p className="taste-kicker">A little instinct. A lot of you.</p><h2 id="quiz-title" tabIndex={-1}>Your taste.<br /><em>Your kind of city.</em></h2><p>Swipe what moves you. Pick what pulls you in.</p><p>18 questions. About 3 minutes.</p>{savedDraft ? <div className="taste-resume"><p>Your unfinished quiz is saved on this browser.</p><button type="button" className="taste-primary" onClick={() => begin(true)}>Continue your quiz</button><button type="button" className="taste-text" onClick={() => begin(false)}>Start again</button></div> : <button type="button" className="taste-primary" onClick={() => begin(false)}>Start my quiz <ActionIcon name="external" /></button>}</div><div className="taste-intro-art"><QuizArtwork id="khruangbin" /></div></div> : final ? <div className="taste-body taste-final"><div><p className="taste-kicker">One last detail</p><h2 id="quiz-title" tabIndex={-1}>{remaining ? (selectedFavourites.length ? `${remaining} more to go` : "Choose 3 favourites to finish") : "Your choices are ready."}</h2><p>Choose 3–5 artists or films you love for personal picks.</p><p role="status" aria-live="polite">{selectedFavourites.length} of 5 selected</p></div><div className="taste-grid taste-topup">{Object.values(ENTITY_CARDS).filter(c => !seeds.includes(c.id)).map(c => <button key={c.id} type="button" className="taste-tile" disabled={busy || (!validExtra.includes(c.id) && selectedFavourites.length >= MAX_ENTITIES)} aria-pressed={validExtra.includes(c.id)} onClick={() => setExtra(validExtra.includes(c.id) ? validExtra.filter(x => x !== c.id) : [...validExtra, c.id])}><QuizArtwork id={c.id} /><span>{c.label}</span></button>)}</div></div> : <div className={`taste-body taste-${q.kind}`}><div className="taste-question"><p className="taste-kicker">Follow your instinct</p><h2 id="quiz-title" tabIndex={-1}>{q.title}</h2><p>{q.kind === "pick" ? `Choose up to ${q.max}. Your last pick moves you on.` : q.kind === "swipe" ? "Swipe right for yes. Left for no." : "Choose one to continue automatically."}</p></div>
      {q.kind === "slider" ? <div className="taste-scale"><div className="taste-scale-labels"><span>{q.left.label}</span><span>{q.right.label}</span></div><div className="taste-stops" role="group" aria-label={q.title}>{[1, 2, 3, 4, 5].map(n => <button key={n} type="button" disabled={busy} aria-pressed={value === n} aria-label={`${n}: ${n < 3 ? q.left.label : n > 3 ? q.right.label : "It depends"}`} onClick={() => { if (busy) return; store(n); setMessage("Noted. Moving on…"); schedule(() => move(step + 1)); }}><span aria-hidden>{n === 3 ? "◑" : n < 3 ? "◐" : "◕"}</span>{["Definitely", "Mostly", "It depends", "Mostly", "Definitely"][n - 1]}</button>)}</div></div> : q.kind === "swipe" ? <div className="taste-deck-area"><div className="taste-directions" aria-hidden><span>← NO</span><span>YES <ActionIcon name="right" /></span></div><div className="taste-deck">{card ? <div className="taste-card" ref={cardNode} tabIndex={0} role="group" aria-label={`${card.label}. Right arrow yes, left arrow no.`}
        onPointerDown={e => { if (busy || locked.current || e.button !== 0) return; gsap.killTweensOf(e.currentTarget); gesture.current = { x: e.clientX, y: e.clientY, lastX: e.clientX, time: performance.now(), velocity: 0, axis: null }; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={e => { const g = gesture.current; if (!g || locked.current) return; const dx = e.clientX - g.x, dy = e.clientY - g.y; if (!g.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 8) g.axis = Math.abs(dx) > Math.abs(dy) * 1.2 ? "x" : "y"; if (g.axis !== "x") return; const now = performance.now(); g.velocity = (e.clientX - g.lastX) / Math.max(1, now - g.time); g.lastX = e.clientX; g.time = now; if (!reduced()) gsap.set(e.currentTarget, { x: dx, rotation: dx / 26 }); feedback(dx); }}
        onPointerUp={e => { const g = gesture.current; gesture.current = null; if (!g) return; const dx = e.clientX - g.x; const flick = Math.abs(dx) > 28 && performance.now() - g.time < 100 && Math.abs(g.velocity) > .65 && Math.sign(dx) === Math.sign(g.velocity); if (g.axis === "x" && (Math.abs(dx) >= 70 || flick)) decide(dx > 0); else settle(); }} onPointerCancel={settle}
        onKeyDown={e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); decide(e.key === "ArrowRight"); } }}>
        <span className="taste-deck-count">{hist.length + 1} / {deck.length}</span><span className="taste-intent taste-yes" aria-hidden>YES · KEEP</span><span className="taste-intent taste-no" aria-hidden>NO · PASS</span><QuizArtwork id={card.id} /><h3>{card.label}</h3>{card.note && <p>{card.note}</p>}</div> : <div className="taste-card taste-card-complete"><h3>Your choices are ready.</h3><p>Moving to the next question…</p></div>}</div>
        <p className="taste-drag-status" data-drag-status aria-live="polite">Drag right for yes, left for no</p><div className="taste-deck-buttons"><button type="button" className="taste-secondary" disabled={busy || !hist.length} onClick={undo}>Undo</button><button type="button" className="taste-secondary" disabled={busy || !card} onClick={() => decide(false)}><ActionIcon name="left" /> No</button><button type="button" className="taste-secondary" disabled={busy || !card} onClick={() => decide(true)}>Yes <ActionIcon name="right" /></button></div></div> : <div className={`taste-grid ${q.kind === "this-or-that" ? "taste-pair" : ""}`}>{q.options.map(o => { const picked = q.kind === "pick" ? Array.isArray(value) && value.includes(o.id) : value === o.id; return <button type="button" key={o.id} className="taste-tile" aria-pressed={picked} disabled={busy} onClick={() => choose(o.id)}><QuizArtwork id={o.id} /><span>{o.label}<i aria-hidden>{picked && <ActionIcon name="check" />}</i></span></button>; })}{q.kind === "this-or-that" && <button type="button" className="taste-text taste-both" aria-pressed={value === BOTH} disabled={busy} onClick={() => choose(BOTH)}>Both, it depends</button>}</div>}
    </div>}
    {started && <footer className="taste-nav"><button type="button" className="taste-text" disabled={busy || locked.current} onClick={() => { if (step === 0) { cancelAdvance(); setSavedDraft({ step, answers, history, extra }); setStarted(false); } else move(step - 1); }}><ActionIcon name="left" /> Back</button><p className="taste-status" role="status">{draftUnavailable ? "Progress can’t be saved on this browser. Keep this quiz open." : message}</p><div>{!final && <button type="button" className="taste-text" disabled={busy} onClick={() => { if (busy || locked.current) return; cancelAdvance(); store(undefined); if (q.kind === "swipe") setHistory(h => ({ ...h, [q.id]: [] })); move(step + 1); }}>Skip</button>}<button type="button" className="taste-primary" disabled={busy || (final ? selectedFavourites.length < MIN_ENTITIES : !canContinue)} onClick={() => final ? void finish() : move(step + 1)}>{busy ? "Saving…" : final ? "Build my Passport" : <>Continue <ActionIcon name="right" /></>}</button></div></footer>}
  </section>;
}
