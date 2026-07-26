/**
 * Provider di pagamento "manuale" — fallback usato quando nessun gateway reale
 * (Stripe/PayPal) è configurato.
 *
 * Non addebita nulla: conferma i pagamenti online in modo **simulato** (così il
 * flusso ordine→evasione MCF è completo con le sole credenziali SP-API), mentre
 * il bonifico resta "pending" finché non confermi tu l'accredito.
 *
 * Sostituiscilo con un provider reale per incassare davvero: l'evasione MCF
 * scatterà comunque solo quando `createPayment` ritorna status "paid".
 */
import type {
  PaymentProvider,
  PaymentRequest,
  PaymentResult,
} from "../types";

export class ManualPaymentProvider implements PaymentProvider {
  readonly name = "manual";

  /** Sempre disponibile: è il fallback. */
  isConfigured(): boolean {
    return true;
  }

  async createPayment(req: PaymentRequest): Promise<PaymentResult> {
    // Bonifico bancario: nessuna conferma automatica → l'ordine attende l'accredito.
    if (req.method === "bonifico") {
      return {
        provider: this.name,
        status: "pending",
        paymentId: `MAN-${req.orderId}`,
        simulated: true,
        message:
          "Ordine registrato. Riceverai via email le istruzioni per il bonifico; spediremo alla conferma dell'accredito.",
      };
    }

    // Carta / PayPal (demo): conferma simulata, nessun addebito reale.
    return {
      provider: this.name,
      status: "paid",
      paymentId: `MAN-${req.orderId}`,
      simulated: true,
      message: "Pagamento confermato (simulato: nessun addebito reale).",
    };
  }
}
