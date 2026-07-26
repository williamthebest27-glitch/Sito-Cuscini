/**
 * Costruzione di una riga di carrello da (prodotto, variante). Puro, senza
 * React: riusato dalla scheda prodotto e dal quick-add della griglia.
 */
import type { OptionType, Product, ProductImage, Variant } from "../types";
import type { CartLine } from "./types";

/** Etichetta leggibile delle opzioni scelte, es. "Medio · 50 × 70 cm". */
export function variantLabel(product: Product, variant: Variant): string {
  const parts: string[] = [];
  for (const opt of product.options) {
    const valueId = variant.options[opt.type as OptionType];
    if (!valueId) continue;
    const value = opt.values.find((v) => v.id === valueId);
    if (value) parts.push(value.label);
  }
  return parts.join(" · ");
}

/** Immagine della riga: copertina del prodotto, con tono della variante se colore. */
export function lineImage(product: Product, variant: Variant): ProductImage {
  const cover = product.images[0];
  if (variant.tone) {
    return { ...cover, tone: variant.tone };
  }
  return cover;
}

/** Trasforma prodotto + variante in una riga di carrello pronta all'uso. */
export function toCartLine(
  product: Product,
  variant: Variant,
  quantity: number,
): CartLine {
  return {
    id: variant.sku,
    productId: product.id,
    slug: product.slug,
    name: product.name,
    sku: variant.sku,
    unitPrice: variant.price,
    compareAtPrice: variant.compareAtPrice,
    quantity,
    image: lineImage(product, variant),
    optionsLabel: variantLabel(product, variant),
    maxStock: variant.stock,
  };
}
