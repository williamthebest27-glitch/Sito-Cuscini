"use client";

/**
 * Guscio client delle pagine shop: monta il provider carrello e lo smooth
 * scroll (lo stesso Lenis del sito), l'header, il drawer e il footer. Le pagine
 * restano Server Components: entrano come `children`.
 */
import SmoothScroll from "@/components/SmoothScroll";
import { CartProvider } from "@/lib/shop/cart/CartContext";
import CartDrawer from "./CartDrawer";
import ShopFooter from "./ShopFooter";
import ShopHeader from "./ShopHeader";

export default function ShopChrome({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SmoothScroll>
        <ShopHeader />
        <main className="shop-main">{children}</main>
        <ShopFooter />
        <CartDrawer />
      </SmoothScroll>
    </CartProvider>
  );
}
