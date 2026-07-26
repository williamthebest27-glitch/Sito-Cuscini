"use client";

/**
 * Codice sconto (predisposto). Valida contro `validateDiscountCode` (oggi
 * tabella locale, domani Server Action/API) e applica lo sconto al carrello.
 */
import { useState } from "react";
import { useCart } from "@/lib/shop/cart/CartContext";
import { validateDiscountCode } from "@/lib/shop/discounts";

export default function DiscountForm() {
  const { discount, totals, applyDiscount } = useCart();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = validateDiscountCode(code, totals.subtotal);
    setMsg({ ok: res.ok, text: res.message });
    if (res.ok && res.discount) {
      applyDiscount(res.discount);
      setCode("");
    }
  };

  if (discount) {
    return (
      <div className="discount">
        <div className="discount__applied">
          <span>
            Codice <strong>{discount.code}</strong> · {discount.label}
          </span>
          <button
            type="button"
            className="discount__remove"
            onClick={() => {
              applyDiscount(null);
              setMsg(null);
            }}
          >
            Rimuovi
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="discount" onSubmit={submit}>
      <div className="discount__row">
        <input
          className="discount__input"
          type="text"
          placeholder="Codice sconto"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-label="Codice sconto"
        />
        <button type="submit" className="discount__apply">
          Applica
        </button>
      </div>
      {msg ? (
        <p className="discount__msg" data-ok={msg.ok}>
          {msg.text}
        </p>
      ) : null}
    </form>
  );
}
