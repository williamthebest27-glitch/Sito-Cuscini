"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

const CARDS = [
  { icon: "🧠", title: "Memory Foam", desc: "Mantiene la forma." },
  { icon: "🌬", title: "Traspirante", desc: "Fori di ventilazione." },
  { icon: "😴", title: "Supporto cervicale", desc: "Riduce la pressione." },
  { icon: "🧺", title: "Rivestimento lavabile", desc: "Facile da pulire." },
];

// fan angles / lift for each card when stacked in the centre (like a held hand)
const FAN = [
  { angle: -15, lift: 26 },
  { angle: -5, lift: 6 },
  { angle: 5, lift: 6 },
  { angle: 15, lift: 26 },
];

export default function WhyDifferent() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const q = gsap.utils.selector(el);
    const eyebrow = q(".why__eyebrow")[0];
    const titleInner = q(".why__title-inner");
    const wrap = q(".why__cards")[0] as HTMLElement;
    const cards = q(".why__card") as HTMLElement[];
    const inners = q(".why__card-inner");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      gsap.set([eyebrow, ...inners], { autoAlpha: 1, y: 0 });
      gsap.set(cards, { clearProps: "all" });
      return;
    }

    gsap.registerPlugin(ScrollTrigger, SplitText);

    const ctx = gsap.context(() => {
      let split: SplitText | null = null;

      const build = () => {
        split = new SplitText(titleInner, { type: "chars", charsClass: "char" });

        // Compute each card's offset to the wrapper centre so they stack in the middle
        const wr = wrap.getBoundingClientRect();
        const cx = wr.left + wr.width / 2;
        const cy = wr.top + wr.height / 2;

        cards.forEach((card, i) => {
          const r = card.getBoundingClientRect();
          const dx = cx - (r.left + r.width / 2);
          const dy = cy - (r.top + r.height / 2);
          const f = FAN[i] ?? { angle: 0, lift: 0 };
          gsap.set(card, {
            x: dx,
            y: dy + f.lift,
            rotation: f.angle,
            scale: 0.9,
            transformOrigin: "50% 120%",
            zIndex: i,
          });
        });

        gsap.set(split.chars, { yPercent: 115 });
        gsap.set(eyebrow, { autoAlpha: 0, y: 18 });
        gsap.set(inners, { autoAlpha: 0, y: 14 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "+=190%",
            scrub: 0.9,
            pin: true,
            anticipatePin: 1,
          },
        });

        tl.to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0);
        tl.to(
          split.chars,
          { yPercent: 0, duration: 1, ease: "power3.out", stagger: 0.03 },
          0.1
        );
        // the fan opens — cards deal out to their row and straighten
        tl.to(
          cards,
          {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 1.6,
            ease: "power3.out",
            stagger: 0.1,
          },
          0.5
        );
        tl.to(
          inners,
          { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.08 },
          0.9
        );

        ScrollTrigger.refresh();
      };

      if (document.fonts && document.fonts.status !== "loaded") {
        document.fonts.ready.then(build);
      } else {
        build();
      }

      let rt: ReturnType<typeof setTimeout>;
      let lastW = window.innerWidth;
      const onResize = () => {
        if (window.innerWidth === lastW) return; // ignore mobile chrome height shifts
        lastW = window.innerWidth;
        clearTimeout(rt);
        rt = setTimeout(() => {
          split?.revert();
          ScrollTrigger.getAll().forEach((s) => {
            if (s.trigger === el) s.kill();
          });
          gsap.set(cards, { clearProps: "all" });
          build();
        }, 220);
      };
      window.addEventListener("resize", onResize);

      return () => window.removeEventListener("resize", onResize);
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="perche" className="why" aria-label="Perché è diverso">
      <div className="why__head">
        <span className="why__eyebrow">03 — Il dettaglio</span>
        <h2 className="why__title">
          <span className="why__title-inner">Perché è diverso</span>
        </h2>
      </div>

      <div className="why__cards">
        {CARDS.map((c) => (
          <article key={c.title} className="why__card">
            <div className="why__card-inner">
              <span className="why__icon" aria-hidden="true">
                {c.icon}
              </span>
              <h3 className="why__card-title">{c.title}</h3>
              <p className="why__card-desc">{c.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
