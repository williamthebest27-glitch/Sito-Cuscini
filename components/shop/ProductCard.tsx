/**
 * Card prodotto per la griglia. Server Component: solo il quick-add è client.
 * Riusa l'estetica delle card del sito (radius 22, media a gradiente, hover lift).
 */
import Link from "next/link";
import { formatRating } from "@/lib/shop/format";
import {
  getAvailability,
  getPriceSummary,
  getRatingSummary,
} from "@/lib/shop/selectors";
import type { Product } from "@/lib/shop/types";
import ProductBadges from "./Badges";
import Price from "./Price";
import ProductMedia from "./ProductMedia";
import QuickAddButton from "./QuickAddButton";

export default function ProductCard({
  product,
  categoryLabel,
  priority = false,
}: {
  product: Product;
  categoryLabel?: string;
  priority?: boolean;
}) {
  const price = getPriceSummary(product);
  const rating = getRatingSummary(product);
  const availability = getAvailability(product);
  const href = `/prodotti/${product.slug}`;
  const multiPrice = price.min !== price.max;

  return (
    <article className="pcard">
      <div className="pcard__media">
        <Link href={href} className="pcard__link" aria-label={product.name}>
          <span className="pcard__media-inner">
            <ProductMedia
              image={product.images[0]}
              glyph={product.name.charAt(0)}
              sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 320px"
              priority={priority}
            />
          </span>
        </Link>
        <ProductBadges product={product} />
        {availability !== "out-of-stock" ? (
          <QuickAddButton product={product} />
        ) : (
          <span className="badge badge--soft pcard__quick" style={{ opacity: 1, transform: "none" }}>
            Esaurito
          </span>
        )}
      </div>

      <div className="pcard__body">
        <div className="pcard__head">
          <h3 className="pcard__name">
            <Link href={href}>{product.name}</Link>
          </h3>
          {rating.count > 0 ? (
            <span className="rating__count" aria-hidden="true">
              ★ {formatRating(rating.average)}
            </span>
          ) : null}
        </div>
        {categoryLabel ? <span className="pcard__cat">{categoryLabel}</span> : null}
        <p className="pcard__tagline">{product.tagline}</p>
        <div className="pcard__foot">
          <Price amount={price.min} compareAt={price.compareAt} from={multiPrice} />
        </div>
      </div>
    </article>
  );
}
