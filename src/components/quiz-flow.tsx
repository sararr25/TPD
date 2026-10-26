"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motionTokens as m } from "@/lib/motion-tokens";
import { QuizIcon } from "./quiz-icon";
import {
  QUESTIONS,
  BOTH,
  ENTITY_CARDS,
  SLIDER_STOPS,
  MIN_ENTITIES,
  MAX_ENTITIES,
  likedEntities,
  type Answers,
  type Card,
  type Question,
} from "@/lib/quiz";

gsap.registerPlugin(useGSAP);

// One question per screen. After the last one, if fewer than three artists
// or films were liked, a top-up screen asks for a few more so the Passport
// can be used in Swap.
export function QuizFlow({
  busy,
  onFinish,
  onCancel,
}: {
  busy: boolean;
  onFinish: (answers: Answers, cards: string[]) => void;
  onCancel?: () => void;
}) {
  const [step, setStep] = useState(0),
    [answers, setAnswers] = useState<Answers>({}),
    [extra, setExtra] = useState<string[]>([]);
  const total = QUESTIONS.length;
  const direction = useRef(1);
  const visitedStep = useRef(false);
  const leaf = useRef<HTMLElement>(null);
  useEffect(() => {
    if (visitedStep.current) leaf.current?.querySelector<HTMLElement>("#quiz-title")?.focus({ preventScroll: true });
    visitedStep.current = true;
  }, [step]);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".quiz-question-leaf", { x: direction.current * m.distance.reveal, opacity: .3, duration: m.duration.reveal, ease: m.ease.enter, clearProps: "transform,opacity" });
    });
    return () => media.revert();
  }, { scope: leaf, dependencies: [step], revertOnUpdate: true });
  const topUp = step >= total;
  const question = QUESTIONS[step];
  function leave(value: Answers[string] | undefined) {
    direction.current = 1;
    const next = { ...answers };
    if (value === undefined) delete next[question.id];
    else next[question.id] = value;
    setAnswers(next);
    if (step < total - 1) return setStep(step + 1);
    const cards = likedEntities(next);
    if (cards.length >= MIN_ENTITIES) onFinish(next, cards.slice(0, MAX_ENTITIES));
    else setStep(total);
  }
  return (
    <section className="quiz" aria-labelledby="quiz-title" ref={leaf}>
      <div className="row quiz-topline">
        <span className="quiz-wordmark">Your taste, on paper.</span>
        <span className="quiz-step-count" aria-label={topUp ? "Final favourites" : `Question ${step + 1} of ${total}`}>{topUp ? "Almost there" : `${step + 1} / ${total}`}</span>
        {onCancel && (
          <button className="btn btn-quiet" disabled={busy} onClick={onCancel}>
            Close quiz
          </button>
        )}
      </div>
      <div
        className="quiz-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={Math.min(step, total)}
        aria-label="Quiz progress"
      >
        <span style={{ transform: `scaleX(${Math.min(step, total) / total})` }} />
      </div>
      <div className="quiz-question-leaf">
      {topUp ? (
        <TopUp
          liked={likedEntities(answers)}
          extra={extra}
          setExtra={setExtra}
          busy={busy}
          onDone={() =>
            onFinish(answers, [...likedEntities(answers), ...extra].slice(0, MAX_ENTITIES))
          }
        />
      ) : (
        <QuestionScreen
          key={question.id}
          question={question}
          value={answers[question.id]}
          busy={busy}
          onLeave={leave}
          onBack={step > 0 ? () => { direction.current = -1; setStep(step - 1); } : undefined}
        />
      )}
      </div>
    </section>
  );
}

