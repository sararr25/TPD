"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { motionTokens as m } from "@/lib/motion-tokens";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** A page turn, an itinerary trace and an ink impression share one vocabulary. */
export function TravelMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const path = usePathname();
  const currentPath = useRef(path);
  const returning = useRef(false);
  useEffect(() => {
    const back = () => { returning.current = location.pathname !== currentPath.current; };
    const visibility = () => { document.documentElement.toggleAttribute("data-motion-paused", document.hidden); };
    window.addEventListener("popstate", back);
    document.addEventListener("visibilitychange", visibility);
    visibility();
    return () => { window.removeEventListener("popstate", back); document.removeEventListener("visibilitychange", visibility); document.documentElement.removeAttribute("data-motion-paused"); };
  }, []);
  const kind = path === "/" ? "home" : path.startsWith("/preview/home") ? "preview" : path.split("/")[1] || "guide";
  useGSAP(() => {
    currentPath.current = path;
    const skipEntrance = returning.current;
    returning.current = false;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", (motionContext) => {
      const seen = new WeakSet<Element>();
      const parallaxSeen = new WeakSet<Element>();
      const photoSelect = ".h-visa-photo img:not([data-place-image]), .city-cover-photo img, .place-hero img:not([data-place-image]), .h-visa-photo .place-image-backdrop, .place-hero .place-image-backdrop";
      const mobile = () => window.matchMedia("(max-width: 760px)").matches;
      motionContext.add("animatePhoto", (element: Element) => {
        if (parallaxSeen.has(element) || element.closest("[hidden]")) return;
        parallaxSeen.add(element);
        const frame = element.closest(".h-visa-photo, .city-cover-photo, .place-hero");
        if (!frame) return;
        // Compact city thumbnails have a fixed inset and no overscan.
        const compactCity = () => window.matchMedia("(max-width: 600px)").matches && element.matches(".city-cover:not([data-ink-cover]) .city-cover-photo img");
        // The image has overscan; the readable frame never moves. Scrub binds
        // its offset to actual scroll rather than playing a timed entrance.
        gsap.fromTo(element, { y: () => compactCity() ? 0 : mobile() ? -8 : -18 }, {
          y: () => compactCity() ? 0 : mobile() ? 8 : 18, ease: m.ease.linear,
          scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
        });
      });
      const select = ".h-how h2, .h-steps li, .h-cities-head, .h-grid > li, .home-swap-intro, .h-swap-sheet, .h-band, .h-picks li:not(:has(.h-skeleton)), .place-grid > .place-card:not(.skeleton), [data-travel-enter], [data-travel-route], [data-travel-marker], [data-travel-page], [data-travel-reveal], [data-travel-stamp]";
      // Suppress only the restored content, not feedback from subsequent actions.
      const restored = new WeakSet<Element>(skipEntrance ? Array.from(root.current?.querySelectorAll(select) ?? []) : []);
      motionContext.add("animateLeaf", (element: Element) => {
        if (seen.has(element) || element.closest("[hidden]") || restored.has(element)) return;
        seen.add(element);
        if (element.matches("[data-travel-route]") && element instanceof SVGPathElement) {
          const length = element.getTotalLength();
          gsap.fromTo(element, { strokeDasharray: length, strokeDashoffset: length }, {
            strokeDashoffset: 0, duration: m.duration.route, ease: m.ease.ink, clearProps: "strokeDasharray,strokeDashoffset",
          });
        } else if (element.matches("[data-travel-marker]")) {
          gsap.from(element, { scale: .3, transformOrigin: "center", duration: m.duration.panel, delay: m.duration.hero, ease: m.ease.settle, clearProps: "transform,transformOrigin" });
        } else if (element.matches("[data-travel-stamp]")) {
          if (element.matches(".save-imprint")) {
            gsap.timeline().fromTo(element, { scale: 1.2, rotation: -18, opacity: 0 }, { scale: 1, rotation: -12, opacity: 1, duration: m.duration.stamp, ease: m.ease.leave })
              .to(element, { opacity: 0, y: -9, duration: m.duration.exit, delay: m.duration.imprintHold });
          } else {
            gsap.from(element, { scale: 1.15, rotation: -14, duration: m.duration.stamp, ease: m.ease.settle, clearProps: "transform" });
          }
        } else if (element.matches("[data-travel-reveal]")) {
          if (element.closest(".h-grid")) return;
          gsap.fromTo(element, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: m.duration.reveal, ease: m.ease.ink, clearProps: "clipPath" });
        } else if (element.matches(".place-grid > .place-card")) {
          // #106: each pick turns in like a Passport page, hinged on its left
          // edge, in reading order; transform/opacity only.
          const index = element.parentElement ? Array.from(element.parentElement.children).indexOf(element) : 0;
          gsap.from(element, { rotationY: -14, y: m.distance.reveal, opacity: .4, transformPerspective: 900, transformOrigin: "left center", duration: m.duration.hero, delay: Math.min(index * m.stagger, m.duration.control), ease: m.ease.enter, clearProps: "transform,opacity,transformOrigin" });
        } else if (element.matches(".h-how h2, .h-steps li, .h-cities-head, .h-grid > li, .home-swap-intro, .h-swap-sheet, .h-band, .h-picks li, [data-travel-enter]")) {
          const index = element.parentElement ? Array.from(element.parentElement.children).indexOf(element) : 0;
          gsap.from(element, { y: m.distance.reveal, opacity: .5, duration: m.duration.reveal, delay: Math.min(index * m.stagger, m.duration.control), ease: m.ease.enter, clearProps: "transform,opacity" });
        } else if (!element.querySelector(".city-map") && !element.matches(".trip")) {
          gsap.from(element, { y: m.distance.small, opacity: .5, duration: m.duration.reveal, ease: m.ease.enter, clearProps: "transform,opacity" });
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
      let positions = new Map<Element, { x: number; y: number }>();
      motionContext.add("settleLists", (animate: boolean) => {
        const next = new Map<Element, { x: number; y: number }>();
        const moves: { element: Element; x: number; y: number }[] = [];
        root.current?.querySelectorAll(".h-grid > li, .place-grid > .place-card:not(.skeleton), .events-list > li, .trip-cards > .saved-place").forEach(element => {
          const rect = element.getBoundingClientRect();
          const point = { x: rect.left + scrollX - Number(gsap.getProperty(element, "x")), y: rect.top + scrollY - Number(gsap.getProperty(element, "y")) };
          next.set(element, point);
          const old = positions.get(element);
          if (animate && old && rect.bottom > 0 && rect.top < innerHeight && !gsap.isTweening(element) && (Math.abs(old.x - point.x) > 1 || Math.abs(old.y - point.y) > 1)) moves.push({ element, x: old.x - point.x, y: old.y - point.y });
        });
        positions = next;
        // Large results sets stay immediate; only a small visible shift animates.
        if (moves.length <= 5) moves.forEach(({ element, x, y }) => gsap.fromTo(element, { x, y }, { x: 0, y: 0, duration: m.duration.panel, ease: m.ease.enter, clearProps: "transform" }));
      });
      motionContext.settleLists(false);
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          mutation.addedNodes.forEach((node) => { if (node instanceof Element) collect(node); });
          // A hidden workspace becomes a genuine discovery step when selected.
          if (mutation.type === "attributes" && mutation.target instanceof Element && !mutation.target.hasAttribute("hidden")) collect(mutation.target);
        }
        if (mutations.some(mutation => mutation.type === "childList")) motionContext.settleLists(true);
      });
      if (root.current) observer.observe(root.current, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] });
      let refreshFrame = 0;
      const resize = new ResizeObserver(() => {
        if (!refreshFrame) refreshFrame = requestAnimationFrame(() => { refreshFrame = 0; ScrollTrigger.refresh(); });
      });
      if (root.current) resize.observe(root.current);
      const skeletons = new IntersectionObserver(entries => entries.forEach(entry => entry.target.toggleAttribute("data-offscreen", !entry.isIntersecting)));
      const watchSkeletons = () => root.current?.querySelectorAll(".skeleton, .h-skeleton").forEach(node => skeletons.observe(node));
      watchSkeletons();
      const loading = new MutationObserver(watchSkeletons);
      if (root.current) loading.observe(root.current, { childList: true, subtree: true });
      return () => { observer.disconnect(); entrances.disconnect(); resize.disconnect(); skeletons.disconnect(); loading.disconnect(); cancelAnimationFrame(refreshFrame); };
    });
    return () => media.revert();
  }, { scope: root, dependencies: [path], revertOnUpdate: true });
  return <div className="travel-world" data-travel-view={kind} ref={root}>{children}</div>;
}
