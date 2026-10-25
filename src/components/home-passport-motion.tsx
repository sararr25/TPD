"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function HomePassportMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".h-hero", { y: 20, duration: 0.9, ease: "power3.out" });
      gsap.from(".h-stamp", {
        scale: 1.6, rotation: -32, opacity: 0,
        duration: 0.65, delay: 0.45, ease: "back.out(1.7)",
      });
      const cards = root.current?.querySelectorAll(".h-cities .h-city");
      cards?.forEach((card) => gsap.from(card, {
        y: 30, rotation: 2, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 94%", once: true },
      }));
      gsap.from(".h-band-emblem", {
        scale: 1.4, rotation: -24, opacity: 0, duration: 0.65,
        ease: "back.out(1.5)",
        scrollTrigger: { trigger: ".h-band", start: "top 90%", once: true },
      });
    });
    return () => media.revert();
  }, { scope: root });

  return <div className="home-passport" ref={root}>{children}</div>;
}
