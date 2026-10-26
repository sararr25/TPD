"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motionTokens as m } from "@/lib/motion-tokens";
import { InkFootprint } from "./ink-footprint";

type Rect = { x: number; y: number; width: number; height: number };
type MapGeometry = { width: number; height: number; paths: string[]; exclusions: Rect[]; drawing: Rect; destination: { x: number; y: number } };

/** Ink lives on the existing city cover. Actual text and photo bounds stay clear. */
export function CityInkMap() {
  const root = useRef<HTMLDivElement>(null);
  const id = useId().replaceAll(":", "");
  const [geometry, setGeometry] = useState<MapGeometry | null>(null);
  useLayoutEffect(() => {
    const cover = root.current?.parentElement;
    if (!cover) return;
    let frame = 0, alive = true;
    const measure = () => {
      frame = 0;
      const copy = cover.querySelector<HTMLElement>(".city-cover-copy");
      const photo = cover.querySelector<HTMLElement>(".city-cover-photo");
      if (!copy || !photo) return;
      const box = cover.getBoundingClientRect(), c = copy.getBoundingClientRect(), p = photo.getBoundingClientRect();
      const exclusions: Rect[] = [];
      const exclude = (rect: DOMRect, padding: number) => {
        if (rect.width && rect.height) exclusions.push({ x: rect.left - box.left - padding, y: rect.top - box.top - padding, width: rect.width + padding * 2, height: rect.height + padding * 2 });
      };
      // Text ranges preserve blank space to the right of short city names.
      copy.querySelectorAll("h1, .city-local, .city-intro, .city-count, .guide-folio span").forEach(element => {
        const range = document.createRange();
        range.selectNodeContents(element);
        Array.from(range.getClientRects()).forEach(rect => exclude(rect, 10));
      });
      const citySwitch = copy.querySelector<HTMLElement>(".city-switch");
      if (citySwitch) exclude(citySwitch.getBoundingClientRect(), 12);
      exclude(p, 8);
      const left = c.left - box.left + 10, right = c.right - box.left - 12;
      const top = c.top - box.top + 14, bottom = c.bottom - box.top - 12;
      const w = right - left, h = bottom - top;
      const point = (x: number, y: number) => `${(left + w * x).toFixed(1)} ${(top + h * y).toFixed(1)}`;
      const paths = [
        `M${point(.03,.83)} C${point(.17,.65)} ${point(.24,.95)} ${point(.39,.83)} S${point(.57,.64)} ${point(.69,.8)} C${point(.85,.98)} ${point(.97,.81)} ${point(.91,.61)} S${point(.75,.37)} ${point(.86,.23)}`,
        `M${point(.86,.23)} C${point(.74,.05)} ${point(.67,.27)} ${point(.55,.17)} S${point(.28,.05)} ${point(.09,.07)}`,
        `M${point(.12,.97)} C${point(.3,.88)} ${point(.47,1.01)} ${point(.58,.92)} S${point(.75,.68)} ${point(.94,.68)}`,
      ];
      const next = { width: box.width, height: box.height, paths, exclusions, drawing: { x: left, y: top, width: w, height: h }, destination: { x: left + w * .86, y: top + h * .23 } };
      setGeometry(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
    };
    const queue = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const resize = new ResizeObserver(queue);
    resize.observe(cover);
    cover.querySelectorAll(".city-cover-copy, .city-cover-photo, .city-switch").forEach(element => resize.observe(element));
    const mutation = new MutationObserver(queue);
    mutation.observe(cover.querySelector(".city-cover-copy")!, { subtree: true, childList: true, attributes: true, attributeFilter: ["open"] });
    measure();
    document.fonts.ready.then(() => { if (alive) queue(); });
    return () => { alive = false; resize.disconnect(); mutation.disconnect(); cancelAnimationFrame(frame); };
  }, []);

  useGSAP(() => {
    if (!geometry || !root.current) return;
    // Geometry is static state; reduced motion still shows positioned footprints.
    root.current.querySelectorAll<SVGGElement>(".cover-ink-branch").forEach(branch => {
      const path = branch.querySelector<SVGPathElement>(".cover-ink-trail")!;
      const length = path.getTotalLength();
      const steps = branch.querySelectorAll<SVGGElement>(".cover-ink-step");
        steps.forEach((step, index) => {
          const at = length * (index + 1) / (steps.length + 1);
          const p = path.getPointAtLength(at), next = path.getPointAtLength(Math.min(length, at + 1));
          const angle = Math.atan2(next.y - p.y, next.x - p.x) * 180 / Math.PI;
          step.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${angle}) translate(0 ${index % 2 ? 5 : -5})`);
        });
    });
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const node = root.current!;
      const timeline = gsap.timeline({ paused: true, onStart: () => { node.dataset.inkState = "playing"; }, onComplete: () => { node.dataset.inkState = "complete"; } });
      timeline.fromTo(".cover-ink-plan", { opacity: 0 }, { opacity: 1, duration: m.duration.hero, ease: m.ease.enter }, 0)
        .from(".cover-ink-building", { opacity: 0, duration: m.duration.reveal, stagger: m.stagger, clearProps: "opacity" }, m.duration.control)
        .from(".cover-ink-destination", { opacity: 0, scale: .8, transformOrigin: "center", duration: m.duration.stamp, ease: m.ease.settle, clearProps: "opacity,transform,transformOrigin" }, m.duration.journey - m.duration.stamp);
      node.querySelectorAll<SVGGElement>(".cover-ink-branch").forEach((branch, branchIndex) => {
        const path = branch.querySelector<SVGPathElement>(".cover-ink-trail")!;
        const reveal = node.querySelector<SVGPathElement>(`[data-reveal="${branchIndex}"]`)!;
        const length = path.getTotalLength();
        const steps = branch.querySelectorAll<SVGGElement>(".cover-ink-step");
        const start = branchIndex * m.duration.hero;
        timeline.fromTo(reveal, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: m.duration.journey, ease: m.ease.ink, clearProps: "strokeDasharray,strokeDashoffset" }, start)
          .fromTo(steps, { opacity: 0 }, { opacity: .8, duration: m.duration.control, stagger: m.duration.journey / steps.length }, start);
      });
      let visible = false;
      const sync = () => visible && !document.hidden ? timeline.play() : timeline.pause();
      const observer = new IntersectionObserver(entries => { visible = entries.some(entry => entry.isIntersecting); sync(); }, { threshold: .15 });
      observer.observe(node);
      document.addEventListener("visibilitychange", sync);
      return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); node.dataset.inkState = "static"; };
    });
    return () => media.revert();
  }, { scope: root, dependencies: [geometry], revertOnUpdate: true });

  return <div className="city-ink-map" ref={root} aria-hidden="true" data-ink-state="static">
    {geometry && <svg viewBox={`0 0 ${geometry.width} ${geometry.height}`} preserveAspectRatio="none" fill="none" focusable="false">
      <defs>
        <mask id={`${id}-clear`} maskUnits="userSpaceOnUse" x="0" y="0" width={geometry.width} height={geometry.height}>
          <rect width={geometry.width} height={geometry.height} fill="white" />
          {geometry.exclusions.map((rect, index) => <rect key={index} {...rect} rx="8" fill="black" data-ink-exclusion />)}
        </mask>
        {geometry.paths.map((path, index) => <mask key={index} id={`${id}-${index}`} maskUnits="userSpaceOnUse" x="0" y="0" width={geometry.width} height={geometry.height}>
          <path data-reveal={index} d={path} stroke="white" strokeWidth="8" />
        </mask>)}
      </defs>
      <g mask={`url(#${id}-clear)`}>
        <g className="cover-ink-plan" transform={`translate(${geometry.drawing.x} ${geometry.drawing.y}) scale(${geometry.drawing.width / 1100} ${geometry.drawing.height / 360})`}>
          <g className="cover-ink-streets" stroke="currentColor" strokeWidth="1">
            <path d="M0 42h220l88 54h185l94-49h213l96 49h204M0 294h198l75-54h215l103 62h215l101-61h193M111 0v360M355 0v90m0 164v106M692 0v360M947 0v360M0 165h143m647 0h310" />
            <circle cx="580" cy="195" r="28" /><circle cx="580" cy="195" r="40" />
          </g>
          <g className="cover-ink-buildings" stroke="currentColor" strokeWidth="1">
            {[ [26,12,58,22], [26,82,58,32], [142,13,64,21], [145,88,51,27], [28,317,57,23], [231,312,72,30], [385,18,72,35], [499,12,41,26], [378,311,74,29], [499,317,53,26], [719,16,62,25], [814,25,65,25], [719,319,75,25], [831,308,63,32], [978,18,91,27], [975,135,54,22], [975,271,76,29] ].map(([x,y,width,height], index) => <rect className="cover-ink-building" key={index} x={x} y={y} width={width} height={height} />)}
          </g>
          <g className="cover-ink-gardens" stroke="currentColor" strokeWidth="1.2">
            <path d="M247 12v35m-12-23 12-10 12 10m-23 10 11-10 11 10M316 309v33m-12-23 12-10 12 10M858 125v31m-12-23 12-10 12 10m-23 10 11-10 11 10" />
            <circle cx="64" cy="220" r="20" /><path d="M50 220h28M64 206v28" />
          </g>
        </g>
        {geometry.paths.map((path, index) => <g className="cover-ink-branch" key={index}>
          <path className="cover-ink-trail" d={path} mask={`url(#${id}-${index})`} stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 8" strokeLinecap="round" />
          <g fill="currentColor">{Array.from({ length: (geometry.width < 600 ? [14,10,8] : [24,16,12])[index] }, (_, step) => <g className="cover-ink-step" key={step}><InkFootprint /></g>)}</g>
        </g>)}
        <g transform={`translate(${geometry.destination.x} ${geometry.destination.y})`}><g className="cover-ink-destination" stroke="currentColor">
          <circle r="23" strokeDasharray="2 5" opacity=".5" />
          <path d="M0-14c-7 0-12 5-12 12C-12 8 0 19 0 19S12 8 12-2C12-9 7-14 0-14Z" fill="var(--pass)" strokeWidth="1.5" /><circle cy="-2" r="4" fill="var(--sun)" />
        </g></g>
      </g>
    </svg>}
  </div>;
}
