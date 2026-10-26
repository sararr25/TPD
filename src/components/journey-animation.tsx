"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motionTokens as m } from "@/lib/motion-tokens";

gsap.registerPlugin(useGSAP);

/** One finite discovery: open the cover, trace the journey, arrive, stamp. */
export function JourneyAnimation() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference) and (min-width: 601px)", () => {
      const node = root.current;
      const route = node?.querySelector<SVGPathElement>(".journey-ink-route");
      if (!node || !route) return;
      const length = route.getTotalLength();
      node.dataset.journeyState = "waiting";
      const timeline = gsap.timeline({ paused: true, onStart: () => { node.dataset.journeyState = "playing"; }, onComplete: () => {
        node.dataset.journeyState = "complete";
        observer.disconnect();
      } });
      timeline.fromTo(".journey-book-cover", { scaleX: 1, skewY: 0 }, { scaleX: .72, skewY: -7, svgOrigin: "60 68", duration: m.duration.hero, ease: m.ease.ink }, 0)
        .to(".journey-book-cover", { scaleX: .82, skewY: -3, duration: m.duration.reveal, ease: m.ease.enter }, m.duration.hero)
        .from(".journey-page-lines", { opacity: 0, x: -m.distance.small, duration: m.duration.reveal }, m.duration.panel)
        .fromTo(route, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: m.duration.route, ease: m.ease.ink, clearProps: "strokeDasharray,strokeDashoffset" }, m.duration.panel)
        .from(".journey-arrival-pin", { y: -m.distance.reveal, scale: .8, opacity: 0, svgOrigin: "509 210", duration: m.duration.reveal, ease: m.ease.settle }, m.duration.hero + m.duration.reveal)
        .from(".journey-arrival-stamp", { scale: 1.2, rotation: -17, opacity: 0, svgOrigin: "509 176", duration: m.duration.stamp, ease: m.ease.leave }, m.duration.hero + m.duration.route)
        .to(".journey-stamp-ink", { opacity: .7, duration: m.duration.press, repeat: 1, yoyo: true }, m.duration.hero + m.duration.route + m.duration.stamp);
      let visible = false;
      const sync = () => visible && !document.hidden ? timeline.play() : timeline.pause();
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        visible = entry.isIntersecting;
        sync();
      }), { threshold: .15 });
      observer.observe(node);
      document.addEventListener("visibilitychange", sync);
      return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); node.dataset.journeyState = "static"; };
    });
    return () => media.revert();
  }, { scope: root });
  return <div className="journey-animation" ref={root} aria-hidden="true" data-journey-state="static">
    <svg viewBox="0 0 640 360" width="640" height="360" fill="none" focusable="false">
      <path className="journey-ink-route" d="M178 220C246 276 249 103 332 127S435 225 509 143" stroke="var(--pass)" strokeWidth="3" strokeLinecap="round" />
      <g transform="translate(60 68) rotate(-9 72 112)">
        <rect x="5" y="7" width="145" height="218" rx="11" fill="var(--pass)" />
        <rect x="14" y="4" width="138" height="214" rx="7" fill="var(--paper)" stroke="var(--pass)" strokeWidth="2" />
        <g className="journey-page-lines" stroke="var(--line-strong)"><path d="M25 12h120M25 17h120M25 22h120M127 44h18M127 50h18M127 56h18M127 62h18" /></g>
      </g>
      <g className="journey-book-cover">
        <g transform="translate(60 68) rotate(-9 72 112)">
          <rect width="138" height="214" rx="8" fill="var(--pass)" />
          <rect x="11" y="11" width="116" height="192" rx="3" stroke="var(--sun)" />
          <path d="M17 12v190" stroke="var(--sun)" strokeOpacity=".4" strokeDasharray="2 4" />
          <g stroke="var(--sun)" strokeWidth="1.8"><circle cx="74" cy="98" r="29" /><ellipse cx="74" cy="98" rx="13" ry="29" /><path d="M45 98h58M49 84h50M49 112h50" /></g>
          <path d="M49 149h50M57 158h34M59 177h30" stroke="var(--sun)" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>
      <g className="journey-arrival-stamp">
        <g className="journey-stamp-ink" transform="rotate(-12 509 176)" stroke="var(--pass)"><circle cx="509" cy="176" r="66" strokeWidth="3" /><circle cx="509" cy="176" r="58" /><path d="M467 143h84M467 207h84" strokeWidth="2" /><path d="M487 224h44M483 128h52" strokeWidth="3" /></g>
      </g>
      <g className="journey-arrival-pin"><path d="M509 100c-24 0-43 19-43 43 0 31 43 67 43 67s43-36 43-67c0-24-19-43-43-43Z" fill="var(--sun)" stroke="var(--pass)" strokeWidth="3" /><circle cx="509" cy="143" r="14" fill="var(--paper)" stroke="var(--pass)" strokeWidth="3" /><path d="M501 143l6 6 12-13" stroke="var(--pass)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></g>
    </svg>
  </div>;
}
