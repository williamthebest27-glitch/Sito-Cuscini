"use server";

/**
 * Server Action di invio ordine — STUB (nessuna API attiva).
 *
 * È la cucitura server verso le integrazioni: oggi valida i dati e restituisce
 * un id d'ordine simulato; domani, qui dentro, si collegheranno magazzino,
 * gestionale, fulfillment (Amazon MCF) e corriere — senza cambiare la UI.
 */
import { getRepository } from "@/lib/shop/repository";
import { computeTotals } from "@/lib/shop/cart/pricing";
import { validateDiscountCode } from "@/lib/shop/discounts";
import { toCartLine } from "@/lib/shop/cart/line";
// Predisposizione integrazioni (attualmente non configurate):
// import { getFulfillmentProvider, getInventoryProvider } from "@/lib/integrations";

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

  // --- Punto d'aggancio integrazioni (oggi inattivo) ---
  // const inventory = getInventoryProvider();
  // if (inventory?.isConfigured()) await inventory.reserve(input.lines);
  // const fulfiller = getFulfillmentProvider();
  // if (fulfiller?.isConfigured()) await fulfiller.createFulfillment({ ... });

  // Nessun pagamento reale viene elaborato in questa fase.
  return { ok: true, orderId: orderId(), total };
}
