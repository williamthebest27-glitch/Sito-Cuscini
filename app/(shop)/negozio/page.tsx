import type { Metadata } from "next";
import Breadcrumbs from "@/components/shop/Breadcrumbs";
import ShopBrowser from "@/components/shop/ShopBrowser";
import { getRepository } from "@/lib/shop/repository";

export const metadata: Metadata = {
  title: "Negozio — Cuscini ergonomici",
  description:
    "Scopri tutti i cuscini The Double Twenty: cervicali, classici, gravidanza e bambino. Memory foam Made in Italy, federe in bamboo, aloe vera e silver. Spedizione gratuita da 69 €.",
  alternates: { canonical: "/negozio" },
  openGraph: {
    title: "Negozio — The Double Twenty",
    description:
      "Cuscini ergonomici in puro lattice e memory foam. Ricerca e filtri per trovare il tuo comfort.",
    url: "/negozio",
    type: "website",
  },
};

export default async function NegozioPage() {
  const repo = getRepository();
  const [page, facets, categories] = await Promise.all([
    repo.query({}),
    repo.getFacets(),
    repo.getCategories(),
  ]);

  const categoryLabels: Record<string, string> = Object.fromEntries(
    categories.map((c) => [c.id, c.label]),
  );

  return (
    <div className="shop-container">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Negozio" },
        ]}
      />

      <header className="shop-hero">
        <span className="shop-hero__eyebrow">La Collezione</span>
        <h1 className="shop-hero__title">
          Il comfort, <em>in ogni forma.</em>
        </h1>
        <p className="shop-hero__note">
          Cuscini ergonomici in memory foam, Made in Italy. Cerca per nome o filtra
          per categoria e trova il tuo riposo su misura.
        </p>
      </header>

      <section className="shop-section" aria-label="Catalogo prodotti">
        <ShopBrowser
          products={page.items}
          facets={facets}
          categoryLabels={categoryLabels}
        />
      </section>
    </div>
  );
}
