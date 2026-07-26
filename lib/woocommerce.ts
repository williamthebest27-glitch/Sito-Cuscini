/**
 * WooCommerce product source.
 *
 * Reads from the public WooCommerce **Store API** (no keys required):
 *   GET {WC_STORE_URL}/wp-json/wc/store/v1/products
 * Set the env var `WC_STORE_URL` (e.g. https://shop.thedoubletwenty.com) to
 * connect a real store. Until then, curated demo products are returned so the
 * shop page is fully designed and populated.
 */

export type Product = {
  id: number | string;
  name: string;
  slug: string;
  price: string; // formatted, ready to render
  regularPrice?: string; // formatted, shown struck-through when on sale
  onSale: boolean;
  permalink: string; // where "Acquista" sends the customer
  image?: string;
  imageAlt?: string;
  shortDescription?: string; // plain text
};

type StorePrices = {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_minor_unit: number;
  currency_prefix: string;
  currency_suffix: string;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
};

type StoreProduct = {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  on_sale: boolean;
  short_description: string;
  prices: StorePrices;
  images: { src: string; alt: string }[];
};

/** Format a Store API price (integer minor units) using the store's own
 *  currency separators/affixes, so it matches the WooCommerce display. */
function formatStorePrice(p: StorePrices, amount: string): string {
  const minor = p.currency_minor_unit ?? 2;
  const value = Number(amount) / Math.pow(10, minor);
  const fixed = value.toFixed(minor);
  const [intPart, decPart] = fixed.split(".");
  const grouped = intPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    p.currency_thousand_separator || "."
  );
  const body = decPart
    ? `${grouped}${p.currency_decimal_separator || ","}${decPart}`
    : grouped;
  return `${p.currency_prefix || ""}${body}${p.currency_suffix || ""}`.trim();
}

/** Strip HTML tags from Store API short_description. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function mapStoreProduct(p: StoreProduct): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: formatStorePrice(p.prices, p.prices.price),
    regularPrice: p.on_sale
      ? formatStorePrice(p.prices, p.prices.regular_price)
      : undefined,
    onSale: p.on_sale,
    permalink: p.permalink,
    image: p.images?.[0]?.src,
    imageAlt: p.images?.[0]?.alt || p.name,
    shortDescription: p.short_description
      ? stripHtml(p.short_description)
      : undefined,
  };
}

const DEMO_PRODUCTS: Product[] = [
  {
    id: "cervicale",
    name: "Cervicale",
    slug: "cervicale",
    price: "€ 149",
    onSale: false,
    permalink: "#",
    shortDescription: "Sostegno mirato per la curva del collo.",
  },
  {
    id: "classico",
    name: "Classico",
    slug: "classico",
    price: "€ 129",
    onSale: false,
    permalink: "#",
    shortDescription: "Morbidezza avvolgente, notte dopo notte.",
  },
  {
    id: "viaggio",
    name: "Viaggio",
    slug: "viaggio",
    price: "€ 89",
    onSale: false,
    permalink: "#",
    shortDescription: "Il tuo comfort, ovunque tu vada.",
  },
  {
    id: "duo",
    name: "Set Duo",
    slug: "set-duo",
    price: "€ 239",
    regularPrice: "€ 258",
    onSale: true,
    permalink: "#",
    shortDescription: "Due cuscini Classico, un solo risveglio migliore.",
  },
  {
    id: "junior",
    name: "Junior",
    slug: "junior",
    price: "€ 79",
    onSale: false,
    permalink: "#",
    shortDescription: "Ergonomia su misura per i più piccoli.",
  },
  {
    id: "topper",
    name: "Topper Lattice",
    slug: "topper-lattice",
    price: "€ 349",
    onSale: false,
    permalink: "#",
    shortDescription: "L'accoglienza del lattice, estesa a tutto il materasso.",
  },
];

export type ProductsResult = {
  products: Product[];
  isDemo: boolean;
};

/** Fetch products for the collection page. Falls back to demo data when no
 *  store is configured or the store is unreachable — the page always renders. */
export async function getProducts(perPage = 12): Promise<ProductsResult> {
  const base = process.env.WC_STORE_URL?.replace(/\/$/, "");
  if (!base) {
    return { products: DEMO_PRODUCTS, isDemo: true };
  }

  try {
    const res = await fetch(
      `${base}/wp-json/wc/store/v1/products?per_page=${perPage}&catalog_visibility=visible`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) throw new Error(`Store API responded ${res.status}`);
    const data = (await res.json()) as StoreProduct[];
    if (!Array.isArray(data) || data.length === 0) {
      return { products: DEMO_PRODUCTS, isDemo: true };
    }
    return { products: data.map(mapStoreProduct), isDemo: false };
  } catch (err) {
    // Never break the page on a store hiccup — show the designed fallback.
    console.error("[woocommerce] product fetch failed:", err);
    return { products: DEMO_PRODUCTS, isDemo: true };
  }
}
