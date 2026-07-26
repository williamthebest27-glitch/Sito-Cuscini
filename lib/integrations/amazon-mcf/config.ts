/**
 * Configurazione Amazon MCF (SP-API) letta dalle variabili d'ambiente.
 *
 * SOLO server: contiene segreti. `readConfig()` ritorna null se le credenziali
 * non sono presenti, così l'adapter resta inattivo finché non le imposti.
 */

export type SpRegion = "na" | "eu" | "fe";

/** Host SP-API per regione. */
const ENDPOINTS: Record<SpRegion, string> = {
  na: "https://sellingpartnerapi-na.amazon.com",
  eu: "https://sellingpartnerapi-eu.amazon.com",
  fe: "https://sellingpartnerapi-fe.amazon.com",
};

/** Marketplace ID più comuni (default: Italia). Vedi docs Amazon per gli altri. */
const DEFAULT_MARKETPLACE = "APJ6JRA9NG5V4"; // Amazon.it (Italia)

export interface McfConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  region: SpRegion;
  /** Host SP-API risolto dalla regione. */
  endpoint: string;
  marketplaceId: string;
  /**
   * Mappa opzionale SKU-catalogo → seller-SKU Amazon, come JSON in
   * AMAZON_MCF_SKU_MAP. Se assente, si assume che gli SKU coincidano.
   */
  skuMap: Record<string, string>;
}

function parseSkuMap(raw?: string): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

/** Legge la config dalle env. Ritorna null se mancano le credenziali obbligatorie. */
export function readConfig(): McfConfig | null {
  const clientId = process.env.AMAZON_MCF_CLIENT_ID;
  const clientSecret = process.env.AMAZON_MCF_CLIENT_SECRET;
  const refreshToken = process.env.AMAZON_MCF_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  const region = (process.env.AMAZON_MCF_REGION as SpRegion) || "eu";
  return {
    clientId,
    clientSecret,
    refreshToken,
    region: ENDPOINTS[region] ? region : "eu",
    endpoint: ENDPOINTS[region] ?? ENDPOINTS.eu,
    marketplaceId: process.env.AMAZON_MCF_MARKETPLACE_ID || DEFAULT_MARKETPLACE,
    skuMap: parseSkuMap(process.env.AMAZON_MCF_SKU_MAP),
  };
}

/** Traduce uno SKU del catalogo nel seller-SKU Amazon (identità se non mappato). */
export function resolveSellerSku(config: McfConfig, sku: string): string {
  return config.skuMap[sku] ?? sku;
}
