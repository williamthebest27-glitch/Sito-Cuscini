/**
 * Blocco recensioni: sintesi (media + conteggio) e lista. Server Component.
 */
import { formatDate, formatRating } from "@/lib/shop/format";
import { getRatingSummary } from "@/lib/shop/selectors";
import type { Product } from "@/lib/shop/types";
import { IconCheck } from "./icons";
import Rating from "./Rating";

export default function Reviews({ product }: { product: Product }) {
  const summary = getRatingSummary(product);
  if (summary.count === 0) return null;

  return (
    <section className="pdp-blocks__wide" aria-label="Recensioni">
      <h2 className="block__title">Recensioni</h2>

      <div className="reviews__summary">
        <span className="reviews__avg">{formatRating(summary.average)}</span>
        <div>
          <Rating value={summary.average} showCount={false} />
          <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginTop: "0.3rem" }}>
            Basata su {summary.count}{" "}
            {summary.count === 1 ? "recensione" : "recensioni"} verificate
          </p>
        </div>
      </div>

      <div>
        {product.reviews.map((r) => (
          <article key={r.id} className="review">
            <div className="review__head">
              <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                <span className="review__author">{r.author}</span>
                {r.verified ? (
                  <span className="review__verified">
                    <IconCheck style={{ width: 12, height: 12 }} /> Acquisto verificato
                  </span>
                ) : null}
              </div>
              <span className="review__date">{formatDate(r.date)}</span>
            </div>
            <Rating value={r.rating} showCount={false} />
            {r.title ? <p className="review__title" style={{ marginTop: "0.4rem" }}>{r.title}</p> : null}
            <p className="review__body">{r.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
