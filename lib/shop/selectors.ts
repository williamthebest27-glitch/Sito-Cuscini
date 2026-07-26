/**
 * Selettori puri sul modello dominio: derivano prezzo, disponibilità, rating e
 * risoluzione varianti a partire da un `Product`. Nessun dato duplicato in
 * memoria — tutto si calcola da `variants`/`reviews`.
 */
import type {
  Availability,
  OptionType,
  PriceSummary,
  Product,
  RatingSummary,
  Variant,
} from "./types";

/** Soglia sotto la quale la disponibilità è "in esaurimento". */
export const LOW_STOCK_THRESHOLD = 5;

/** Sintesi prezzi (min/max, offerta, sconto %) di un prodotto. */
export function getPriceSummary(product: Product): PriceSummary {
  const prices = product.variants.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  // Riferimento offerta: guarda la variante più economica in sconto.
  let compareAt: number | undefined;
  let discountPercent: number | undefined;
  for (const v of product.variants) {
    if (v.compareAtPrice && v.compareAtPrice > v.price) {
      const pct = Math.round((1 - v.price / v.compareAtPrice) * 100);
      if (discountPercent === undefined || pct > discountPercent) {
        discountPercent = pct;
        compareAt = v.compareAtPrice;
      }
    }
  }

  return {
    min,
    max,
    compareAt,
    onSale: discountPercent !== undefined,
    discountPercent,
  };
}

/** Stock totale del prodotto (somma varianti). */
export function getTotalStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

/** Disponibilità aggregata del prodotto. */
export function getAvailability(product: Product): Availability {
  const total = getTotalStock(product);
  if (total <= 0) return "out-of-stock";
  if (total <= LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}

/** Disponibilità di una singola variante. */
export function getVariantAvailability(variant: Variant): Availability {
  if (variant.stock <= 0) return "out-of-stock";
  if (variant.stock <= LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}

/** Sintesi recensioni (media una cifra, conteggio). */
export function getRatingSummary(product: Product): RatingSummary {
  const count = product.reviews.length;
  if (count === 0) return { average: 0, count: 0 };
  const sum = product.reviews.reduce((s, r) => s + r.rating, 0);
  return { average: Math.round((sum / count) * 10) / 10, count };
}

/**
 * Trova la variante che corrisponde esattamente alla selezione data.
 * `selection` mappa asse → id valore. Ritorna undefined se combinazione assente.
 */
export function findVariant(
  product: Product,
  selection: Partial<Record<OptionType, string>>,
): Variant | undefined {
  const axes = product.options.map((o) => o.type);
  return product.variants.find((v) =>
    axes.every((axis) => v.options[axis] === selection[axis]),
  );
}

/** Prima variante disponibile (o la prima in assoluto) come default di selezione. */
export function getDefaultVariant(product: Product): Variant {
  return product.variants.find((v) => v.stock > 0) ?? product.variants[0];
}

/** Selezione d'opzioni della variante di default (per inizializzare la UI). */
export function getDefaultSelection(
  product: Product,
): Partial<Record<OptionType, string>> {
  return { ...getDefaultVariant(product).options };
}

/** Immagine di copertina: prima immagine di gallery del prodotto. */
export function getCoverImage(product: Product) {
  return product.images[0];
}
