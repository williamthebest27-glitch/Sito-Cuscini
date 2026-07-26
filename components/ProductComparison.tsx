"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * SECTION 04 — Product comparison.
 * Two self-contained product cards (never a table): a plain pillow vs the
 * Double Twenty. The headline splits in, both cards rise, then the feature
 * rows deal out one pair at a time while each mark is *drawn* with a stroke.
 */

const FEATURES = [
  "Memory Foam",
  "Tessuto traspirante",
  "Supporto cervicale",
  "Forma ergonomica",
  "Rivestimento lavabile",
  "Materiali Premium",
  "Migliore distribuzione della pressione",
  "Comfort durante tutta la notte",
  "Riduzione dei punti di pressione",
  "Design ergonomico",
];

// What an ordinary pillow actually offers — honest, and clearly outclassed.
const TRADITIONAL = [
  false, false, false, false, true, false, false, false, false, false,
];

type CardDef = {
  variant: "std" | "dt";
  kicker: string;
  name: string;
  tag: string;
  has: (i: number) => boolean;
  badge?: string;
};

const CARDS: CardDef[] = [
  {
    variant: "std",
    kicker: "Standard",
    name: "Cuscino Tradizionale",
    tag: "Il cuscino di tutti i giorni.",
    has: (i) => TRADITIONAL[i],
  },
  {
    variant: "dt",
    kicker: "The Double Twenty",
    name: "Double Twenty Pillow",
    tag: "Ingegnerizzato per il tuo riposo.",
    has: () => true,
    badge: "La scelta migliore",
  },
];

function Mark({ ok }: { ok: boolean }) {
  return (
    <span className={`compare__mark ${ok ? "is-yes" : "is-no"}`} aria-hidden="true">
      <svg viewBox="0 0 22 22">
        {ok ? (
          <path d="M5 12l3.6 3.6L17 6.6" />
        ) : (
          <path d="M6 11h10" />
        )}
      </svg>
    </span>
  );
}

export default function ProductComparison() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const q = gsap.utils.selector(el);
    const eyebrow = q(".compare__eyebrow")[0] as HTMLElement;
    const title = q(".compare__title")[0] as HTMLElement;
    const sub = q(".compare__sub")[0] as HTMLElement;
    const rises = q(".compare__rise") as HTMLElement[];
    const rows = q(".compare__row") as HTMLElement[];
    const stdRows = q(".compare__card--std .compare__row") as HTMLElement[];
    const dtRows = q(".compare__card--dt .compare__row") as HTMLElement[];
    const stdMarks = q(".compare__card--std .compare__mark path") as unknown as SVGGeometryElement[];
    const dtMarks = q(".compare__card--dt .compare__mark path") as unknown as SVGGeometryElement[];

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const prepMarks = (paths: SVGGeometryElement[], drawn: boolean) =>
      paths.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, {
          strokeDasharray: len,
          strokeDashoffset: drawn ? 0 : len,
        });
      });

    if (reduce) {
      gsap.set([eyebrow, sub, ...rises, ...rows], { autoAlpha: 1, y: 0 });
      prepMarks([...stdMarks, ...dtMarks], true);
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
        gsap.set(eyebrow, { autoAlpha: 0, y: 18 });
        gsap.set(sub, { autoAlpha: 0, y: 18 });
        gsap.set(rises, { autoAlpha: 0, y: 46 });
        gsap.set(rows, { autoAlpha: 0, y: 16 });
        prepMarks([...stdMarks, ...dtMarks], false);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top 68%",
            once: true,
          },
        });

        tl.to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0)
          .to(
            split.chars,
            { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.018 },
            0.08
          )
          .to(sub, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0.32)
          // the two cards rise together
          .to(
            rises,
            { autoAlpha: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.12 },
            0.48
          )
          // each feature reveals as a synced pair, left and right at once
          .to(
            stdRows,
            { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.085 },
            0.9
          )
          .to(
            dtRows,
            { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.085 },
            0.9
          )
          // and the mark is drawn, in step with its row
          .to(
            stdMarks,
            { strokeDashoffset: 0, duration: 0.5, ease: "power2.out", stagger: 0.085 },
            1.02
          )
          .to(
            dtMarks,
            { strokeDashoffset: 0, duration: 0.5, ease: "power2.out", stagger: 0.085 },
            1.02
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
          gsap.set([...rises, ...rows], { clearProps: "opacity,transform" });
          build();
        }, 220);
      };
      window.addEventListener("resize", onResize);

      return () => window.removeEventListener("resize", onResize);
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="confronto" className="compare" aria-label="Confronto prodotto">
      <div className="compare__head">
        <span className="compare__eyebrow">04 — Il confronto</span>
        <h2 className="compare__title">
          Un altro <em>standard</em>.
        </h2>
        <p className="compare__sub">
          Metti a confronto un cuscino tradizionale con il Double Twenty.
          La differenza è evidente prima ancora di appoggiare la testa.
        </p>
      </div>

      <div className="compare__grid">
        {CARDS.map((card) => (
          <article
            key={card.variant}
            className={`compare__card compare__card--${card.variant}`}
          >
            <div className="compare__rise">
              {card.badge && <span className="compare__badge">{card.badge}</span>}

              <div className="compare__identity">
                <span className="compare__orb" aria-hidden="true" />
                <div className="compare__id-text">
                  <span className="compare__kicker">{card.kicker}</span>
                  <h3 className="compare__name">{card.name}</h3>
                  <p className="compare__tag">{card.tag}</p>
                </div>
              </div>

              <ul className="compare__rows">
                {FEATURES.map((feature, i) => {
                  const ok = card.has(i);
                  return (
                    <li
                      key={feature}
                      className={`compare__row ${ok ? "is-yes" : "is-no"}`}
                    >
                      <Mark ok={ok} />
                      <span className="compare__label">{feature}</span>
                      <span className="sr-only">{ok ? "Incluso" : "Non incluso"}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
