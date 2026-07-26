"use client";

/**
 * Header dello shop: riusa il wordmark e lo stile della nav del sito, ma è
 * sempre visibile (nessuna dipendenza dall'intro della home) e include il
 * pulsante carrello con contatore.
 */
import Link from "next/link";
import { useCart } from "@/lib/shop/cart/CartContext";
import { IconBag } from "./icons";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Negozio", href: "/negozio" },
  { label: "Carrello", href: "/carrello" },
];

export default function ShopHeader() {
  const { totals, ready, openCart } = useCart();
  const count = totals.itemCount;

  return (
    <header className="shop-header">
      <div className="shop-header__left">
        <Link href="/" className="nav__brand" aria-label="The Double Twenty — home">
          <span className="nav__brand-the">The</span>
          <span className="nav__brand-name">Double Twenty</span>
        </Link>
        <nav className="shop-header__links" aria-label="Navigazione negozio">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="nav__link">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="shop-header__right">
        <button
          type="button"
          className="cart-button"
          onClick={openCart}
          aria-label={`Apri il carrello${
            ready && count > 0 ? `, ${count} articoli` : ""
          }`}
        >
          <IconBag style={{ width: 18, height: 18 }} />
          <span>Carrello</span>
          {ready && count > 0 ? (
            <span className="cart-button__count">{count}</span>
          ) : null}
        </button>
      </div>
    </header>
  );
}