function QuestionScreen({
  question: q,
  value: saved,
  busy,
  onLeave,
  onBack,
}: {
  question: Question;
  value: Answers[string] | undefined;
  busy: boolean;
  // Moves on, keeping this value as the answer (undefined = skipped).
  onLeave: (v: Answers[string] | undefined) => void;
  onBack?: () => void;
}) {
  const [value, setValue] = useState(saved);
  const nav = (
    <div className="actions quiz-navigation">
      {onBack && (
        <button className="btn btn-quiet" disabled={busy} onClick={onBack}>
          ← Back
        </button>
      )}
      <button className="btn btn-quiet" disabled={busy} onClick={() => onLeave(undefined)}>
        Skip
      </button>
    </div>
  );
  if (q.kind === "slider") {
    const v = typeof value === "number" ? value : Math.ceil(SLIDER_STOPS / 2);
    return (
      <>
        <h2 id="quiz-title" tabIndex={-1}>{q.title}</h2>
        <div className="quiz-slider">
          <span>
            <QuizIcon emoji={q.left.emoji} /> {q.left.label}
          </span>
          <input
            type="range"
            min={1}
            max={SLIDER_STOPS}
            step={1}
            value={v}
            disabled={busy}
            aria-label={`${q.title}: 1 is ${q.left.label}, ${SLIDER_STOPS} is ${q.right.label}`}
            onChange={(e) => setValue(Number(e.target.value))}
          />
          <span>
            <QuizIcon emoji={q.right.emoji} /> {q.right.label}
          </span>
        </div>
        <div className="actions">
          <button className="btn btn-primary" disabled={busy} onClick={() => onLeave(v)}>
            Next
          </button>
        </div>
        {nav}
      </>
    );
  }
  if (q.kind === "this-or-that")
    return (
      <>
        <h2 id="quiz-title" tabIndex={-1}>{q.title}</h2>
        <div className="quiz-pair">
          {q.options.map((o, i) => (
            <button
              key={o.id}
              className="quiz-tile"
              disabled={busy}
              aria-pressed={value === o.id}
              onClick={() => onLeave(o.id)}
            >
              <QuizIcon emoji={o.emoji} />
              {o.label}
              {i === 0 && <span className="quiz-or" aria-hidden>or</span>}
            </button>
          ))}
        </div>
        <div className="actions quiz-both">
          <button
            className="toggle"
            disabled={busy}
            aria-pressed={value === BOTH}
            onClick={() => onLeave(BOTH)}
          >
            Both, it depends on the day
          </button>
        </div>
        {nav}
      </>
    );
  if (q.kind === "pick") {
    const picked = Array.isArray(value) ? value : [];
    return (
      <>
        <h2 id="quiz-title" tabIndex={-1}>{q.title}</h2>
        <p>Choose up to {q.max}.</p>
        <div className="quiz-grid">
          {q.options.map((o) => {
            const on = picked.includes(o.id);
            return (
              <button
                key={o.id}
                className="quiz-tile"
                aria-pressed={on}
                disabled={busy || (!on && picked.length >= q.max)}
                onClick={() =>
                  setValue((v) => {
                    const list = Array.isArray(v) ? v : [];
                    if (list.includes(o.id)) return list.filter((x) => x !== o.id);
                    return list.length < q.max ? [...list, o.id] : list;
                  })
                }
              >
                <QuizIcon emoji={o.emoji} />
                {o.label}
              </button>
            );
          })}
        </div>
        <div className="actions">
          <button className="btn btn-primary" disabled={busy || !picked.length} onClick={() => onLeave(picked)}>
            {picked.length} / {q.max} · Next
          </button>
        </div>
        {nav}
      </>
    );
  }
  return (
    <>
      <h2 id="quiz-title" tabIndex={-1}>{q.title}</h2>
      <SwipeDeck cards={q.cards} busy={busy} onDone={onLeave} />
      {nav}
    </>
  );
}

