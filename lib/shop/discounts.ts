/**
 * Codici sconto — PREDISPOSTO.
 *
 * La validazione è centralizzata e pura, così potrà essere spostata dietro una
 * Server Action / API senza cambiare la UI. Oggi valida contro una tabella
 * locale di esempio; domani basta sostituire `lookupCode` con una fetch.
 */
import type { AppliedDiscount } from "./cart/types";

interface DiscountRule {
  code: string;
  kind: "percent" | "fixed";
  /** percent: 0–100; fixed: centesimi. */
  value: number;
  label: string;
  /** Spesa minima (centesimi) per applicare il codice. */
  minSubtotal?: number;
}

/** Tabella di esempio (sostituibile con DB/API). */
const RULES: DiscountRule[] = [
  { code: "BENVENUTO10", kind: "percent", value: 10, label: "Benvenuto −10%" },
  {
    code: "COMFORT5",
    kind: "fixed",
    value: 500,
    label: "Comfort −5,00 €",
    minSubtotal: 5000,
  },
];

export interface DiscountValidation {
  ok: boolean;
  message: string;
  discount?: AppliedDiscount;
}

function lookupCode(code: string): DiscountRule | undefined {
  const norm = code.trim().toUpperCase();
  return RULES.find((r) => r.code === norm);
}

/**
 * Valida un codice rispetto al subtotale corrente (centesimi).
 * Ritorna un esito pronto da mostrare nella UI.
 */
export function validateDiscountCode(
  code: string,
  subtotal: number,
): DiscountValidation {
  if (!code.trim()) {
    return { ok: false, message: "Inserisci un codice sconto." };
  }
  const rule = lookupCode(code);
  if (!rule) {
    return { ok: false, message: "Codice non valido." };
  }
  if (rule.minSubtotal && subtotal < rule.minSubtotal) {
    return {
      ok: false,
      message: `Valido da ${(rule.minSubtotal / 100).toFixed(0)} € di spesa.`,
    };
  }
  return {
    ok: true,
    message: rule.label,
    discount: {
      code: rule.code,
      kind: rule.kind,
      value: rule.value,
      label: rule.label,
    },
  };
}
