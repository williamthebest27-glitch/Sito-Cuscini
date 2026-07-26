"use client";

/**
 * Drawer del carrello (slide-over da destra). Legge tutto dal CartContext.
 * Il blocco scroll è gestito dal provider quando `isOpen` cambia.
 */
import Link from "next/link";
import { useCart } from "@/lib/shop/cart/CartContext";
import CartLineItem from "./CartLineItem";
import CartSummary from "./CartSummary";
import FreeShippingBar from "./FreeShippingBar";
import { IconBag, IconClose } from "./icons";

export default function CartDrawer() {
  const { isOpen, closeCart, lines, totals } = useCart();
  const empty = lines.length === 0;

  return (
    <>
      <div
        className="drawer-backdrop"
        data-open={isOpen}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        className="drawer"
        data-open={isOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Carrello"
        aria-hidden={!isOpen}
      >
        <div className="drawer__head">
          <span className="drawer__title">
            Carrello{totals.itemCount > 0 ? ` · ${totals.itemCount}` : ""}
          </span>
          <button
            type="button"
            className="icon-btn"
            onClick={closeCart}
            aria-label="Chiudi carrello"
          >
            <IconClose style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {empty ? (
          <div className="drawer__body">
            <div className="cart-empty">
              <div className="cart-empty__icon" aria-hidden="true">
                <IconBag style={{ width: 40, height: 40 }} />
              </div>
              <p className="empty__title">Il carrello è vuoto</p>
              <p style={{ color: "var(--ink-soft)", marginBottom: "1.4rem" }}>
                Scopri i cuscini pensati per il tuo riposo.
              </p>
              <Link href="/negozio" className="btn btn--primary" onClick={closeCart}>
                Vai al negozio
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="drawer__body">
              <FreeShippingBar />
              {lines.map((line) => (
                <CartLineItem key={line.id} line={line} onNavigate={closeCart} />
              ))}
            </div>
            <div className="drawer__foot">
              <CartSummary
                showDiscount={false}
                cta={{ href: "/checkout", label: "Vai al checkout" }}
                onCtaClick={closeCart}
              />
              <Link
                href="/carrello"
                className="btn btn--ghost"
                onClick={closeCart}
                style={{ width: "100%", justifyContent: "center", marginTop: "0.6rem" }}
              >
                Vedi il carrello
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
