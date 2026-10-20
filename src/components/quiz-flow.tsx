"use client";
import { useRef, useState } from "react";
import {
  QUESTIONS,
  ENTITY_CARDS,
  SLIDER_STOPS,
  MIN_ENTITIES,
  MAX_ENTITIES,
  likedEntities,
  type Answers,
  type Card,
  type Question,
} from "@/lib/quiz";

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
  const topUp = step >= total;
  const question = QUESTIONS[step];
  function leave(value: Answers[string] | undefined) {
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
    <section className="quiz" aria-labelledby="quiz-title">
      <div className="row">
        <span className="meta">
          {topUp ? "Almost there" : `Question ${step + 1} / ${total}`}
        </span>
        {onCancel && (
          <button className="text" disabled={busy} onClick={onCancel}>
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
        <span style={{ width: `${(Math.min(step, total) / total) * 100}%` }} />
      </div>
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
          onBack={step > 0 ? () => setStep(step - 1) : undefined}
        />
      )}
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
    <div className="actions">
      {onBack && (
        <button className="text" disabled={busy} onClick={onBack}>
          ← Back
        </button>
      )}
      <button className="text" disabled={busy} onClick={() => onLeave(undefined)}>
        Skip
      </button>
    </div>
  );
  if (q.kind === "slider") {
    const v = typeof value === "number" ? value : Math.ceil(SLIDER_STOPS / 2);
    return (
      <>
        <h2 id="quiz-title">{q.title}</h2>
        <div className="quiz-slider">
          <span>
            <b aria-hidden>{q.left.emoji}</b> {q.left.label}
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
            <b aria-hidden>{q.right.emoji}</b> {q.right.label}
          </span>
        </div>
        <div className="actions">
          <button className="ticket" disabled={busy} onClick={() => onLeave(v)}>
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
        <h2 id="quiz-title">{q.title}</h2>
        <div className="quiz-pair">
          {q.options.map((o, i) => (
            <button
              key={o.id}
              className="quiz-tile"
              disabled={busy}
              aria-pressed={value === o.id}
              onClick={() => onLeave(o.id)}
            >
              <span className="quiz-emoji" aria-hidden>{o.emoji}</span>
              {o.label}
              {i === 0 && <span className="quiz-or" aria-hidden>or</span>}
            </button>
          ))}
        </div>
        {nav}
      </>
    );
  if (q.kind === "pick") {
    const picked = Array.isArray(value) ? value : [];
    return (
      <>
        <h2 id="quiz-title">{q.title}</h2>
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
                <span className="quiz-emoji" aria-hidden>{o.emoji}</span>
                {o.label}
              </button>
            );
          })}
        </div>
        <div className="actions">
          <button className="ticket" disabled={busy || !picked.length} onClick={() => onLeave(picked)}>
            {picked.length} / {q.max} · Next
          </button>
        </div>
        {nav}
      </>
    );
  }
  return (
    <>
      <h2 id="quiz-title">{q.title}</h2>
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
  const [index, setIndex] = useState(0),
    [yes, setYes] = useState<string[]>([]),
    [dx, setDx] = useState(0);
  const start = useRef<number | null>(null);
  const card = cards[index];
  function decide(keep: boolean) {
    const nextYes = keep ? [...yes, card.id] : yes;
    setYes(nextYes);
    setDx(0);
    if (index + 1 >= cards.length) onDone(nextYes);
    else setIndex(index + 1);
  }
  if (!card) return null;
  return (
    <div className="swipe">
      <p className="meta">
        Card {index + 1} / {cards.length} · swipe right for yes, left for no
      </p>
      <div
        className="swipe-card paper"
        tabIndex={0}
        role="group"
        aria-label={`${card.label}${card.note ? `, ${card.note}` : ""}. Use the left and right arrow keys, or the buttons below.`}
        data-lean={dx > 40 ? "yes" : dx < -40 ? "no" : undefined}
        style={{ transform: `translateX(${dx}px) rotate(${dx / 20}deg)` }}
        onPointerDown={(e) => {
          if (busy) return;
          start.current = e.clientX;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => start.current !== null && setDx(e.clientX - start.current)}
        onPointerUp={() => {
          start.current = null;
          if (Math.abs(dx) > 100) decide(dx > 0);
          else setDx(0);
        }}
        onPointerCancel={() => {
          start.current = null;
          setDx(0);
        }}
        onKeyDown={(e) => {
          if (busy) return;
          if (e.key === "ArrowRight") decide(true);
          if (e.key === "ArrowLeft") decide(false);
        }}
      >
        <span className="quiz-emoji big" aria-hidden>{card.emoji}</span>
        <h3>{card.label}</h3>
        {card.note && <p className="muted">{card.note}</p>}
      </div>
      <div className="actions swipe-buttons">
        <button className="stamp" disabled={busy} onClick={() => decide(false)}>
          ← No
        </button>
        <button className="stamp" disabled={busy} onClick={() => decide(true)}>
          Yes →
        </button>
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
      <h2 id="quiz-title">Pick {need} more you&apos;d give a try</h2>
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
              <span className="quiz-emoji" aria-hidden>{c.emoji}</span>
              {c.label}
            </button>
          );
        })}
      </div>
      <div className="actions">
        <button className="ticket" disabled={busy || extra.length < need} onClick={onDone}>
          {busy ? "Building your Passport…" : "Build my Passport"}
        </button>
      </div>
    </>
  );
}
