import type { Metadata } from "next";
import Breadcrumbs from "@/components/shop/Breadcrumbs";
import CheckoutClient from "@/components/shop/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Completa il tuo ordine in modo semplice e sicuro.",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="shop-container">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Carrello", href: "/carrello" },
          { label: "Checkout" },
        ]}
      />
      <header className="shop-hero" style={{ paddingBottom: "0.5rem" }}>
        <h1 className="shop-hero__title" style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)" }}>
          Checkout
        </h1>
      </header>
      <CheckoutClient />
    </div>
  );
}
