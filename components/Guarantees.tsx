"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * SECTION 05 — Guarantees.
 * Very airy, lots of breathing room. Four glass cards stagger in; each icon
 * floats and glows continuously (CSS). A thin thread grows from the previous
 * section to keep the handoff cinematic.
 */

type Guarantee = {
  title: string;
  desc: string;
  icon: React.ReactNode;
};

const GUARANTEES: Guarantee[] = [
  {
    title: "30 Notti di Prova",
    desc: "Dormi serenamente. Se non sei soddisfatto puoi effettuare il reso secondo la nostra politica.",
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M23 20.2A9 9 0 1 1 12.4 8a7 7 0 0 0 10.6 12.2Z" />
        <path d="M24.5 7v3.4M22.8 8.7h3.4" />
      </svg>
    ),
  },
  {
    title: "Reso Facile",
    desc: "Procedura semplice e veloce.",
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M9 12.5h9.5a5.5 5.5 0 0 1 0 11H14" />
        <path d="M12.5 8.5 8 12.5l4.5 4" />
      </svg>
    ),
  },
  {
    title: "Spedizione Rapida",
    desc: "Preparazione e spedizione in tempi rapidi.",
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16 7.5 24 12v8l-8 4.5L8 20v-8z" />
        <path d="M8 12l8 4.5L24 12M16 16.5v8" />
        <path d="M2.5 12H6M1.5 17h4.5" />
      </svg>
    ),
  },
  {
    title: "Pagamenti Sicuri",
    desc: "Stripe, PayPal, Apple Pay e Google Pay.",
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16 4.5 26 8v6c0 5.8-4 9.7-10 13.5C10 23.7 6 19.8 6 14V8z" />
        <path d="M11.6 15.4 14.5 18.3 20.6 12" />
      </svg>
    ),
  },
];

export default function Guarantees() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const q = gsap.utils.selector(el);
    const eyebrow = q(".promise__eyebrow")[0] as HTMLElement;
    const title = q(".promise__title")[0] as HTMLElement;
    const sub = q(".promise__sub")[0] as HTMLElement;
    const thread = q(".promise__thread")[0] as HTMLElement;
    const rises = q(".promise__rise") as HTMLElement[];

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      gsap.set([eyebrow, sub, ...rises], { autoAlpha: 1, y: 0 });
      gsap.set(thread, { scaleY: 1 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger, SplitText);

    const ctx = gsap.context(() => {
      let split: SplitText | null = null;

      const build = () => {
        split = new SplitText(title, {
          type: "lines,chars",
          linesClass: "c-line",
          charsClass: "char",
        });

        gsap.set(split.chars, { yPercent: 115 });
        gsap.set(eyebrow, { autoAlpha: 0, y: 16 });
        gsap.set(sub, { autoAlpha: 0, y: 16 });
        gsap.set(rises, { autoAlpha: 0, y: 44 });
        gsap.set(thread, { scaleY: 0, transformOrigin: "top" });

        // the thread draws itself as you scroll into the section
        gsap.to(thread, {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
            end: "top 52%",
            scrub: true,
          },
        });

        // header reveal on enter
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 70%", once: true },
        });
        tl.to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0)
          .to(
            split.chars,
            { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.02 },
            0.08
          )
          .to(sub, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0.35);

        // cards stagger up as the row enters
        ScrollTrigger.batch(rises, {
          start: "top 84%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 1,
              ease: "power3.out",
              stagger: 0.13,
              overwrite: true,
            }),
        });

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
          gsap.set(rises, { clearProps: "opacity,transform" });
          build();
        }, 220);
      };
      window.addEventListener("resize", onResize);

      return () => window.removeEventListener("resize", onResize);
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="garanzie" className="promise" aria-label="Le nostre garanzie">
      <div className="promise__head">
        <span className="promise__thread" aria-hidden="true" />
        <span className="promise__eyebrow">05 — Le garanzie</span>
        <h2 className="promise__title">
          La nostra <em>promessa</em>
        </h2>
        <p className="promise__sub">
          Ogni dettaglio è pensato per farti dormire — e acquistare — con la
          massima serenità.
        </p>
      </div>

      <div className="promise__grid">
        {GUARANTEES.map((g) => (
          <article key={g.title} className="promise__card">
            <div className="promise__rise">
              <span className="promise__icon">{g.icon}</span>
              <h3 className="promise__card-title">{g.title}</h3>
              <p className="promise__card-desc">{g.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
