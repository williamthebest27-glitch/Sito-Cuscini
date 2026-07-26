"use client";

/**
 * Checkout (client): dati di contatto + spedizione, metodo di spedizione e
 * pagamento, riepilogo ordine. L'invio passa dalla Server Action `placeOrder`.
 *
 * NB: checkout dimostrativo — non vengono raccolti dati di carta né elaborati
 * pagamenti reali. I campi sensibili di pagamento saranno gestiti in futuro dal
 * provider di pagamento integrato.
 */
import { useState } from "react";
import Link from "next/link";
import { placeOrder, type PlaceOrderInput } from "@/app/(shop)/checkout/actions";
import { useCart } from "@/lib/shop/cart/CartContext";
import { formatPrice } from "@/lib/shop/format";
import ProductMedia from "./ProductMedia";
import { IconCheck, IconLock, IconTruck } from "./icons";

const EXPRESS_SURCHARGE = 500;

type ShippingMethod = "standard" | "express";
type PaymentMethod = "carta" | "paypal" | "bonifico";

const PAYMENTS: { id: PaymentMethod; name: string; desc: string }[] = [
  { id: "carta", name: "Carta di credito / debito", desc: "Visa, Mastercard, Amex" },
  { id: "paypal", name: "PayPal", desc: "Paga con il tuo account" },
  { id: "bonifico", name: "Bonifico bancario", desc: "Istruzioni via email" },
];

