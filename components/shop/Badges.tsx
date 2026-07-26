/**
 * Badge offerta / novità. Presentazionale, deriva le info dai selettori.
 */
import { getPriceSummary } from "@/lib/shop/selectors";
import type { Product } from "@/lib/shop/types";

export function SaleBadge({ percent }: { percent: number }) {
  return <span className="badge badge--sale">−{percent}%</span>;
}

export function NewBadge() {
  return <span className="badge badge--new">Novità</span>;
}

/** Badge derivati dallo stato del prodotto (offerta + novità). */
export default function ProductBadges({ product }: { product: Product }) {
  const price = getPriceSummary(product);
  if (!price.onSale && !product.isNew) return null;
  return (
    <div className="pcard__badges">
      {price.onSale && price.discountPercent ? (
        <SaleBadge percent={price.discountPercent} />
      ) : null}
      {product.isNew ? <NewBadge /> : null}
    </div>
  );
}
