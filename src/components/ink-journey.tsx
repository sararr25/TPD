"use client";

import { useId, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motionTokens as m } from "@/lib/motion-tokens";
import { InkFootprint } from "./ink-footprint";

gsap.registerPlugin(useGSAP);

/** An imagined walking map, never venue coordinates or a real itinerary. */
export function InkJourney({ className = "" }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const id = useId().replaceAll(":", "");
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const node = root.current;
      if (!node) return;
      const timeline = gsap.timeline({ paused: true, onStart: () => { node.dataset.inkState = "playing"; }, onComplete: () => { node.dataset.inkState = "complete"; } });
      node.querySelectorAll<SVGSVGElement>("svg").forEach(map => {
      const route = map.querySelector<SVGPathElement>(".ink-walk")!;
      const length = route.getTotalLength();
      const reveal = map.querySelector<SVGPathElement>(".ink-route-reveal")!;
      const steps = map.querySelectorAll<SVGGElement>(".ink-footstep");
      steps.forEach((step, index) => {
        const at = length * ((index + 1) / (steps.length + 1));
        const point = route.getPointAtLength(at);
        const next = route.getPointAtLength(Math.min(length, at + 2));
        const angle = Math.atan2(next.y - point.y, next.x - point.x) * 180 / Math.PI;
        step.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle}) translate(0 ${index % 2 ? 4 : -4})`);
      });
      timeline.fromTo(reveal, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: m.duration.journey, ease: m.ease.ink, clearProps: "strokeDasharray,strokeDashoffset" }, 0)
        .fromTo(steps, { opacity: 0 }, { opacity: .9, duration: m.duration.control, stagger: m.duration.journey / steps.length, ease: m.ease.linear }, 0)
        .from(map.querySelector(".ink-destination"), { scale: .8, opacity: 0, transformOrigin: "center", duration: m.duration.stamp, ease: m.ease.settle }, m.duration.journey - m.duration.stamp);
      });
      let visible = false;
      const sync = () => {
        if (visible && !document.hidden) timeline.play();
        else timeline.pause();
      };
      const observer = new IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
        sync();
      }, { threshold: .2 });
      observer.observe(node);
      document.addEventListener("visibilitychange", sync);
      return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); node.dataset.inkState = "static"; };
    });
    return () => media.revert();
  }, { scope: root });
  const maps = [
    { name: "desktop", width: 1100, height: 90, start: [24, 48], end: [1070, 32], steps: 44,
      path: "M24 48C100 4 149 79 238 48S341 7 386 45 467 85 538 47 631 9 690 46 771 80 829 43 933 8 982 40 1041 52 1070 32" },
    { name: "mobile", width: 600, height: 110, start: [18, 62], end: [570, 36], steps: 26,
      path: "M18 62C68 12 109 12 156 58S228 96 276 57 350 12 394 48 467 92 506 51 548 23 570 36" },
  ];
  return <div ref={root} className={`ink-journey ${className}`} data-ink-state="static" aria-hidden="true">
    {maps.map(map => <svg key={map.name} className={`ink-${map.name}-map`} viewBox={`0 0 ${map.width} ${map.height}`} preserveAspectRatio="none" fill="none" focusable="false">
      <defs><mask id={`${id}-${map.name}`} maskUnits="userSpaceOnUse" x="0" y="0" width={map.width} height={map.height}>
        <path className="ink-route-reveal" d={map.path} stroke="white" strokeWidth="8" />
      </mask></defs>
      <path className="ink-walk" d={map.path} mask={`url(#${id}-${map.name})`} stroke="currentColor" strokeWidth="1.6" strokeDasharray="2 9" strokeLinecap="round" />
      <g className="ink-footprints" fill="currentColor">
        {Array.from({ length: map.steps }, (_, index) => <g className="ink-footstep" key={index}><InkFootprint /></g>)}
      </g>
      <g className="ink-origin" transform={`translate(${map.start.join(" ")})`} stroke="currentColor"><circle r="4" fill="var(--paper)" /><circle r="1" fill="currentColor" /></g>
      <g transform={`translate(${map.end.join(" ")})`}><g className="ink-destination" stroke="currentColor"><path d="M0-12c-6 0-10 4-10 10C-10 6 0 15 0 15S10 6 10-2C10-8 6-12 0-12Z" fill="var(--sun)" strokeWidth="1.4" /><circle cy="-2" r="3" /></g></g>
    </svg>)}
  </div>;
}
