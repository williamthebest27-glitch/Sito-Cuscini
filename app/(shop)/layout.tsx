import type { ReactNode } from "react";
import ShopChrome from "@/components/shop/ShopChrome";
import "./shop.css";

/**
 * Layout del route group (shop). Importa gli stili dello shop (globali ma
 * namespaced) e avvolge le pagine nella chrome (header + carrello + footer).
 * Le pagine figlie restano Server Components.
 */
export default function ShopLayout({ children }: { children: ReactNode }) {
  return <ShopChrome>{children}</ShopChrome>;
}
