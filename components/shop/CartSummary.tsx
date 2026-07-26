"use client";

/**
 * Riepilogo totali riutilizzabile (drawer + pagina carrello).
 * Mostra subtotale, sconto, risparmio, spedizione e totale; opzionalmente il
 * form sconto e una CTA verso il checkout.
 */
import Link from "next/link";
import { useCart } from "@/lib/shop/cart/CartContext";
import { formatPrice } from "@/lib/shop/format";
import DiscountForm from "./DiscountForm";
import { IconLock } from "./icons";

export default function CartSummary({
  showDiscount = true,
  cta,
  onCtaClick,
}: {
  showDiscount?: boolean;
  /** { href, label } per la CTA principale (es. checkout). */
  cta?: { href: string; label: string };
  onCtaClick?: () => void;
}) {
  const { totals } = useCart();

  return (
    <div>
      {showDiscount ? <DiscountForm /> : null}

      <div className="summary" style={{ marginTop: showDiscount ? "1.1rem" : 0 }}>
        <div className="summary__row">
          <span>Subtotale</span>
          <span>{formatPrice(totals.subtotal)}</span>
        </div>
        {totals.savings > 0 ? (
          <div className="summary__row summary__row--save">
            <span>Risparmio offerte</span>
            <span>−{formatPrice(totals.savings)}</span>
          </div>
        ) : null}
        {totals.discount > 0 ? (
          <div className="summary__row summary__row--save">
            <span>Sconto codice</span>
            <span>−{formatPrice(totals.discount)}</span>
          </div>
        ) : null}
        <div className="summary__row">
          <span>Spedizione</span>
          <span>
            {totals.shipping === 0 ? "Gratuita" : formatPrice(totals.shipping)}
          </span>
        </div>
        <div className="summary__row summary__row--total">
          <span>Totale</span>
          <span>{formatPrice(totals.total)}</span>
        </div>
      </div>

      {cta ? (
        <Link
          href={cta.href}
          className="btn btn--primary summary__cta"
          onClick={onCtaClick}
          aria-disabled={totals.itemCount === 0}
          tabIndex={totals.itemCount === 0 ? -1 : undefined}
          style={
            totals.itemCount === 0
              ? { opacity: 0.5, pointerEvents: "none" }
              : undefined
          }
        >
          {cta.label}
        </Link>
      ) : null}

      <p className="summary__note">
        <IconLock style={{ width: 12, height: 12, display: "inline", verticalAlign: "-1px" }} />{" "}
        Pagamenti sicuri · Reso gratuito entro 30 giorni
      </p>
    </div>
  );
}
