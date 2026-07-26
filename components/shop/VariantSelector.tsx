"use client";

/**
 * Selettore varianti: rende ogni asse d'opzione (misura/rigidità/colore).
 * Colore → swatch, altri assi → pill. Ogni valore è marcato "non disponibile"
 * se non esiste una variante in stock compatibile con la selezione corrente.
 */
import type { OptionType, Product } from "@/lib/shop/types";

type Selection = Partial<Record<OptionType, string>>;

export default function VariantSelector({
  product,
  selection,
  onSelect,
}: {
  product: Product;
  selection: Selection;
  onSelect: (axis: OptionType, valueId: string) => void;
}) {
  const isAvailable = (axis: OptionType, valueId: string): boolean =>
    product.variants.some((v) => {
      if (v.options[axis] !== valueId) return false;
      for (const opt of product.options) {
        if (opt.type === axis) continue;
        const sel = selection[opt.type];
        if (sel && v.options[opt.type] !== sel) return false;
      }
      return v.stock > 0;
    });

  return (
    <div className="pdp__options">
      {product.options.map((opt) => {
        const selectedId = selection[opt.type];
        const selectedLabel = opt.values.find((v) => v.id === selectedId)?.label;
        const isColor = opt.type === "colore";

        return (
          <div key={opt.type} className="opt">
            <div className="opt__head">
              <span className="opt__label">{opt.label}</span>
              {selectedLabel ? (
                <span className="opt__value">{selectedLabel}</span>
              ) : null}
            </div>
            <div className="opt__choices" role="group" aria-label={opt.label}>
              {opt.values.map((value) => {
                const active = value.id === selectedId;
                const available = isAvailable(opt.type, value.id);
                if (isColor) {
                  return (
                    <button
                      key={value.id}
                      type="button"
                      className="opt-swatch"
                      style={{ background: value.hex }}
                      data-active={active}
                      data-unavailable={!available}
                      onClick={() => onSelect(opt.type, value.id)}
                      aria-pressed={active}
                      aria-label={`${value.label}${available ? "" : " — non disponibile"}`}
                      title={value.label}
                    />
                  );
                }
                return (
                  <button
                    key={value.id}
                    type="button"
                    className="opt-btn"
                    data-active={active}
                    data-unavailable={!available}
                    onClick={() => onSelect(opt.type, value.id)}
                    aria-pressed={active}
                  >
                    {value.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
