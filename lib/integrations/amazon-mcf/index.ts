/**
 * Adapter Amazon Multi-Channel Fulfillment (MCF) — STUB.
 *
 * Predisposizione: implementa `FulfillmentProvider`. Oggi non effettua chiamate:
 * `isConfigured()` è false finché non si popolano le env var qui sotto. Quando
 * arriveranno le credenziali, sostituire i corpi dei metodi con le chiamate
 * alla Selling Partner API (Fulfillment Outbound).
 *
 * Env var attese (esempio):
 *   AMAZON_MCF_CLIENT_ID, AMAZON_MCF_CLIENT_SECRET, AMAZON_MCF_REFRESH_TOKEN,
 *   AMAZON_MCF_REGION, AMAZON_MCF_MARKETPLACE_ID
 */
import {
  IntegrationNotConfiguredError,
  type FulfillmentProvider,
  type FulfillmentRequest,
  type FulfillmentResult,
} from "../types";

export class AmazonMcfProvider implements FulfillmentProvider {
  readonly name = "amazon-mcf";

  isConfigured(): boolean {
    return Boolean(
      process.env.AMAZON_MCF_CLIENT_ID &&
        process.env.AMAZON_MCF_CLIENT_SECRET &&
        process.env.AMAZON_MCF_REFRESH_TOKEN,
    );
  }

  async createFulfillment(
    _req: FulfillmentRequest,
  ): Promise<FulfillmentResult> {
    if (!this.isConfigured()) throw new IntegrationNotConfiguredError(this.name);
    // TODO: POST createFulfillmentOrder (SP-API Fulfillment Outbound).
    throw new IntegrationNotConfiguredError(this.name);
  }

  async getStatus(_providerOrderId: string): Promise<FulfillmentResult> {
    if (!this.isConfigured()) throw new IntegrationNotConfiguredError(this.name);
    // TODO: GET getFulfillmentOrder.
    throw new IntegrationNotConfiguredError(this.name);
  }

  async cancel(_providerOrderId: string): Promise<{ cancelled: boolean }> {
    if (!this.isConfigured()) throw new IntegrationNotConfiguredError(this.name);
    // TODO: PUT cancelFulfillmentOrder.
    throw new IntegrationNotConfiguredError(this.name);
  }
}
