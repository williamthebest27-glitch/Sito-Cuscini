"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type { Product } from "@/lib/woocommerce";

/**
 * The collection storefront — WooCommerce products in the site's own visual
 * language. Header splits in, product cards stagger up on enter, soft hover
 * lift. Falls back gracefully to a gradient when a product has no image.
 */
export default function CollectionShop({
  products,
  isDemo,
}: {
  products: Product[];
  isDemo: boolean;
}) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const q = gsap.utils.selector(el);
    const eyebrow = q(".shop__eyebrow")[0] as HTMLElement;
    const title = q(".shop__title")[0] as HTMLElement;
    const sub = q(".shop__sub")[0] as HTMLElement;
    const cards = q(".product") as HTMLElement[];

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      gsap.set([eyebrow, sub, ...cards], { autoAlpha: 1, y: 0 });
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
        gsap.set(cards, { autoAlpha: 0, y: 42 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 78%", once: true },
        });
        tl.to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0)
          .to(
            split.chars,
            { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.02 },
            0.08
          )
          .to(sub, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0.32);

        ScrollTrigger.batch(cards, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 1,
              ease: "power3.out",
              stagger: 0.1,
              overwrite: true,
              // free the transform so the CSS hover lift takes over afterwards
              clearProps: "transform",
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
      const onResize = () => {
        clearTimeout(rt);
        rt = setTimeout(() => {
          split?.revert();
          ScrollTrigger.getAll().forEach((s) => {
            if (s.trigger === el) s.kill();
          });
          gsap.set(cards, { clearProps: "opacity,transform" });
          build();
        }, 220);
      };
      window.addEventListener("resize", onResize);

      return () => window.removeEventListener("resize", onResize);
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="shop" aria-label="La collezione">
      <header className="shop__head">
        <span className="shop__eyebrow">Il negozio — {products.length} pezzi</span>
        <h1 className="shop__title">
          La <em>Collezione</em>
        </h1>
        <p className="shop__sub">
          Ogni cuscino, un principio: accompagnare il corpo senza forzarlo.
          Puro lattice naturale, traspirante e duraturo.
        </p>
        {isDemo && (
          <p className="shop__note" role="status">
            Anteprima — collega il tuo store WooCommerce per mostrare i
            prodotti reali.
          </p>
        )}
      </header>

      <div className="shop__grid">
        {products.map((p) => {
          const buyable = p.permalink && p.permalink !== "#";
          return (
            <article key={p.id} className="product">
              <div className="product__media">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="product__img"
                    src={p.image}
                    alt={p.imageAlt || p.name}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="product__ph" aria-hidden="true" />
                )}
                {p.onSale && <span className="product__flag">In offerta</span>}
              </div>

              <div className="product__body">
                <h2 className="product__name">{p.name}</h2>
                {p.shortDescription && (
                  <p className="product__desc">{p.shortDescription}</p>
                )}

                <div className="product__foot">
                  <span className="product__price">
                    {p.regularPrice && (
                      <span className="product__price-was">{p.regularPrice}</span>
                    )}
                    {p.price}
                  </span>

                  {buyable ? (
                    <a
                      className="product__buy"
                      href={p.permalink}
                      aria-label={`Acquista ${p.name}`}
                    >
                      Acquista
                      <span className="product__arrow" aria-hidden="true">→</span>
                    </a>
                  ) : (
                    <span className="product__buy product__buy--soon" aria-hidden="true">
                      In arrivo
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="shop__back">
        <Link href="/" className="shop__back-link">
          <span aria-hidden="true">←</span> Torna alla home
        </Link>
      </div>
    </section>
  );
}
