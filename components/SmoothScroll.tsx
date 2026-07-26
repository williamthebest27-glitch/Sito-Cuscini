"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Global smooth-scroll layer.
 * Lenis drives the scroll; its RAF is slaved to GSAP's ticker so every
 * ScrollTrigger-scrubbed timeline stays perfectly in sync at 60fps.
 * Disabled entirely when the visitor prefers reduced motion.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    gsap.registerPlugin(ScrollTrigger);
    // Mobile browsers fire resize when the address bar shows/hides. Don't let
    // that refresh (and jump) the pinned timelines mid-scroll.
    ScrollTrigger.config({ ignoreMobileResize: true });

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Critical: when ScrollTrigger creates pin-spacers the document grows *after*
    // Lenis has measured it. Re-measure on every refresh so the scroll limit stays
    // correct — otherwise the page gets stuck before the pinned timeline can finish.
    const onRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", onRefresh);

    // expose for buttons that want to scroll (e.g. "Guarda il Comfort")
    (window as unknown as { lenis?: Lenis }).lenis = lenis;

    // Safety net for the case where a child (Hero) created its pin *before* this
    // parent effect ran: force one refresh next frame so the spacer is measured.
    const rafId = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(rafId);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      gsap.ticker.remove(raf);
      lenis.destroy();
      (window as unknown as { lenis?: Lenis }).lenis = undefined;
    };
  }, []);

  return <>{children}</>;
}
