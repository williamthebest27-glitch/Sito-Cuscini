import type { Metadata } from "next";
import Breadcrumbs from "@/components/shop/Breadcrumbs";
import CartPageContent from "@/components/shop/CartPageContent";

export const metadata: Metadata = {
  title: "Carrello",
  description: "Rivedi gli articoli nel carrello e procedi all'acquisto.",
  alternates: { canonical: "/carrello" },
  robots: { index: false, follow: true },
};

export default function CarrelloPage() {
  return (
    <div className="shop-container">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Carrello" }]} />
      <header className="shop-hero" style={{ paddingBottom: "0.5rem" }}>
        <h1 className="shop-hero__title" style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)" }}>
          Il tuo carrello
        </h1>
      </header>
      <section className="shop-section" style={{ paddingTop: "1rem" }}>
        <CartPageContent />
      </section>
    </div>
  );
}
