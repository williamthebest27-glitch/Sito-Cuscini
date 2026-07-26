/**
 * Contratti comuni per le integrazioni esterne (fulfillment, magazzino,
 * spedizioni). Sono volutamente indipendenti dal fornitore: Amazon MCF, WebBee,
 * un ERP o un corriere implementano queste interfacce, e il resto dell'app
 * dialoga solo con esse.
 *
 * NB: qui NON c'è nessuna chiamata di rete. Gli adapter concreti (cartelle
 * `amazon-mcf/`, `webbee/`, `erp/`, `couriers/`) sono stub: in futuro basterà
 * aggiungere credenziali e implementare i metodi.
 */

/** Indirizzo postale minimo per spedizioni e fulfillment. */
export interface Address {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postalCode: string;
  /** ISO 3166-1 alpha-2, es. "IT". */
  country: string;
  phone?: string;
  email?: string;
}

/** Riga d'ordine (SKU + quantità). */
export interface OrderLine {
  sku: string;
  quantity: number;
}

/** Stato normalizzato di un ordine/fulfillment tra fornitori diversi. */
export type FulfillmentStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "error";

export interface FulfillmentRequest {
  /** Id ordine interno. */
  orderId: string;
  lines: OrderLine[];
  shippingAddress: Address;
  /** Velocità richiesta (mappata dal provider sul proprio servizio). */
  speed?: "standard" | "expedited" | "priority";
}

export interface FulfillmentResult {
  provider: string;
  providerOrderId: string;
  status: FulfillmentStatus;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}

/** Provider di evasione ordini (es. Amazon MCF). */
export interface FulfillmentProvider {
  readonly name: string;
  /** true se le credenziali sono presenti e l'adapter è operativo. */
  isConfigured(): boolean;
  createFulfillment(req: FulfillmentRequest): Promise<FulfillmentResult>;
  getStatus(providerOrderId: string): Promise<FulfillmentResult>;
  cancel(providerOrderId: string): Promise<{ cancelled: boolean }>;
}

/** Provider di disponibilità/magazzino (es. WebBee, ERP). */
export interface InventoryProvider {
  readonly name: string;
  isConfigured(): boolean;
  /** Ritorna lo stock per SKU (assente ⇒ sconosciuto). */
  getStock(skus: string[]): Promise<Record<string, number>>;
  /** Riserva stock in fase di checkout (opzionale nei sistemi che lo supportano). */
  reserve?(lines: OrderLine[]): Promise<{ reserved: boolean }>;
}

/** Tariffa di spedizione proposta da un corriere. */
export interface ShippingRate {
  carrier: string;
  service: string;
  /** Costo in centesimi di euro. */
  amount: number;
  currency: "EUR";
  estimatedDays?: number;
}

export interface ShippingRateRequest {
  destination: Address;
  lines: OrderLine[];
  /** Peso totale in grammi, se noto. */
  weightGrams?: number;
}

/** Provider di spedizione/corriere. */
export interface ShippingProvider {
  readonly name: string;
  isConfigured(): boolean;
  getRates(req: ShippingRateRequest): Promise<ShippingRate[]>;
  track(trackingNumber: string): Promise<FulfillmentResult>;
}

/** Errore sollevato dagli adapter non ancora configurati. */
export class IntegrationNotConfiguredError extends Error {
  constructor(provider: string) {
    super(
      `Integrazione "${provider}" non configurata: aggiungi le credenziali in lib/integrations.`,
    );
    this.name = "IntegrationNotConfiguredError";
  }
}
