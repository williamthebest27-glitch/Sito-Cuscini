"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { hasIntroPlayed } from "@/lib/introState";

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const q = gsap.utils.selector(el);
    const media = q(".hero__media")[0];
    const content = q(".hero__content")[0];
    const title = q(".hero__title")[0];
    const lines = q(".hero__line-inner");
    const actions = q(".hero__actions > *");
    const scrimTop = q(".hero__scrim-top")[0];
    const scrimBottom = q(".hero__scrim-bottom")[0];
    const cue = q(".hero__cue")[0];
    const video = videoRef.current;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // First visit plays the film; on return visits (intro already seen) the
    // hero shows its still poster and the headline reveals straight away.
    const seen = hasIntroPlayed();

    // ---- Reduced motion: still frame + text visible, no autoplay ----
    if (reduce) {
      if (video) video.pause();
      gsap.set([title, content, ...actions], { autoAlpha: 1, y: 0 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger, SplitText);
    if (!seen) video?.play().catch(() => {});

    // Prevent FOUC: hide the copy until the reveal
    gsap.set([...actions], { autoAlpha: 0 });
    gsap.set(title, { autoAlpha: 0 });

    const ctx = gsap.context(() => {
      let split: SplitText | null = null;
      let revealed = false;
      let failsafe: ReturnType<typeof setTimeout>;
      const onEnded = () => revealText();

      const revealText = () => {
        if (revealed) return;
        revealed = true;
        clearTimeout(failsafe);
        gsap
          .timeline()
          .to(
            ".hero__title .char",
            { yPercent: 0, duration: 1.3, ease: "power3.out", stagger: 0.03 },
            0
          )
          .to(
            actions,
            { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.12 },
            0.55
          );
      };

      const build = () => {
        // Split the two headline rows into characters (masked by .hero__line)
        split = new SplitText(lines, { type: "chars,words", charsClass: "char" });
        gsap.set(title, { autoAlpha: 1 });
        gsap.set(split.chars, { yPercent: 120 });
        gsap.set(actions, { autoAlpha: 0, y: 24 });

        if (seen) {
          // Return visit: no film playback — show the poster and reveal now.
          video?.pause();
          revealText();
        } else {
          // The headline + CTAs reveal when the product film reaches its end and stops.
          video?.addEventListener("ended", onEnded);
          // Failsafe: if autoplay is blocked / 'ended' never fires, reveal anyway.
          failsafe = setTimeout(revealText, (((video && video.duration) || 6) + 6) * 1000);
        }

        // ---- Scroll: the stopped film shrinks into a card and hands off ----
        const stl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "+=150%",
            scrub: 0.9,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        stl.to(cue, { autoAlpha: 0, duration: 0.3, ease: "power2.out" }, 0);
        stl.to(
          media,
          { scale: 0.62, borderRadius: 34, duration: 2.4, ease: "power2.inOut" },
          0.2
        );
        stl.to(
          content,
          { autoAlpha: 0, yPercent: -6, duration: 1.8, ease: "power2.inOut" },
          0.4
        );
        stl.to([scrimTop, scrimBottom], { autoAlpha: 0, duration: 1.4 }, 0.5);

        ScrollTrigger.refresh();
      };

      // Fonts must be measured before splitting so line breaks are correct
      if (document.fonts && document.fonts.status !== "loaded") {
        document.fonts.ready.then(build);
      } else {
        build();
      }

      // Re-split on resize so line breaks and masks stay accurate.
      // Ignore height-only changes (mobile browser chrome show/hide) so the
      // pinned timeline doesn't rebuild and jump mid-scroll.
      let rt: ReturnType<typeof setTimeout>;
      let lastW = window.innerWidth;
      const onResize = () => {
        if (window.innerWidth === lastW) return;
        lastW = window.innerWidth;
        clearTimeout(rt);
        rt = setTimeout(() => {
          split?.revert();
          ScrollTrigger.getAll().forEach((s) => s.kill());
          revealed = false;
          build();
          // keep text shown if the film had already ended
          if (video && video.ended) revealText();
        }, 220);
      };
      window.addEventListener("resize", onResize);

      return () => {
        clearTimeout(failsafe);
        window.removeEventListener("resize", onResize);
        video?.removeEventListener("ended", onEnded);
      };
    }, el);

    return () => ctx.revert();
  }, []);

  const handleWatch = () => {
    const target = document.getElementById("collezione");
    const lenis = (window as unknown as { lenis?: { scrollTo: (t: HTMLElement) => void } }).lenis;
    if (target && lenis) lenis.scrollTo(target);
    else target?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={root} className="hero" aria-label="The Double Twenty — cuscini ergonomici">
      {/* Product film — plays once, then stops on the revealed cushion */}
      <div className="hero__media">
        <video
          ref={videoRef}
          className="hero__video"
          poster="/images/hero-poster.jpg"
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src="/videos/hero.webm" type="video/webm" />
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="hero__scrim-top" />
      <div className="hero__scrim-bottom" />

      <div className="hero__content">
        <h1 className="hero__title">
          <span className="hero__line">
            <span className="hero__line-inner">Il comfort</span>
          </span>
          <span className="hero__line">
            <span className="hero__line-inner">
              prende <em>forma.</em>
            </span>
          </span>
        </h1>

        <div className="hero__actions">
          <a href="#collezione" className="btn btn--primary">
            Scopri la Collezione
            <span className="btn__arrow" aria-hidden="true">→</span>
          </a>
          <button type="button" className="btn btn--ghost" onClick={handleWatch}>
            <span className="btn__play" aria-hidden="true">
              <svg viewBox="0 0 8 8" fill="currentColor">
                <path d="M0 0v8l8-4z" />
              </svg>
            </span>
            Guarda il Comfort
          </button>
        </div>
      </div>

      <div className="hero__cue" aria-hidden="true">
        <span>Scorri</span>
        <span className="hero__cue-track" />
      </div>
    </section>
  );
}
