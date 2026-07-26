/**
 * Adapter Corrieri — STUB.
 *
 * Predisposizione per il calcolo tariffe e il tracking (BRT, GLS, Poste, DHL…).
 * Implementa `ShippingProvider`. Nessuna chiamata finché non ci sono credenziali.
 *
 * Env var attese (esempio):
 *   COURIER_API_KEY, COURIER_ACCOUNT, COURIER_BASE_URL
 */
import {
  IntegrationNotConfiguredError,
  type FulfillmentResult,
  type ShippingProvider,
  type ShippingRate,
  type ShippingRateRequest,
} from "../types";

export class CourierProvider implements ShippingProvider {
  readonly name = "courier";

  isConfigured(): boolean {
    return Boolean(process.env.COURIER_API_KEY && process.env.COURIER_ACCOUNT);
  }

  async getRates(_req: ShippingRateRequest): Promise<ShippingRate[]> {
    if (!this.isConfigured()) throw new IntegrationNotConfiguredError(this.name);
    // TODO: quotazione tariffe reali dal corriere.
    throw new IntegrationNotConfiguredError(this.name);
  }

  async track(_trackingNumber: string): Promise<FulfillmentResult> {
    if (!this.isConfigured()) throw new IntegrationNotConfiguredError(this.name);
    // TODO: tracking spedizione.
    throw new IntegrationNotConfiguredError(this.name);
  }
}
