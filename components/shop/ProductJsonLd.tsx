/**
 * Structured Data schema.org/Product (offers + aggregateRating) per la SEO.
 */
import { priceToDecimalString } from "@/lib/shop/format";
import { getAvailability, getPriceSummary, getRatingSummary } from "@/lib/shop/selectors";
import { BRAND, SITE_URL } from "@/lib/site";
import type { Product } from "@/lib/shop/types";

export default function ProductJsonLd({ product }: { product: Product }) {
  const price = getPriceSummary(product);
  const rating = getRatingSummary(product);
  const availability = getAvailability(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.tagline,
    brand: { "@type": "Brand", name: BRAND },
    category: product.categoryId,
    sku: product.variants[0]?.sku,
    material: product.materials.join(", "),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: priceToDecimalString(price.min),
      highPrice: priceToDecimalString(price.max),
      offerCount: product.variants.length,
      availability:
        availability === "out-of-stock"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      url: `${SITE_URL}/prodotti/${product.slug}`,
    },
    ...(rating.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.average,
            reviewCount: rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