export default function CheckoutClient() {
  const { lines, totals, discount, clear, ready } = useCart();

  const [form, setForm] = useState({
    email: "",
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    province: "",
    postalCode: "",
    phone: "",
    notes: "",
  });
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("carta");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<{ orderId: string; email: string } | null>(
    null,
  );

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const shippingCost =
    shippingMethod === "express" ? EXPRESS_SURCHARGE : totals.shipping;
  const afterDiscount = totals.subtotal - totals.discount;
  const grandTotal = afterDiscount + shippingCost;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const input: PlaceOrderInput = {
      email: form.email,
      address: {
        fullName: form.fullName,
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        province: form.province,
        postalCode: form.postalCode,
        country: "IT",
        phone: form.phone || undefined,
      },
      lines: lines.map((l) => ({ sku: l.sku, quantity: l.quantity })),
      shippingMethod,
      paymentMethod,
      discountCode: discount?.code,
      notes: form.notes || undefined,
    };
    try {
      const res = await placeOrder(input);
      if (res.ok && res.orderId) {
        setPlaced({ orderId: res.orderId, email: form.email });
        clear();
      } else {
        setError(res.error ?? "Si è verificato un errore. Riprova.");
      }
    } catch {
      setError("Impossibile completare l'ordine. Riprova tra poco.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Conferma ordine ---
  if (placed) {
    return (
      <div className="confirm">
        <div className="confirm__check" aria-hidden="true">
          <IconCheck />
        </div>
        <h1 className="confirm__title">Ordine confermato</h1>
        <p className="prose" style={{ margin: "0 auto" }}>
          Grazie! Abbiamo ricevuto il tuo ordine. Una conferma è in arrivo a{" "}
          <strong>{placed.email}</strong>.
        </p>
        <div className="confirm__id">Ordine {placed.orderId}</div>
        <div>
          <Link href="/negozio" className="btn btn--primary">
            Continua lo shopping
          </Link>
        </div>
      </div>
    );
  }

  // --- Carrello vuoto ---
  if (ready && lines.length === 0) {
    return (
      <div className="cart-empty">
        <p className="empty__title">Non c'è nulla da ordinare</p>
        <p style={{ color: "var(--ink-soft)", marginBottom: "1.6rem" }}>
          Aggiungi qualche cuscino al carrello per procedere.
        </p>
        <Link href="/negozio" className="btn btn--primary">
          Vai al negozio
        </Link>
      </div>
    );
  }

  if (!ready) {
    return <div style={{ minHeight: "40vh" }} aria-hidden="true" />;
  }

  return (
    <form className="checkout" onSubmit={onSubmit}>
      <div className="co-form">
        {/* Contatto */}
        <fieldset className="co-fieldset">
          <legend className="co-legend">
            <span className="co-legend__num">1</span> Contatto
          </legend>
          <div className="co-grid">
            <div className="field field--full">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={set("email")}
                placeholder="nome@email.it"
              />
            </div>
          </div>
        </fieldset>

        {/* Spedizione */}
        <fieldset className="co-fieldset">
          <legend className="co-legend">
            <span className="co-legend__num">2</span> Indirizzo di spedizione
          </legend>
          <div className="co-grid">
            <div className="field field--full">
              <label htmlFor="fullName">Nome e cognome</label>
              <input
                id="fullName"
                autoComplete="name"
                required
                value={form.fullName}
                onChange={set("fullName")}
              />
            </div>
            <div className="field field--full">
              <label htmlFor="line1">Indirizzo</label>
              <input
                id="line1"
                autoComplete="address-line1"
                required
                value={form.line1}
                onChange={set("line1")}
                placeholder="Via e numero civico"
              />
            </div>
            <div className="field field--full">
              <label htmlFor="line2">Interno / scala (facoltativo)</label>
              <input
                id="line2"
                autoComplete="address-line2"
                value={form.line2}
                onChange={set("line2")}
              />
            </div>
            <div className="field">
              <label htmlFor="postalCode">CAP</label>
              <input
                id="postalCode"
                autoComplete="postal-code"
                inputMode="numeric"
                required
                value={form.postalCode}
                onChange={set("postalCode")}
              />
            </div>
            <div className="field">
              <label htmlFor="city">Città</label>
              <input
                id="city"
                autoComplete="address-level2"
                required
                value={form.city}
                onChange={set("city")}
              />
            </div>
            <div className="field">
              <label htmlFor="province">Provincia</label>
              <input
                id="province"
                autoComplete="address-level1"
                required
                maxLength={2}
                value={form.province}
                onChange={set("province")}
                placeholder="es. MI"
                style={{ textTransform: "uppercase" }}
              />
            </div>
            <div className="field">
              <label htmlFor="phone">Telefono (facoltativo)</label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={set("phone")}
              />
            </div>
          </div>
        </fieldset>

        {/* Metodo di spedizione */}
        <fieldset className="co-fieldset">
          <legend className="co-legend">
            <span className="co-legend__num">3</span> Spedizione
          </legend>
          <label className="method" data-active={shippingMethod === "standard"}>
            <input
              type="radio"
              name="shipping"
              checked={shippingMethod === "standard"}
              onChange={() => setShippingMethod("standard")}
            />
            <span className="method__main">
              <span className="method__name">Standard · 2–4 giorni</span>
              <span className="method__desc">Corriere espresso tracciato</span>
            </span>
            <span className="method__price">
              {totals.shipping === 0 ? "Gratuita" : formatPrice(totals.shipping)}
            </span>
          </label>
          <label className="method" data-active={shippingMethod === "express"}>
            <input
              type="radio"
              name="shipping"
              checked={shippingMethod === "express"}
              onChange={() => setShippingMethod("express")}
            />
            <span className="method__main">
              <span className="method__name">Express · 24–48 ore</span>
              <span className="method__desc">Consegna prioritaria</span>
            </span>
            <span className="method__price">{formatPrice(EXPRESS_SURCHARGE)}</span>
          </label>
        </fieldset>

        {/* Pagamento */}
        <fieldset className="co-fieldset">
          <legend className="co-legend">
            <span className="co-legend__num">4</span> Pagamento
          </legend>
          {PAYMENTS.map((p) => (
            <label key={p.id} className="method" data-active={paymentMethod === p.id}>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === p.id}
                onChange={() => setPaymentMethod(p.id)}
              />
              <span className="method__main">
                <span className="method__name">{p.name}</span>
                <span className="method__desc">{p.desc}</span>
              </span>
            </label>
          ))}
          <p className="co-trust" style={{ justifyContent: "flex-start", marginTop: "0.8rem" }}>
            <IconLock style={{ width: 14, height: 14 }} />
            Checkout dimostrativo: nessun dato di pagamento viene raccolto o addebitato.
          </p>
        </fieldset>
      </div>

      {/* Riepilogo ordine */}
      <aside className="co-summary">
        <h2 className="block__title" style={{ fontSize: "1.3rem" }}>
          Il tuo ordine
        </h2>
        <div className="co-summary__lines">
          {lines.map((l) => (
            <div key={l.id} className="co-line">
              <div className="co-line__media">
                <span className="co-line__qty">{l.quantity}</span>
                <ProductMedia image={l.image} glyph={l.name.charAt(0)} sizes="52px" />
              </div>
              <div>
                <div className="co-line__name">{l.name}</div>
                {l.optionsLabel ? (
                  <div className="co-line__opts">{l.optionsLabel}</div>
                ) : null}
              </div>
              <div className="price__amount" style={{ fontSize: "0.9rem" }}>
                {formatPrice(l.unitPrice * l.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="summary">
          <div className="summary__row">
            <span>Subtotale</span>
            <span>{formatPrice(totals.subtotal)}</span>
          </div>
          {totals.discount > 0 ? (
            <div className="summary__row summary__row--save">
              <span>Sconto {discount?.code}</span>
              <span>−{formatPrice(totals.discount)}</span>
            </div>
          ) : null}
          <div className="summary__row">
            <span>Spedizione</span>
            <span>{shippingCost === 0 ? "Gratuita" : formatPrice(shippingCost)}</span>
          </div>
          <div className="summary__row summary__row--total">
            <span>Totale</span>
            <span>{formatPrice(grandTotal)}</span>
          </div>
        </div>

        {error ? (
          <p className="field__error" role="alert" style={{ marginTop: "0.9rem" }}>
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="btn btn--primary co-place"
          disabled={submitting || lines.length === 0}
        >
          {submitting ? "Elaborazione…" : `Paga ${formatPrice(grandTotal)}`}
        </button>

        <p className="co-trust">
          <IconTruck style={{ width: 14, height: 14 }} />
          Spedizione gratuita da 69 € · Reso entro 30 giorni
        </p>
      </aside>
    </form>
  );
}
