/**
 * Modello dati dello shop — unica fonte di verità dei tipi.
 *
 * Tutti i prezzi sono in **centesimi di euro** (interi) per evitare errori di
 * arrotondamento in virgola mobile. La formattazione avviene in `format.ts`.
 *
 * Questo file non conosce React né il DOM: è puro dominio, così può essere
 * riusato tal quale da un'API, un CMS, un ERP o un job di import (WebBee/MCF).
 */

/** Assi di variante supportati da un prodotto. */
export type OptionType = "misura" | "rigidita" | "colore";

/** Un singolo valore selezionabile di un asse di variante. */
export interface ProductOptionValue {
  /** Id stabile usato negli SKU e nelle URL (es. "50x70", "medio", "sabbia"). */
  id: string;
  /** Etichetta mostrata all'utente (es. "50 × 70 cm", "Medio", "Sabbia"). */
  label: string;
  /** Solo per `colore`: hex per lo swatch e per il tono dell'immagine. */
  hex?: string;
  /** Solo per `colore`: coppia di toni per il placeholder immagine [interno, esterno]. */
  tone?: [string, string];
}

/** Definizione di un asse di variante di un prodotto. */
export interface ProductOption {
  type: OptionType;
  /** Etichetta dell'asse (es. "Misura", "Rigidità", "Colore"). */
  label: string;
  values: ProductOptionValue[];
}

/**
 * Una variante = una combinazione di valori d'opzione = **uno SKU vendibile**.
 * Prezzo, disponibilità e (opzionalmente) immagine sono per-variante.
 */
export interface Variant {
  /** Codice univoco a magazzino. Mappa 1:1 con MCF/WebBee/ERP. */
  sku: string;
  /** Valori scelti per ciascun asse, es. { misura: "50x70", rigidita: "medio" }. */
  options: Partial<Record<OptionType, string>>;
  /** Prezzo di vendita in centesimi di euro. */
  price: number;
  /** Prezzo pieno barrato in centesimi (presente ⇒ in offerta). */
  compareAtPrice?: number;
  /** Unità disponibili. 0 ⇒ esaurito. */
  stock: number;
  /** Tono immagine specifico (tipicamente ereditato dal colore). */
  tone?: [string, string];
}

/** Immagine di gallery. Con `src` usa una foto reale, altrimenti il placeholder tonale. */
export interface ProductImage {
  id: string;
  alt: string;
  /** Percorso foto reale in /public (es. "/images/products/..."). Opzionale. */
  src?: string;
  /** Placeholder brandizzato: gradiente [interno, esterno]. */
  tone?: [string, string];
}

/** Coppia etichetta/valore per la tabella specifiche tecniche. */
export interface Spec {
  label: string;
  value: string;
}

/** Recensione cliente. */
export interface Review {
  id: string;
  author: string;
  /** 1–5. */
  rating: number;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  title?: string;
  body: string;
  /** Acquisto verificato. */
  verified?: boolean;
}

/** Categoria merceologica (guida filtri e correlati). */
export interface Category {
  id: string;
  label: string;
}

/** Il prodotto completo, con le sue varianti e i contenuti di scheda. */
export interface Product {
  id: string;
  /** Slug URL-safe, univoco (usato in /prodotti/[slug]). */
  slug: string;
  name: string;
  /** Frase breve d'accompagnamento (card + scheda). */
  tagline: string;
  /** Descrizione lunga (scheda prodotto). */
  description: string;
  categoryId: string;
  /** Prodotto nuovo ⇒ badge "Novità" e boost nell'ordinamento "Novità". */
  isNew?: boolean;
  /** In evidenza ⇒ ordinamento "In evidenza". */
  featured?: boolean;
  options: ProductOption[];
  variants: Variant[];
  images: ProductImage[];
  /** Caratteristiche sintetiche (icone + testo breve). */
  features: string[];
  /** Specifiche tecniche (tabella). */
  specs: Spec[];
  /** Materiali (chip). */
  materials: string[];
  reviews: Review[];
  /** Id di prodotti correlati (se assenti si usano quelli di categoria). */
  relatedIds?: string[];
  /** ISO date di creazione — guida "Novità" e sort per data. */
  createdAt: string;
}

/* ------------------------------------------------------------------ *
 * Tipi derivati — calcolati, non memorizzati (vedi selectors.ts)
 * ------------------------------------------------------------------ */

/** Sintesi economica di un prodotto (range prezzi, offerta). */
export interface PriceSummary {
  /** Prezzo minimo tra le varianti (centesimi). */
  min: number;
  /** Prezzo massimo tra le varianti (centesimi). */
  max: number;
  /** Prezzo pieno di riferimento se in offerta (centesimi). */
  compareAt?: number;
  /** true se almeno una variante è scontata. */
  onSale: boolean;
  /** Percentuale di sconto massima (0–100), se in offerta. */
  discountPercent?: number;
}

/** Sintesi recensioni. */
export interface RatingSummary {
  /** Media 0–5 (una cifra decimale). */
  average: number;
  count: number;
}

/** Disponibilità aggregata di un prodotto. */
export type Availability = "in-stock" | "low-stock" | "out-of-stock";
