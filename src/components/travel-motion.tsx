"use client";
import { useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** A page turn, an itinerary trace and an ink impression share one vocabulary. */
export function TravelMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const path = usePathname();
  const kind = path === "/" ? "home" : path.startsWith("/preview/home") ? "preview" : path.split("/")[1] || "guide";
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", (motionContext) => {
      const seen = new WeakSet<Element>();
      const parallaxSeen = new WeakSet<Element>();
      const photoSelect = ".h-visa-photo img, .city-cover-photo img, .place-hero img";
      const mobile = () => window.matchMedia("(max-width: 760px)").matches;
      motionContext.add("animatePhoto", (element: Element) => {
        if (parallaxSeen.has(element) || element.closest("[hidden]")) return;
        parallaxSeen.add(element);
        const frame = element.closest(".h-visa-photo, .city-cover-photo, .place-hero");
        if (!frame) return;
        // The image has overscan; the readable frame never moves. Scrub binds
        // its offset to actual scroll rather than playing a timed entrance.
        gsap.fromTo(element, { y: () => mobile() ? -8 : -18 }, {
          y: () => mobile() ? 8 : 18, ease: "none",
          scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
        });
      });
      const select = ".h-how h2, .h-steps li, .h-cities-head, .h-grid > li, .home-swap-intro, .h-swap-sheet, .h-band, .h-picks li:not(:has(.h-skeleton)), .place-grid > .place-card:not(.skeleton), [data-travel-enter], [data-travel-route], [data-travel-marker], [data-travel-page], [data-travel-reveal], [data-travel-stamp], .activity-stamps .activity-stamp-mark";
      motionContext.add("animateLeaf", (element: Element) => {
        if (seen.has(element) || element.closest("[hidden]")) return;
        seen.add(element);
        if (element.matches("[data-travel-route]") && element instanceof SVGPathElement) {
          const length = element.getTotalLength();
          gsap.fromTo(element, { strokeDasharray: length, strokeDashoffset: length }, {
            strokeDashoffset: 0, duration: 1.05, ease: "power2.inOut", clearProps: "strokeDasharray,strokeDashoffset",
          });
        } else if (element.matches("[data-travel-marker]")) {
          gsap.from(element, { scale: .3, transformOrigin: "center", duration: .45, delay: .7, ease: "back.out(1.4)", clearProps: "transform,transformOrigin" });
        } else if (element.matches("[data-travel-stamp], .activity-stamps .activity-stamp-mark")) {
          if (element.matches(".save-imprint")) {
            gsap.timeline().fromTo(element, { scale: 1.8, rotation: -26, opacity: 0 }, { scale: 1, rotation: -12, opacity: 1, duration: .35, ease: "power3.in" })
              .to(element, { opacity: 0, y: -9, duration: .3, delay: 1.1 });
          } else {
            gsap.from(element, { scale: 1.5, rotation: -26, duration: .5, delay: .15, ease: "back.out(1.5)", clearProps: "transform" });
          }
        } else if (element.matches("[data-travel-reveal]")) {
          gsap.fromTo(element, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: .65, ease: "power3.inOut", clearProps: "clipPath" });
        } else if (element.matches(".h-how h2, .h-steps li, .h-cities-head, .h-grid > li, .home-swap-intro, .h-swap-sheet, .h-band, .h-picks li, .place-grid > .place-card, [data-travel-enter]")) {
          const index = element.parentElement ? Array.from(element.parentElement.children).indexOf(element) : 0;
          gsap.from(element, { y: 24, opacity: .3, duration: .6, delay: Math.min(index * .07, .28), ease: "power3.out", clearProps: "transform,opacity" });
        } else if (!element.querySelector(".city-map") && !element.matches(".trip")) {
          gsap.from(element, { rotationY: -5, skewY: -.3, x: 7, transformOrigin: "left center", duration: .55, ease: "power3.out", clearProps: "transform,transformOrigin" });
        }
      });
      const animate = (element: Element) => motionContext.animateLeaf(element);
      const entrances = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.closest("[hidden]")) {
            animate(entry.target);
            entrances.unobserve(entry.target);
          }
        });
      }, { threshold: .08 });
      const queue = (element: Element) => {
        if (element.matches(".save-imprint")) animate(element);
        else if (!seen.has(element)) entrances.observe(element);
      };
      const collect = (node: Element) => {
        if (node.matches(photoSelect)) motionContext.animatePhoto(node);
        node.querySelectorAll(photoSelect).forEach((photo) => motionContext.animatePhoto(photo));
        if (node.matches(select)) queue(node);
        node.querySelectorAll(select).forEach(queue);
      };
      if (root.current) collect(root.current);
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          mutation.addedNodes.forEach((node) => { if (node instanceof Element) collect(node); });
          // A hidden workspace becomes a genuine discovery step when selected.
          if (mutation.type === "attributes" && mutation.target instanceof Element && !mutation.target.hasAttribute("hidden")) collect(mutation.target);
        }
      });
      if (root.current) observer.observe(root.current, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] });
      const resize = new ResizeObserver(() => ScrollTrigger.refresh());
      if (root.current) resize.observe(root.current);
      return () => { observer.disconnect(); entrances.disconnect(); resize.disconnect(); };
    });
    return () => media.revert();
  }, { scope: root, dependencies: [path], revertOnUpdate: true });
  return <div className="travel-world" data-travel-view={kind} ref={root}>{children}</div>;
}
