"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motionTokens as m } from "@/lib/motion-tokens";

// Twin DNA (docs/84 §4): one strand per place, twisted together. Each rung is a
// trait: shared ones are labelled and solid, traits the twin leaves behind are
// broken rungs, so "why they match" reads without extra text.
const W = 640, CY = 48, AMP = 30, X0 = 16, X1 = 624, STEPS = 96;
const MAX_RUNGS = 5;

type Segment = { strand: 0 | 1; depth: number; d: string; index: number };

// Peaks (where the strands are widest apart) sit at t = (k + .5) / (2 * turns).
function segments(turns: number): Segment[] {
  const point = (t: number, phase: number) => {
    const a = t * turns * 2 * Math.PI + phase;
    return { x: X0 + (X1 - X0) * t, y: CY + AMP * Math.sin(a), z: Math.cos(a) };
  };
  const out: Segment[] = [];
  for (const strand of [0, 1] as const) for (let i = 0; i < STEPS; i++) {
    const a = point(i / STEPS, strand * Math.PI), b = point((i + 1) / STEPS, strand * Math.PI);
    out.push({ strand, index: i, depth: (a.z + b.z) / 2, d: `M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${b.x.toFixed(1)} ${b.y.toFixed(1)}` });
  }
  return out;
}

export function TwinHelix({ kept, changed, state }: { kept: string[]; changed: string[]; state: "searching" | "success" | "error" | "empty" }) {
  const root = useRef<HTMLDivElement>(null);
  const rungs = state === "success"
    ? [...kept.map(label => ({ label, on: true })), ...changed.map(label => ({ label, on: false }))].slice(0, MAX_RUNGS)
    : [];
  // Fewer than 3 traits still get two full twists, with the rungs on the middle peaks.
  const turns = rungs.length >= 3 ? rungs.length / 2 : 2;
  const peaks = turns * 2, offset = Math.floor((peaks - rungs.length) / 2);
  const at = (i: number) => (offset + i + .5) / peaks;
  const key = `${state}|${rungs.map(r => r.label).join("|")}`;

  useGSAP(() => {
    if (state !== "success" || !root.current) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline()
        .from(".twin-helix-seg", { opacity: 0, duration: m.duration.control, ease: m.ease.enter, stagger: { each: .004, from: "start" } })
        .from(".twin-helix-rung, .twin-helix-label", { opacity: 0, y: 6, duration: m.duration.reveal, ease: m.ease.settle, stagger: .12 }, "-=.35");
    });
    return () => media.revert();
  }, { scope: root, dependencies: [key], revertOnUpdate: true });

  const strand = (front: boolean) => segments(turns).filter(s => (s.depth >= 0) === front).map(s =>
    <path key={`${s.strand}-${s.index}`} className="twin-helix-seg" data-strand={s.strand} d={s.d}
      strokeWidth={(2.2 + s.depth * 1.3).toFixed(2)} opacity={(.55 + s.depth * .45).toFixed(2)} />);

  return <div className="twin-helix" data-state={state} ref={root} aria-hidden="true">
    <svg viewBox={`0 0 ${W} ${CY * 2}`} fill="none" strokeLinecap="round" preserveAspectRatio="none">
      {strand(false)}
      {rungs.map((r, i) => {
        const x = X0 + (X1 - X0) * at(i);
        return <line key={r.label} className="twin-helix-rung" data-on={r.on || undefined} x1={x} x2={x} y1={CY - AMP + 4} y2={CY + AMP - 4} />;
      })}
      {strand(true)}
      <circle className="twin-helix-end" data-strand="0" cx={X0} cy={CY} r="5" />
      <circle className="twin-helix-end" data-strand="1" cx={X1} cy={CY} r="5" />
    </svg>
    {rungs.map((r, i) => <span key={r.label} className="twin-helix-label" data-on={r.on || undefined}
      style={{ left: `${(X0 + (X1 - X0) * at(i)) / W * 100}%` }}>{r.label}</span>)}
  </div>;
}
