"use client";

/** Barra di avanzamento verso la spedizione gratuita. */
import { useCart } from "@/lib/shop/cart/CartContext";
import { formatPrice } from "@/lib/shop/format";

export default function FreeShippingBar() {
  const { totals } = useCart();
  const { freeShippingThreshold, freeShippingRemaining } = totals;
  const reached = freeShippingRemaining <= 0 && totals.itemCount > 0;
  const pct = reached
    ? 100
    : Math.min(
        100,
        ((freeShippingThreshold - freeShippingRemaining) / freeShippingThreshold) *
          100,
      );

  return (
    <div className="freeship">
      {reached ? (
        <span>🎉 Hai la <strong>spedizione gratuita</strong>!</span>
      ) : (
        <span>
          Ti mancano <strong>{formatPrice(freeShippingRemaining)}</strong> alla
          spedizione gratuita.
        </span>
      )}
      <div className="freeship__bar" aria-hidden="true">
        <div className="freeship__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
