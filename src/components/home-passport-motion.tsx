"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { motionTokens as m } from "@/lib/motion-tokens";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Home owns the bound book; TravelMotion owns photo layers and later reveals. */
export function HomePassportMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const book = gsap.timeline({ defaults: { ease: m.ease.enter, clearProps: "transform,opacity" } });
      // No CSS hides these elements: server output and an interrupted entrance
      // stay readable. Forms are deliberately absent from the timeline.
      book.from(".h-hero", { y: 18, duration: m.duration.hero }, 0)
        .from(".h-cover .h-security", { opacity: 0, duration: m.duration.hero, clearProps: "opacity" }, 0)
        .from(".h-cover-kicker, .h-cover h1, .h-lead", { y: m.distance.reveal, opacity: .5, stagger: m.stagger, duration: m.duration.reveal }, m.duration.press)
        .from(".h-emblem", { scale: .95, rotation: -5, opacity: .5, duration: m.duration.hero }, m.duration.stamp);
      const mobile = window.matchMedia("(max-width: 760px)").matches;
      // The page tells its story once it can actually be seen, independently
      // of the cover entrance. No pinning or delay before using its controls.
      gsap.timeline({
        defaults: { ease: m.ease.enter, clearProps: "transform,opacity" },
        scrollTrigger: { trigger: ".h-visa", start: "top 78%", once: true },
      })
        .from(".h-visa", { rotationY: mobile ? -3 : -9, transformOrigin: "left center", duration: m.duration.hero, clearProps: "transform,transformOrigin" }, 0)
        .from(".h-bookmark", { y: -24, duration: m.duration.panel }, mobile ? m.duration.control : m.duration.panel);
      gsap.from(".h-stamp", { scale: 1.2, rotation: -16, opacity: 0, duration: m.duration.stamp, ease: m.ease.settle, clearProps: "transform,opacity",
        scrollTrigger: { trigger: ".h-visa-figure", start: "bottom 90%", once: true },
      });
      // Only decorative layers move; all text and inputs keep their position.
      gsap.to(".h-cover .h-security", { y: -26, ease: m.ease.linear, scrollTrigger: {
        trigger: ".h-cover", start: "top top", end: "bottom top", scrub: true,
      } });
      gsap.to(".h-cover .h-emblem-depth", { y: 18, rotation: 8, ease: m.ease.linear, scrollTrigger: {
        trigger: ".h-cover", start: "top top", end: "bottom top", scrub: true,
      } });
      // Draw only the cover's security paths, restoring the original decoration.
      root.current?.querySelectorAll<SVGPathElement>(".h-cover .h-security path").forEach((line) => {
        const length = line.getTotalLength();
        book.fromTo(line, { strokeDasharray: length, strokeDashoffset: length }, {
          strokeDashoffset: 0, duration: m.duration.route, ease: m.ease.ink, clearProps: "strokeDasharray,strokeDashoffset",
        }, 0);
      });
    });
    return () => media.revert();
  }, { scope: root });

  return <div className="home-passport" ref={root}>{children}</div>;
}
