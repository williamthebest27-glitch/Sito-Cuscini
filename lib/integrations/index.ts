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
import { WebBeeProvider } from "./webbee";
import type {
  FulfillmentProvider,
  InventoryProvider,
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
  };
}
