/**
 * Logica pura di ricerca / filtro / ordinamento, condivisa tra il repository
 * (server) e la griglia interattiva (client). Nessun import di dati: le
 * etichette di categoria arrivano via `opts.categoryLabel`, così il client non
 * deve importare l'intero catalogo.
 */
import { getPriceSummary, getRatingSummary } from "./selectors";
import type { OptionType, Product } from "./types";

export type SortKey =
  | "rilevanza"
  | "novita"
  | "prezzo-asc"
  | "prezzo-desc"
  | "recensioni";

export interface FilterQuery {
  search?: string;
  categories?: string[];
  rigidita?: string[];
  colore?: string[];
  misura?: string[];
  onSale?: boolean;
  isNew?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface FilterOptions {
  categoryLabel?: (id: string) => string;
}

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function optionValueIds(product: Product, axis: OptionType): string[] {
  const opt = product.options.find((o) => o.type === axis);
  return opt ? opt.values.map((v) => v.id) : [];
}

export function productMatches(
  product: Product,
  q: FilterQuery,
  opts: FilterOptions = {},
): boolean {
  if (q.categories?.length && !q.categories.includes(product.categoryId)) {
    return false;
  }
  if (q.isNew && !product.isNew) return false;

  const price = getPriceSummary(product);
  if (q.onSale && !price.onSale) return false;
  if (q.minPrice !== undefined && price.min < q.minPrice) return false;
  if (q.maxPrice !== undefined && price.min > q.maxPrice) return false;

  const axisMatch = (axis: OptionType, wanted?: string[]) => {
    if (!wanted?.length) return true;
    const ids = optionValueIds(product, axis);
    return wanted.some((w) => ids.includes(w));
  };
  if (!axisMatch("rigidita", q.rigidita)) return false;
  if (!axisMatch("colore", q.colore)) return false;
  if (!axisMatch("misura", q.misura)) return false;

  if (q.search?.trim()) {
    const needle = normalize(q.search);
    const haystack = normalize(
      [
        product.name,
        product.tagline,
        product.description,
        opts.categoryLabel?.(product.categoryId) ?? "",
        product.materials.join(" "),
        product.features.join(" "),
      ].join(" "),
    );
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

export function sortProducts(
  items: Product[],
  sort: SortKey = "rilevanza",
): Product[] {
  const out = [...items];
  switch (sort) {
    case "prezzo-asc":
      return out.sort((a, b) => getPriceSummary(a).min - getPriceSummary(b).min);
    case "prezzo-desc":
      return out.sort((a, b) => getPriceSummary(b).min - getPriceSummary(a).min);
    case "novita":
      return out.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    case "recensioni":
      return out.sort(
        (a, b) => getRatingSummary(b).average - getRatingSummary(a).average,
      );
    case "rilevanza":
    default:
      return out.sort((a, b) => {
        const fa = a.featured ? 1 : 0;
        const fb = b.featured ? 1 : 0;
        if (fa !== fb) return fb - fa;
        const na = a.isNew ? 1 : 0;
        const nb = b.isNew ? 1 : 0;
        if (na !== nb) return nb - na;
        return getRatingSummary(b).average - getRatingSummary(a).average;
      });
  }
}

/** Filtra e ordina in un colpo solo. */
export function applyQuery(
  products: Product[],
  q: FilterQuery,
  sort: SortKey = "rilevanza",
  opts: FilterOptions = {},
): Product[] {
  return sortProducts(
    products.filter((p) => productMatches(p, q, opts)),
    sort,
  );
}
