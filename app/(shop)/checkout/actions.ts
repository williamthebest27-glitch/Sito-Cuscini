"use server";

/**
 * Server Action di invio ordine.
 *
 * Valida i dati, ricostruisce l'ordine da fonte affidabile e — se Amazon MCF è
 * configurato — crea l'ordine di evasione via SP-API. Senza credenziali MCF,
 * l'ordine viene registrato con un id simulato (nessun pagamento reale viene
 * elaborato in questa fase).
 */
import { getRepository } from "@/lib/shop/repository";
import { computeTotals } from "@/lib/shop/cart/pricing";
import { validateDiscountCode } from "@/lib/shop/discounts";
import { toCartLine } from "@/lib/shop/cart/line";
import {
  getFulfillmentProvider,
  type FulfillmentStatus,
} from "@/lib/integrations";

export interface CheckoutAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface PlaceOrderInput {
  email: string;
  address: CheckoutAddress;
  lines: { sku: string; quantity: number }[];
  shippingMethod: "standard" | "express";
  paymentMethod: string;
  discountCode?: string;
  notes?: string;
}

export interface PlaceOrderResult {
  ok: boolean;
  orderId?: string;
  total?: number;
  error?: string;
  /** Presente se l'ordine è stato inoltrato a un provider di evasione (es. MCF). */
  fulfillment?: {
    provider: string;
    providerOrderId: string;
    status: FulfillmentStatus;
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function orderId(): string {
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  const stamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `TDT-${stamp}${rnd}`;
}

export async function placeOrder(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  // --- Validazione lato server (fonte di verità) ---
  if (!EMAIL_RE.test(input.email)) {
    return { ok: false, error: "Email non valida." };
  }
  const a = input.address;
  if (!a.fullName || !a.line1 || !a.city || !a.province || !a.postalCode) {
    return { ok: false, error: "Indirizzo di spedizione incompleto." };
  }
  if (!input.lines.length) {
    return { ok: false, error: "Il carrello è vuoto." };
  }

  // --- Ricostruzione righe da fonte affidabile (prezzi dal repository) ---
  const repo = getRepository();
  const products = await repo.getAll();
  const cartLines = [];
  for (const l of input.lines) {
    const product = products.find((p) => p.variants.some((v) => v.sku === l.sku));
    const variant = product
      ? product.variants.find((v) => v.sku === l.sku)
      : undefined;
    if (!product || !variant) {
      return { ok: false, error: `Articolo non più disponibile: ${l.sku}.` };
    }
    // Verifica disponibilità (in futuro: getInventoryProvider()?.getStock).
    if (variant.stock <= 0) {
      return { ok: false, error: `Esaurito: ${product.name}.` };
    }
    cartLines.push(toCartLine(product, variant, Math.max(1, l.quantity)));
  }

  // Sconto validato di nuovo lato server.
  const subtotal = cartLines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  let discount = null;
  if (input.discountCode) {
    const res = validateDiscountCode(input.discountCode, subtotal);
    if (res.ok && res.discount) discount = res.discount;
  }
  const totals = computeTotals(cartLines, discount);
  const expressSurcharge = input.shippingMethod === "express" ? 500 : 0;
  const total = totals.total + expressSurcharge;

  const id = orderId();

  // --- Evasione ordine via Amazon MCF (se configurato) ---
  const fulfiller = getFulfillmentProvider();
  let fulfillment: PlaceOrderResult["fulfillment"];
  if (fulfiller?.isConfigured()) {
    try {
      const res = await fulfiller.createFulfillment({
        orderId: id,
        lines: input.lines,
        shippingAddress: { ...input.address, email: input.email },
        speed: input.shippingMethod === "express" ? "expedited" : "standard",
      });
      fulfillment = {
        provider: res.provider,
        providerOrderId: res.providerOrderId,
        status: res.status,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "errore sconosciuto";
      return { ok: false, error: `Evasione Amazon non riuscita: ${msg}` };
    }
  }

  // Nessun pagamento reale viene elaborato in questa fase.
  return { ok: true, orderId: id, total, fulfillment };
}
