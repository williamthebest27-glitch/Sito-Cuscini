/**
 * Formattazione valuta e numeri, locale it-IT.
 * I prezzi sono in centesimi: qui è l'unico punto in cui si converte in euro.
 */

const eur = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 4990 → "49,90 €". */
export function formatPrice(cents: number): string {
  return eur.format(cents / 100);
}

/** Prezzo senza simbolo, utile in microdata (es. "49.90"). */
export function priceToDecimalString(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** 1290 → "12,90 €" ma pensata per differenze/risparmi. */
export function formatSaving(cents: number): string {
  return eur.format(cents / 100);
}

const nf = new Intl.NumberFormat("it-IT");

/** 1234 → "1.234". */
export function formatNumber(n: number): string {
  return nf.format(n);
}

/** Media recensioni con una cifra decimale, es. 4.5 → "4,5". */
export function formatRating(avg: number): string {
  return new Intl.NumberFormat("it-IT", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(avg);
}

/** ISO date → "12 marzo 2024". */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
