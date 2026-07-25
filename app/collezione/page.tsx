import type { Metadata } from "next";
import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import CollectionShop from "@/components/CollectionShop";
import { getProducts } from "@/lib/woocommerce";

export const metadata: Metadata = {
  title: "La Collezione",
  description:
    "Il negozio The Double Twenty: cuscini ergonomici in puro lattice naturale. Scegli la forma su misura per il tuo riposo.",
  alternates: { canonical: "/collezione" },
};

// Revalidate the storefront every 5 minutes (ISR) when a store is connected.
export const revalidate = 300;

export default async function CollezionePage() {
  const { products, isDemo } = await getProducts();

  return (
    <SmoothScroll>
      <Nav revealed />
      <main>
        <CollectionShop products={products} isDemo={isDemo} />
      </main>
    </SmoothScroll>
  );
}
