"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Opening sequence: the brand logo appears centered, holds, then zooms
 * "through" the camera and fades — revealing the product film beneath.
 * When the zoom starts the hero video is restarted from frame 0 so the
 * cushion reveal plays in sync with the recomposition. On completion the
 * nav + UI are released (via onComplete) and scrolling is unlocked.
 */
export default function Intro({ onComplete }: { onComplete: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cb = useRef(onComplete);
  cb.current = onComplete;
  const [done, setDone] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const logo = root?.querySelector<HTMLElement>(".intro__logo");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let finished = false;
    let failsafe: ReturnType<typeof setTimeout>;
    let tl: gsap.core.Timeline | null = null;

    const unlock = () => {
      document.documentElement.classList.remove("intro-lock");
      (window as unknown as { lenis?: { start: () => void } }).lenis?.start();
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(failsafe);
      unlock();
      // The Hero pin may have been measured while the page was locked (collapsed
      // height). Recompute now that scrolling is restored so pin + Lenis limit are correct.
      ScrollTrigger.refresh();
      cb.current();
      setDone(true);
    };

    if (reduce || !root || !logo) {
      finish();
      return;
    }

    document.documentElement.classList.add("intro-lock");
    (window as unknown as { lenis?: { stop: () => void } }).lenis?.stop();

    // Safety net: rAF is paused in background tabs, so a purely animation-driven
    // intro could otherwise keep the page locked. This guarantees release.
    failsafe = setTimeout(finish, 6000);

    const startVideo = () => {
      const v = document.querySelector<HTMLVideoElement>(".hero__video");
      if (v) {
        try {
          v.currentTime = 0;
        } catch {}
        v.play?.().catch(() => {});
      }
    };

    tl = gsap.timeline({ onComplete: finish });
    gsap.set(root, { autoAlpha: 1 });
    gsap.set(logo, { autoAlpha: 0, scale: 0.86, filter: "blur(7px)" });

    tl
      // logo settles in
      .to(logo, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 1.0, ease: "power2.out" })
      .to(logo, { scale: 1.03, duration: 0.5, ease: "sine.inOut" }) // subtle breath / hold
      // camera pushes through the logo, product film restarts underneath
      .add(startVideo)
      .to(logo, { scale: 14, autoAlpha: 0, filter: "blur(5px)", duration: 1.2, ease: "power2.in" })
      .to(root, { autoAlpha: 0, duration: 1.0, ease: "power2.inOut" }, "<0.2");

    return () => {
      clearTimeout(failsafe);
      tl?.kill();
      unlock();
    };
  }, []);

  if (done) return null;

  return (
    <div ref={rootRef} className="intro" aria-hidden="true">
      <div className="intro__logo">
        {/* Full-res PNG (not next/image): it must stay crisp while scaling to 14x.
            eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.png" alt="" width={1024} height={1024} decoding="async" />
      </div>
    </div>
  );
}
