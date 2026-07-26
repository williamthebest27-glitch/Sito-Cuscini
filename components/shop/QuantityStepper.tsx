"use client";

/** Selettore quantità (−/valore/+), con clamp min/max. */
import { IconMinus, IconPlus } from "./icons";

export default function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  size = "md",
  label = "Quantità",
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  size?: "sm" | "md";
  label?: string;
}) {
  return (
    <div className={`qty${size === "sm" ? " qty--sm" : ""}`} role="group" aria-label={label}>
      <button
        type="button"
        className="qty__btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Diminuisci quantità"
      >
        <IconMinus style={{ width: 16, height: 16 }} />
      </button>
      <span className="qty__value" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="qty__btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Aumenta quantità"
      >
        <IconPlus style={{ width: 16, height: 16 }} />
      </button>
    </div>
  );
}
