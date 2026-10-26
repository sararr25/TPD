"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motionTokens as m } from "@/lib/motion-tokens";

/** Keep the panel mounted for its exit; interrupted exits revert on reopen. */
export function MotionPresence({ show, children }: { show: boolean; children: ReactNode }) {
  const [retained, setRetained] = useState(show);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => {
      const target = root.current?.firstElementChild;
      if (!query.matches || !target) return;
      gsap.killTweensOf(target);
      gsap.set(target, { clearProps: "transform,opacity" });
      if (!show) setRetained(false);
    };
    query.addEventListener("change", stop);
    return () => query.removeEventListener("change", stop);
  }, [show]);
  useGSAP(() => {
    const target = root.current?.firstElementChild;
    if (!target) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (show) {
      setRetained(true);
      gsap.fromTo(target, { opacity: reduced ? 1 : 0, y: reduced ? 0 : m.distance.small }, { opacity: 1, y: 0, duration: reduced ? 0 : m.duration.panel, ease: m.ease.enter, clearProps: "transform,opacity" });
    } else {
      gsap.to(target, { opacity: 0, y: reduced ? 0 : m.distance.small, duration: reduced ? 0 : m.duration.exit, ease: m.ease.leave, onComplete: () => setRetained(false) });
    }
  }, { scope: root, dependencies: [show], revertOnUpdate: true });
  return show || retained ? <div ref={root} className="motion-presence" inert={!show}>{children}</div> : null;
}
