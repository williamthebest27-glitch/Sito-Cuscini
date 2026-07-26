"use server";

/**
 * Server Action di invio ordine.
 *
 * Flusso: valida → ricostruisce l'ordine da fonte affidabile → **incassa il
 * pagamento** → **solo a pagamento confermato** crea l'ordine di evasione
 * Amazon MCF (se configurato). Se non c'è un gateway reale, il pagamento passa
 * dal ManualPaymentProvider (conferma simulata) così il flusso è completo con
 * le sole credenziali SP-API. Se MCF fallisce dopo un pagamento riuscito,
 * l'ordine resta valido (warning non bloccante) e l'evasione va ritentata.
 */
import { getRepository } from "@/lib/shop/repository";
import { computeTotals } from "@/lib/shop/cart/pricing";
import { validateDiscountCode } from "@/lib/shop/discounts";
import { toCartLine } from "@/lib/shop/cart/line";
import type { CartLine } from "@/lib/shop/cart/types";
import {
  getFulfillmentProvider,
  getPaymentProvider,
  type FulfillmentStatus,
  type PaymentStatus,
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
  /**
   * Chiave di idempotenza generata dal client (una per tentativo di checkout):
   * garantisce che un retry non crei un secondo ordine/evasione MCF.
   */
  idempotencyKey?: string;
}

export interface PlaceOrderResult {
  ok: boolean;
  orderId?: string;
  total?: number;
  error?: string;
  /** Esito del pagamento. */
  payment?: {
    status: PaymentStatus;
    /** true se conferma simulata (nessun addebito reale). */
    simulated: boolean;
    message?: string;
  };
  /** Presente se l'ordine è stato inoltrato a un provider di evasione (es. MCF). */
  fulfillment?: {
    provider: string;
    providerOrderId: string;
    status: FulfillmentStatus;
  };
  /** Avviso non bloccante (es. MCF fallito dopo pagamento riuscito). */
  warning?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Id ordine stabile: derivato dalla chiave di idempotenza (se presente), così
 * i retry riusano lo stesso id e MCF resta idempotente sul sellerFulfillmentOrderId.
 */
function makeOrderId(key?: string): string {
  if (key) {
    const clean = key.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (clean.length >= 6) return `TDT-${clean.slice(0, 12)}`;
  }
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  const stamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `TDT-${stamp}${rnd}`;
}

/** Crea l'ordine di evasione MCF per un ordine già pagato. Idempotente sull'orderId. */
async function fulfillWithMcf(
  orderId: string,
  cartLines: CartLine[],
  address: CheckoutAddress,
  email: string,
  shippingMethod: "standard" | "express",
): Promise<PlaceOrderResult["fulfillment"] | { error: string }> {
  const fulfiller = getFulfillmentProvider();
  if (!fulfiller?.isConfigured()) return undefined;
  try {
    const res = await fulfiller.createFulfillment({
      orderId,
      lines: cartLines.map((l) => ({ sku: l.sku, quantity: l.quantity })),
      shippingAddress: { ...address, email },
      speed: shippingMethod === "express" ? "expedited" : "standard",
    });
    return {
      provider: res.provider,
      providerOrderId: res.providerOrderId,
      status: res.status,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errore sconosciuto" };
  }
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

  const id = makeOrderId(input.idempotencyKey);

  // --- 1) Pagamento (gateway reale se configurato, altrimenti manuale) ---
  const payment = await getPaymentProvider().createPayment({
    orderId: id,
    amount: total,
    currency: "EUR",
    method: input.paymentMethod,
    email: input.email,
  });

  if (payment.status === "failed") {
    return {
      ok: false,
      error: payment.message ?? "Pagamento non riuscito. Riprova.",
      payment: { status: payment.status, simulated: payment.simulated, message: payment.message },
    };
  }

  const result: PlaceOrderResult = {
    ok: true,
    orderId: id,
    total,
    payment: { status: payment.status, simulated: payment.simulated, message: payment.message },
  };

  // --- 2) Evasione MCF: SOLO a pagamento confermato ("paid") ---
  if (payment.status === "paid") {
    const outcome = await fulfillWithMcf(
      id,
      cartLines,
      input.address,
      input.email,
      input.shippingMethod,
    );
    if (outcome && "error" in outcome) {
      // Il pagamento è andato a buon fine: non si perde l'ordine. L'evasione
      // andrà ritentata (retry con la stessa idempotencyKey = stesso ordine MCF).
      result.warning = `Evasione Amazon in sospeso: ${outcome.error}`;
    } else if (outcome) {
      result.fulfillment = outcome;
    }
  }
  // Se status === "pending" (es. bonifico) l'evasione NON parte finché il
  // pagamento non è confermato.

  return result;
}
