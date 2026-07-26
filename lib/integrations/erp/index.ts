/**
 * Adapter ERP generico — STUB.
 *
 * Punto d'aggancio per un gestionale (SAP, Odoo, Danea, ecc.) come sorgente di
 * verità di stock e anagrafiche. Predisposto come `InventoryProvider`.
 *
 * Env var attese (esempio):
 *   ERP_BASE_URL, ERP_API_KEY
 */
import {
  IntegrationNotConfiguredError,
  type InventoryProvider,
} from "../types";

export class ErpProvider implements InventoryProvider {
  readonly name = "erp";

  isConfigured(): boolean {
    return Boolean(process.env.ERP_BASE_URL && process.env.ERP_API_KEY);
  }

  async getStock(_skus: string[]): Promise<Record<string, number>> {
    if (!this.isConfigured()) throw new IntegrationNotConfiguredError(this.name);
    // TODO: interrogazione stock dal gestionale.
    throw new IntegrationNotConfiguredError(this.name);
  }
}
