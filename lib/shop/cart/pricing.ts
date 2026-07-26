/**
 * Calcolo totali del carrello — funzioni pure, riusabili lato client e server.
 * Politiche commerciali centralizzate qui (soglia spedizione gratuita, costo).
 */
import type { AppliedDiscount, CartLine, CartTotals } from "./types";

/** Spedizione gratuita a partire da questo importo (centesimi). */
export const FREE_SHIPPING_THRESHOLD = 6900; // 69,00 €
/** Costo di spedizione standard sotto soglia (centesimi). */
export const STANDARD_SHIPPING = 490; // 4,90 €

export function countItems(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.quantity, 0);
}

export function computeSubtotal(lines: CartLine[]): number {
  return lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
}

export function computeSavings(lines: CartLine[]): number {
  return lines.reduce((s, l) => {
    if (l.compareAtPrice && l.compareAtPrice > l.unitPrice) {
      return s + (l.compareAtPrice - l.unitPrice) * l.quantity;
    }
    return s;
  }, 0);
}

/** Importo dello sconto applicato, non oltre il subtotale. */
export function computeDiscountAmount(
  subtotal: number,
  discount: AppliedDiscount | null,
): number {
  if (!discount || subtotal <= 0) return 0;
  const raw =
    discount.kind === "percent"
      ? Math.round((subtotal * discount.value) / 100)
      : discount.value;
  return Math.min(raw, subtotal);
}

/** Spedizione: gratuita a carrello vuoto e sopra soglia, altrimenti standard. */
export function computeShipping(subtotalAfterDiscount: number): number {
  if (subtotalAfterDiscount <= 0) return 0;
  return subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
}

/** Totali completi del carrello. */
export function computeTotals(
  lines: CartLine[],
  discount: AppliedDiscount | null,
): CartTotals {
  const subtotal = computeSubtotal(lines);
  const discountAmount = computeDiscountAmount(subtotal, discount);
  const afterDiscount = subtotal - discountAmount;
  const shipping = computeShipping(afterDiscount);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - afterDiscount);

  return {
    subtotal,
    discount: discountAmount,
    shipping,
    total: afterDiscount + shipping,
    savings: computeSavings(lines),
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    freeShippingRemaining: subtotal <= 0 ? FREE_SHIPPING_THRESHOLD : remaining,
    itemCount: countItems(lines),
  };
}