// Swipe right (or →, or "Yes") to keep a card, left (←, "No") to pass.
function SwipeDeck({
  cards,
  busy,
  onDone,
}: {
  cards: Card[];
  busy: boolean;
  onDone: (yes: string[]) => void;
}) {
  const [index, setIndex] = useState(0), [yes, setYes] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const node = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ x: number; y: number; lastX: number; time: number; velocity: number; dx: number } | null>(null);
  const locked = useRef(false);
  const pending = useRef<(() => void) | null>(null);
  const card = cards[index];
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => { if (completed) node.current?.focus({ preventScroll: true }); }, [completed]);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => {
      if (!query.matches || !node.current) return;
      gesture.current = null;
      gsap.killTweensOf(node.current);
      gsap.set(node.current, { clearProps: "transform,opacity" });
      node.current.dataset.lean = "";
      pending.current?.();
    };
    query.addEventListener("change", stop);
    return () => query.removeEventListener("change", stop);
  }, []);
  useGSAP(() => {
    locked.current = false;
    if (!node.current) return;
    gsap.set(node.current, { clearProps: "transform,opacity" });
    if (!reduced()) gsap.from(node.current, { opacity: .3, y: m.distance.small, duration: m.duration.panel, clearProps: "transform,opacity" });
    return () => { if (node.current) gsap.killTweensOf(node.current); };
  }, { scope: node, dependencies: [index], revertOnUpdate: true });
  function decide(keep: boolean) {
    if (busy || locked.current || !card) return;
    locked.current = true;
    const finish = () => {
      if (pending.current !== finish) return;
      pending.current = null;
      const nextYes = keep ? [...yes, card.id] : yes;
      setYes(nextYes);
      if (index + 1 >= cards.length) { setCompleted(true); onDone(nextYes); }
      else setIndex(index + 1);
    };
    pending.current = finish;
    if (reduced() || !node.current) finish();
    else gsap.to(node.current, { x: keep ? m.distance.drag * 2 : -m.distance.drag * 2, opacity: 0, duration: m.duration.exit, ease: m.ease.leave, onComplete: finish });
  }
  function settle() {
    if (node.current) gsap.to(node.current, { x: 0, rotation: 0, duration: reduced() ? 0 : m.duration.panel, ease: m.ease.settle, clearProps: "transform" });
  }
  if (completed) return <div className="quiz-deck-complete" ref={node} tabIndex={-1}>
    <p>Your choices are ready.</p>
    <button className="btn btn-primary" disabled={busy} onClick={() => onDone(yes)}>{busy ? "Building your Passport…" : "Continue"}</button>
  </div>;
  if (!card) return null;
  return (
    <div className="swipe">
      <p className="quiz-deck-help">{index + 1} / {cards.length} · Swipe, use the arrow keys, or choose below.</p>
      <div ref={node} className="swipe-card paper" tabIndex={0} role="group"
        aria-label={`${card.label}${card.note ? `, ${card.note}` : ""}. Use the left and right arrow keys, or the buttons below.`}
        onPointerDown={e => {
          if (busy || locked.current) return;
          gsap.killTweensOf(e.currentTarget);
          gesture.current = { x: e.clientX, y: e.clientY, lastX: e.clientX, time: performance.now(), velocity: 0, dx: 0 };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={e => {
          const g = gesture.current;
          if (!g) return;
          const now = performance.now();
          g.dx = e.clientX - g.x;
          g.velocity = (e.clientX - g.lastX) / Math.max(1, now - g.time) * 1000;
          g.lastX = e.clientX; g.time = now;
          if (Math.abs(e.clientY - g.y) > Math.abs(g.dx)) return;
          if (!reduced()) gsap.set(e.currentTarget, { x: g.dx, rotation: g.dx / 35 });
          e.currentTarget.dataset.lean = g.dx > m.distance.flick ? "yes" : g.dx < -m.distance.flick ? "no" : "";
        }}
        onPointerUp={e => {
          const g = gesture.current; gesture.current = null;
          if (!g) return;
          e.currentTarget.dataset.lean = "";
          const dx = e.clientX - g.x;
          const horizontal = Math.abs(dx) > Math.abs(e.clientY - g.y) * 1.3;
          const flick = performance.now() - g.time < 100 && Math.abs(dx) >= m.distance.flick && Math.abs(g.velocity) >= m.distance.velocity && Math.sign(g.velocity) === Math.sign(dx);
          if (horizontal && (Math.abs(dx) >= m.distance.drag || flick)) decide(dx > 0);
          else settle();
        }}
        onPointerCancel={e => { gesture.current = null; e.currentTarget.dataset.lean = ""; settle(); }}
        onKeyDown={e => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); decide(e.key === "ArrowRight"); }
        }}>
        <QuizIcon emoji={card.emoji} big />
        <h3>{card.label}</h3>
        {card.note && <p className="muted">{card.note}</p>}
      </div>
      <div className="actions swipe-buttons">
        <button className="btn btn-secondary" disabled={busy} onClick={() => decide(false)}>← No</button>
        <button className="btn btn-primary" disabled={busy} onClick={() => decide(true)}>Yes →</button>
      </div>
    </div>
  );
}

function TopUp({
  liked,
  extra,
  setExtra,
  busy,
  onDone,
}: {
  liked: string[];
  extra: string[];
  setExtra: (v: string[]) => void;
  busy: boolean;
  onDone: () => void;
}) {
  const need = MIN_ENTITIES - liked.length;
  const room = MAX_ENTITIES - liked.length;
  const options = Object.values(ENTITY_CARDS).filter((c) => !liked.includes(c.id));
  return (
    <>
      <h2 id="quiz-title" tabIndex={-1}>Pick {need} more you&apos;d give a try</h2>
      <p>Your Passport needs at least {MIN_ENTITIES} artists or films to find places for you.</p>
      <div className="quiz-grid">
        {options.map((c) => {
          const on = extra.includes(c.id);
          return (
            <button
              key={c.id}
              className="quiz-tile"
              aria-pressed={on}
              disabled={busy || (!on && extra.length >= room)}
              onClick={() => setExtra(on ? extra.filter((x) => x !== c.id) : [...extra, c.id])}
            >
              <QuizIcon emoji={c.emoji} />
              {c.label}
            </button>
          );
        })}
      </div>
      <div className="actions">
        <button className="btn btn-primary" disabled={busy || extra.length < need} onClick={onDone}>
          {busy ? "Building your Passport…" : "Build my Passport"}
        </button>
      </div>
    </>
  );
}

