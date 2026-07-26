/**
 * Provider di pagamento Stripe — STUB (seam per il futuro).
 *
 * Si attiva quando `STRIPE_SECRET_KEY` è presente. Quando lo implementerai, crea
 * un PaymentIntent e ritorna status "paid" solo a pagamento confermato: a quel
 * punto il checkout crea automaticamente l'ordine MCF, senza altre modifiche.
 *
 * NB: non è necessario per attivare MCF — con le sole credenziali SP-API il
 * pagamento passa dal ManualPaymentProvider.
 */
import {
  IntegrationNotConfiguredError,
  type PaymentProvider,
  type PaymentRequest,
  type PaymentResult,
} from "../types";

export class StripePaymentProvider implements PaymentProvider {
  readonly name = "stripe";

  isConfigured(): boolean {
    return Boolean(process.env.STRIPE_SECRET_KEY);
  }

  async createPayment(_req: PaymentRequest): Promise<PaymentResult> {
    if (!this.isConfigured()) throw new IntegrationNotConfiguredError(this.name);
    // TODO: creare/confermare un PaymentIntent Stripe e mappare l'esito su PaymentResult.
    throw new IntegrationNotConfiguredError(this.name);
  }
}
