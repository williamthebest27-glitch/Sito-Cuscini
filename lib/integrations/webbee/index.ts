/**
 * Adapter WebBee — STUB.
 *
 * WebBee sincronizza magazzino/ordini multicanale. Qui è predisposto come
 * `InventoryProvider`; all'occorrenza può implementare anche `FulfillmentProvider`.
 * Nessuna chiamata di rete finché non sono presenti le credenziali.
 *
 * Env var attese (esempio):
 *   WEBBEE_API_KEY, WEBBEE_ACCOUNT_ID, WEBBEE_BASE_URL
 */
import {
  IntegrationNotConfiguredError,
  type InventoryProvider,
  type OrderLine,
} from "../types";

export class WebBeeProvider implements InventoryProvider {
  readonly name = "webbee";

  isConfigured(): boolean {
    return Boolean(process.env.WEBBEE_API_KEY && process.env.WEBBEE_ACCOUNT_ID);
  }

  async getStock(_skus: string[]): Promise<Record<string, number>> {
    if (!this.isConfigured()) throw new IntegrationNotConfiguredError(this.name);
    // TODO: GET livelli di stock per SKU.
    throw new IntegrationNotConfiguredError(this.name);
  }

  async reserve(_lines: OrderLine[]): Promise<{ reserved: boolean }> {
    if (!this.isConfigured()) throw new IntegrationNotConfiguredError(this.name);
    // TODO: prenotazione stock in checkout.
    throw new IntegrationNotConfiguredError(this.name);
  }
}
