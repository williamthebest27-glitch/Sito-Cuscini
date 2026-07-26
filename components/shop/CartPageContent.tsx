"use client";

/** Contenuto della pagina carrello (client): righe + riepilogo con sconto. */
import Link from "next/link";
import { useCart } from "@/lib/shop/cart/CartContext";
import CartLineItem from "./CartLineItem";
import CartSummary from "./CartSummary";
import FreeShippingBar from "./FreeShippingBar";
import { IconBag } from "./icons";

export default function CartPageContent() {
  const { lines, ready } = useCart();

  if (!ready) {
    return <div style={{ minHeight: "40vh" }} aria-hidden="true" />;
  }

  if (lines.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty__icon" aria-hidden="true">
          <IconBag style={{ width: 44, height: 44 }} />
        </div>
        <p className="empty__title">Il tuo carrello è vuoto</p>
        <p style={{ color: "var(--ink-soft)", marginBottom: "1.6rem" }}>
          Aggiungi i cuscini che ami e torna qui per completare l'ordine.
        </p>
        <Link href="/negozio" className="btn btn--primary">
          Esplora il negozio
        </Link>
      </div>
    );
  }

  return (
    <div className="cartpage">
      <div>
        <FreeShippingBar />
        {lines.map((line) => (
          <CartLineItem key={line.id} line={line} />
        ))}
      </div>

      <aside className="cartpage__aside">
        <h2 className="block__title" style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
          Riepilogo
        </h2>
        <CartSummary
          showDiscount
          cta={{ href: "/checkout", label: "Procedi al checkout" }}
        />
        <Link
          href="/negozio"
          className="btn btn--ghost"
          style={{ width: "100%", justifyContent: "center", marginTop: "0.6rem" }}
        >
          Continua lo shopping
        </Link>
      </aside>
    </div>
  );
}
