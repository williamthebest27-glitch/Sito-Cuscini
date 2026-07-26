/**
 * Tipi del carrello (dominio, senza React).
 * Ogni riga corrisponde a uno SKU: `id === sku`.
 */
import type { ProductImage } from "../types";

/** Sconto applicato al carrello (predisposto per codici reali/API). */
export interface AppliedDiscount {
  code: string;
  kind: "percent" | "fixed";
  /** percent: 0–100; fixed: centesimi. */
  value: number;
  /** Etichetta mostrata all'utente. */
  label: string;
}

/** Riga di carrello: snapshot sufficiente a renderizzare e ricalcolare offline. */
export interface CartLine {
  /** = sku. */
  id: string;
  productId: string;
  slug: string;
  name: string;
  sku: string;
  /** Prezzo unitario in centesimi. */
  unitPrice: number;
  /** Prezzo pieno barrato in centesimi (se in offerta). */
  compareAtPrice?: number;
  quantity: number;
  image: ProductImage;
  /** Etichetta varianti, es. "Medio · 50 × 70 cm". */
  optionsLabel: string;
  /** Stock massimo acquistabile per questa variante. */
  maxStock: number;
}

/** Stato serializzabile del carrello (persistito in localStorage). */
export interface CartState {
  lines: CartLine[];
  discount: AppliedDiscount | null;
}

/** Totali calcolati (tutti in centesimi tranne i conteggi). */
export interface CartTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  /** Risparmio da offerte (compareAt − prezzo). */
  savings: number;
  freeShippingThreshold: number;
  /** Quanto manca alla spedizione gratuita (0 se già raggiunta). */
  freeShippingRemaining: number;
  itemCount: number;
}
