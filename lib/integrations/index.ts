/**
 * Registry delle integrazioni — punto d'ingresso unico.
 *
 * L'app chiede qui i provider attivi. Oggi restituisce gli adapter stub (non
 * configurati); domani, popolate le credenziali, gli stessi metodi diventano
 * operativi senza cambiare i chiamanti.
 *
 * Esempio d'uso futuro:
 *   const fulfiller = getFulfillmentProvider();
 *   if (fulfiller?.isConfigured()) await fulfiller.createFulfillment(req);
 */
import { AmazonMcfProvider } from "./amazon-mcf";
import { CourierProvider } from "./couriers";
import { ErpProvider } from "./erp";
import { ManualPaymentProvider } from "./payment/manual";
import { StripePaymentProvider } from "./payment/stripe";
import { WebBeeProvider } from "./webbee";
import type {
  FulfillmentProvider,
  InventoryProvider,
  PaymentProvider,
  ShippingProvider,
} from "./types";

export * from "./types";

/** Fulfillment attivi, in ordine di preferenza. */
const fulfillmentProviders: FulfillmentProvider[] = [new AmazonMcfProvider()];

/** Provider di magazzino/disponibilità, in ordine di preferenza. */
const inventoryProviders: InventoryProvider[] = [
  new WebBeeProvider(),
  new ErpProvider(),
];

/** Provider di spedizione. */
const shippingProviders: ShippingProvider[] = [new CourierProvider()];

/** Gateway di pagamento reali, in ordine di preferenza. */
const paymentProviders: PaymentProvider[] = [new StripePaymentProvider()];

/** Fallback usato quando nessun gateway reale è configurato. */
const manualPayment = new ManualPaymentProvider();

/** Primo provider di fulfillment configurato (o undefined). */
export function getFulfillmentProvider(): FulfillmentProvider | undefined {
  return fulfillmentProviders.find((p) => p.isConfigured());
}

/** Primo provider di magazzino configurato (o undefined). */
export function getInventoryProvider(): InventoryProvider | undefined {
  return inventoryProviders.find((p) => p.isConfigured());
}

/** Primo provider di spedizione configurato (o undefined). */
export function getShippingProvider(): ShippingProvider | undefined {
  return shippingProviders.find((p) => p.isConfigured());
}

/**
 * Provider di pagamento attivo. Ritorna il primo gateway reale configurato,
 * altrimenti il fallback manuale (sempre presente). Non è mai undefined.
 */
export function getPaymentProvider(): PaymentProvider {
  return paymentProviders.find((p) => p.isConfigured()) ?? manualPayment;
}

/** Stato sintetico delle integrazioni (utile per una dashboard admin futura). */
export function integrationsStatus() {
  return {
    fulfillment: fulfillmentProviders.map((p) => ({
      name: p.name,
      configured: p.isConfigured(),
    })),
    inventory: inventoryProviders.map((p) => ({
      name: p.name,
      configured: p.isConfigured(),
    })),
    shipping: shippingProviders.map((p) => ({
      name: p.name,
      configured: p.isConfigured(),
    })),
    payment: {
      active: getPaymentProvider().name,
      gateways: paymentProviders.map((p) => ({
        name: p.name,
        configured: p.isConfigured(),
      })),
    },
  };
}
