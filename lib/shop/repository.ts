/**
 * REPOSITORY — la cucitura di sostituibilità.
 *
 * Tutte le pagine e i componenti leggono i prodotti SOLO attraverso questa
 * interfaccia (mai da `data.ts`). Per passare a un database, un CMS o un'API
 * (WebBee, headless commerce, ecc.) basta:
 *   1. creare una nuova classe che implementa `ProductRepository`;
 *   2. restituirla da `getRepository()`.
 * Nessuna modifica a UI, tipi o rotte.
 *
 * L'interfaccia è `async` di proposito: l'implementazione locale risolve subito,
 * ma una futura implementazione remota (fetch/DB) mantiene la stessa firma.
 */
import { CATEGORIES, PRODUCTS } from "./data";
import {
  applyQuery,
  optionValueIds,
  sortProducts,
  type SortKey,
} from "./filter";
import { getPriceSummary } from "./selectors";
import type { Category, OptionType, Product } from "./types";

export type { SortKey };

/** Query di ricerca/filtro/ordinamento sul catalogo. */
export interface ProductQuery {
  /** Testo di ricerca (nome, tagline, descrizione, categoria, materiali). */
  search?: string;
  /** Filtra per categorie (id). */
  categories?: string[];
  /** Filtra per rigidità (id valore). */
  rigidita?: string[];
  /** Filtra per colore (id valore). */
  colore?: string[];
  /** Filtra per misura (id valore). */
  misura?: string[];
  /** Solo prodotti in offerta. */
  onSale?: boolean;
  /** Solo novità. */
  isNew?: boolean;
  /** Prezzo minimo/massimo in centesimi (sul prezzo minimo di prodotto). */
  minPrice?: number;
  maxPrice?: number;
  sort?: SortKey;
  /** Paginazione (predisposta per cataloghi grandi). */
  limit?: number;
  offset?: number;
}

/** Un valore di faccetta con conteggio, per costruire i filtri della UI. */
export interface FacetValue {
  id: string;
  label: string;
  count: number;
  /** Solo per il colore. */
  hex?: string;
}

/** Faccette disponibili calcolate sull'intero catalogo. */
export interface Facets {
  categories: FacetValue[];
  rigidita: FacetValue[];
  colore: FacetValue[];
  misura: FacetValue[];
  priceRange: { min: number; max: number };
}

/** Risultato paginato di una query. */
export interface ProductPage {
  items: Product[];
  total: number;
}

/**
 * Contratto del data-access. Implementa questa interfaccia per collegare
 * qualunque sorgente dati (DB, CMS, API, WebBee) senza toccare la UI.
 */
export interface ProductRepository {
  getAll(): Promise<Product[]>;
  getBySlug(slug: string): Promise<Product | null>;
  getByIds(ids: string[]): Promise<Product[]>;
  query(q?: ProductQuery): Promise<ProductPage>;
  getCategories(): Promise<Category[]>;
  getFacets(): Promise<Facets>;
  /** Correlati: usa relatedIds del prodotto, poi ripiega sulla categoria. */
  getRelated(slug: string, limit?: number): Promise<Product[]>;
}

/* ------------------------------------------------------------------ *
 * Implementazione locale (in-memory, dal catalogo statico)
 * ------------------------------------------------------------------ */

function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

class LocalProductRepository implements ProductRepository {
  async getAll(): Promise<Product[]> {
    return PRODUCTS;
  }

  async getBySlug(slug: string): Promise<Product | null> {
    return PRODUCTS.find((p) => p.slug === slug) ?? null;
  }

  async getByIds(ids: string[]): Promise<Product[]> {
    const set = new Set(ids);
    // Mantiene l'ordine richiesto.
    return ids
      .map((id) => PRODUCTS.find((p) => p.id === id))
      .filter((p): p is Product => !!p && set.has(p.id));
  }

  async query(q: ProductQuery = {}): Promise<ProductPage> {
    const sorted = applyQuery(PRODUCTS, q, q.sort ?? "rilevanza", {
      categoryLabel,
    });
    const total = sorted.length;
    const offset = q.offset ?? 0;
    const items =
      q.limit !== undefined ? sorted.slice(offset, offset + q.limit) : sorted;
    return { items, total };
  }

  async getCategories(): Promise<Category[]> {
    return CATEGORIES;
  }

  async getFacets(): Promise<Facets> {
    const count = <T extends string>(
      pick: (p: Product) => T[],
    ): Map<T, number> => {
      const m = new Map<T, number>();
      for (const p of PRODUCTS) {
        for (const id of new Set(pick(p))) {
          m.set(id, (m.get(id) ?? 0) + 1);
        }
      }
      return m;
    };

    const catCounts = count((p) => [p.categoryId]);
    const categories: FacetValue[] = CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      count: catCounts.get(c.id) ?? 0,
    })).filter((c) => c.count > 0);

    const axisFacet = (axis: OptionType): FacetValue[] => {
      const counts = count((p) => optionValueIds(p, axis));
      // Etichetta e hex dal primo prodotto che espone quel valore.
      const meta = new Map<string, { label: string; hex?: string }>();
      for (const p of PRODUCTS) {
        const opt = p.options.find((o) => o.type === axis);
        opt?.values.forEach((v) => {
          if (!meta.has(v.id)) meta.set(v.id, { label: v.label, hex: v.hex });
        });
      }
      return [...counts.entries()].map(([id, c]) => ({
        id,
        label: meta.get(id)?.label ?? id,
        hex: meta.get(id)?.hex,
        count: c,
      }));
    };

    const prices = PRODUCTS.map((p) => getPriceSummary(p).min);

    return {
      categories,
      rigidita: axisFacet("rigidita"),
      colore: axisFacet("colore"),
      misura: axisFacet("misura"),
      priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
    };
  }

  async getRelated(slug: string, limit = 3): Promise<Product[]> {
    const product = await this.getBySlug(slug);
    if (!product) return [];

    const picked: Product[] = [];
    const seen = new Set<string>([product.id]);

    // 1) correlati espliciti
    for (const id of product.relatedIds ?? []) {
      const p = PRODUCTS.find((x) => x.id === id);
      if (p && !seen.has(p.id)) {
        picked.push(p);
        seen.add(p.id);
      }
    }
    // 2) ripiego sulla stessa categoria, per rating
    if (picked.length < limit) {
      const sameCat = sortProducts(
        PRODUCTS.filter(
          (p) => p.categoryId === product.categoryId && !seen.has(p.id),
        ),
        "recensioni",
      );
      for (const p of sameCat) {
        if (picked.length >= limit) break;
        picked.push(p);
        seen.add(p.id);
      }
    }
    return picked.slice(0, limit);
  }
}

/* ------------------------------------------------------------------ *
 * Selettore dell'implementazione — UNICO punto da cambiare
 * ------------------------------------------------------------------ */

let instance: ProductRepository | null = null;

/**
 * Ritorna il repository attivo. Per collegare un'altra sorgente dati, sostituisci
 * qui l'istanza (es. `new ApiProductRepository()`), eventualmente in base a una
 * env var. Il resto dell'app resta invariato.
 */
export function getRepository(): ProductRepository {
  if (!instance) instance = new LocalProductRepository();
  return instance;
}
