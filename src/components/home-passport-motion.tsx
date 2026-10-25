"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Home owns the bound book; TravelMotion owns photo layers and later reveals. */
export function HomePassportMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const book = gsap.timeline({ defaults: { ease: "power3.out", clearProps: "transform,opacity" } });
      // No CSS hides these elements: server output and an interrupted entrance
      // stay readable. Forms are deliberately absent from the timeline.
      book.from(".h-hero", { y: 18, duration: .65 }, 0)
        .from(".h-cover .h-security", { opacity: 0, duration: .7 }, 0)
        .from(".h-cover-kicker, .h-cover h1, .h-lead", { y: 24, opacity: 0, stagger: .08, duration: .6 }, .08)
        .from(".h-visa", { rotationY: -9, transformOrigin: "left center", duration: .85, clearProps: "transform,transformOrigin" }, .18)
        .from(".h-bookmark", { y: -64, duration: .55 }, .4)
        .from(".h-emblem", { scale: .82, rotation: -18, opacity: 0, duration: .65 }, .3)
        .from(".h-stamp", { scale: 1.8, rotation: -32, opacity: 0, duration: .45, ease: "back.out(1.5)" }, .8);
      // Draw only the cover's security paths, restoring the original decoration.
      root.current?.querySelectorAll<SVGPathElement>(".h-cover .h-security path").forEach((line) => {
        const length = line.getTotalLength();
        book.fromTo(line, { strokeDasharray: length, strokeDashoffset: length }, {
          strokeDashoffset: 0, duration: 1.05, ease: "power2.inOut", clearProps: "strokeDasharray,strokeDashoffset",
        }, 0);
      });
    });
    return () => media.revert();
  }, { scope: root });

  return <div className="home-passport" ref={root}>{children}</div>;
}
