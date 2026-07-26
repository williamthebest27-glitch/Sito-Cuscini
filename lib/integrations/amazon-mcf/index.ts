/**
 * Adapter Amazon Multi-Channel Fulfillment (MCF) — implementazione reale.
 *
 * Usa la SP-API Fulfillment Outbound (2020-07-01) per creare, monitorare e
 * annullare gli ordini di evasione. Si attiva quando le env var sono presenti
 * (vedi config.ts / .env.example); altrimenti `isConfigured()` è false e i
 * metodi sollevano IntegrationNotConfiguredError.
 *
 * SOLO server.
 */
import {
  IntegrationNotConfiguredError,
  type Address,
  type FulfillmentProvider,
  type FulfillmentRequest,
  type FulfillmentResult,
  type FulfillmentStatus,
} from "../types";
import { spFetch } from "./client";
import { readConfig, resolveSellerSku, type McfConfig } from "./config";

const OUTBOUND = "/fba/outbound/2020-07-01/fulfillmentOrders";

/** Mappa la velocità richiesta sulla categoria MCF. */
function shippingSpeed(
  speed?: FulfillmentRequest["speed"],
): "Standard" | "Expedited" | "Priority" {
  switch (speed) {
    case "expedited":
      return "Expedited";
    case "priority":
      return "Priority";
    default:
      return "Standard";
  }
}

/** Traduce l'indirizzo interno nel formato SP-API. */
function toDestinationAddress(a: Address) {
  return {
    name: a.fullName,
    addressLine1: a.line1,
    ...(a.line2 ? { addressLine2: a.line2 } : {}),
    city: a.city,
    stateOrProvinceCode: a.province,
    postalCode: a.postalCode,
    countryCode: a.country,
    ...(a.phone ? { phone: a.phone } : {}),
  };
}

/** Normalizza lo stato ordine MCF sul nostro FulfillmentStatus. */
function mapStatus(mcfStatus?: string): FulfillmentStatus {
  switch (mcfStatus) {
    case "Cancelled":
      return "cancelled";
    case "Invalid":
    case "Unfulfillable":
      return "error";
    case "Complete":
    case "CompletePartialled":
      return "shipped";
    case "New":
    case "Received":
      return "pending";
    case "Planning":
    case "Processing":
    default:
      return "processing";
  }
}

interface GetOrderResponse {
  payload?: {
    fulfillmentOrder?: { fulfillmentOrderStatus?: string };
    fulfillmentShipments?: Array<{
      fulfillmentShipmentPackage?: Array<{
        trackingNumber?: string;
        carrierCode?: string;
        estimatedArrivalDate?: string;
      }>;
    }>;
  };
}

/** Costruisce l'URL di tracking pubblico dal corriere, quando riconosciuto. */
function trackingUrl(carrier?: string, tracking?: string): string | undefined {
  if (!tracking) return undefined;
  const c = (carrier ?? "").toLowerCase();
  if (c.includes("ups")) return `https://www.ups.com/track?tracknum=${tracking}`;
  if (c.includes("dhl")) return `https://www.dhl.com/it-it/home/tracciabilita.html?tracking-id=${tracking}`;
  if (c.includes("gls")) return `https://gls-group.com/IT/it/servizi-online/ricerca-spedizioni?match=${tracking}`;
  if (c.includes("brt") || c.includes("bartolini"))
    return `https://vas.brt.it/vas/sped_det_show.hsm?referer=sped_numsped_par&Nspediz=${tracking}`;
  return undefined;
}

export class AmazonMcfProvider implements FulfillmentProvider {
  readonly name = "amazon-mcf";

  private config(): McfConfig {
    const cfg = readConfig();
    if (!cfg) throw new IntegrationNotConfiguredError(this.name);
    return cfg;
  }

  isConfigured(): boolean {
    return readConfig() !== null;
  }

  async createFulfillment(req: FulfillmentRequest): Promise<FulfillmentResult> {
    const cfg = this.config();

    const body = {
      marketplaceId: cfg.marketplaceId,
      sellerFulfillmentOrderId: req.orderId,
      displayableOrderId: req.orderId,
      displayableOrderDate: new Date().toISOString(),
      displayableOrderComment: "Grazie per il tuo ordine — The Double Twenty",
      shippingSpeedCategory: shippingSpeed(req.speed),
      destinationAddress: toDestinationAddress(req.shippingAddress),
      items: req.lines.map((l) => ({
        sellerSku: resolveSellerSku(cfg, l.sku),
        sellerFulfillmentOrderItemId: l.sku,
        quantity: l.quantity,
      })),
    };

    // createFulfillmentOrder risponde senza payload: l'esito è lo status HTTP.
    await spFetch(cfg, OUTBOUND, { method: "POST", body });

    return {
      provider: this.name,
      providerOrderId: req.orderId,
      status: "pending",
    };
  }

  async getStatus(providerOrderId: string): Promise<FulfillmentResult> {
    const cfg = this.config();
    const data = await spFetch<GetOrderResponse>(
      cfg,
      `${OUTBOUND}/${encodeURIComponent(providerOrderId)}`,
    );

    const order = data.payload?.fulfillmentOrder;
    const pkg = data.payload?.fulfillmentShipments?.[0]?.fulfillmentShipmentPackage?.[0];

    return {
      provider: this.name,
      providerOrderId,
      status: mapStatus(order?.fulfillmentOrderStatus),
      trackingNumber: pkg?.trackingNumber,
      trackingUrl: trackingUrl(pkg?.carrierCode, pkg?.trackingNumber),
      estimatedDelivery: pkg?.estimatedArrivalDate,
    };
  }

  async cancel(providerOrderId: string): Promise<{ cancelled: boolean }> {
    const cfg = this.config();
    await spFetch(cfg, `${OUTBOUND}/${encodeURIComponent(providerOrderId)}/cancel`, {
      method: "PUT",
    });
    return { cancelled: true };
  }
}
