/** Shared choreography for the existing GSAP and CSS motion system. Seconds. */
export const motionTokens = {
  duration: { press: .09, control: .15, exit: .14, panel: .22, reveal: .34, hero: .55, stamp: .28, route: .85, journey: 3.6, imprintHold: 1.1 },
  distance: { small: 8, reveal: 12, drag: 96, flick: 32, velocity: 550 },
  ease: { enter: "power3.out", leave: "power2.in", ink: "power2.inOut", settle: "back.out(1.15)", linear: "none" },
  stagger: .06,
  quiz: { hover: 4, press: .97, sceneOpacity: .4 },
} as const;

export const quizSprings = { snappy: {type:"spring" as const,stiffness:300,damping:30} };
