import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/shop/Breadcrumbs";
import { IconCheck } from "@/components/shop/icons";
import ProductDetail from "@/components/shop/ProductDetail";
import ProductJsonLd from "@/components/shop/ProductJsonLd";
import RelatedProducts from "@/components/shop/RelatedProducts";
import Reviews from "@/components/shop/Reviews";
import { getPriceSummary } from "@/lib/shop/selectors";
import { formatPrice } from "@/lib/shop/format";
import { getRepository } from "@/lib/shop/repository";

/** Pre-render statico di tutte le schede (SSG) per la massima velocità. */
export async function generateStaticParams() {
  const products = await getRepository().getAll();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getRepository().getBySlug(slug);
  if (!product) return { title: "Prodotto non trovato" };

  const price = getPriceSummary(product);
  const description = `${product.tagline} Da ${formatPrice(price.min)}. ${product.materials.join(", ")}. Spedizione gratuita da 69 €.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/prodotti/${product.slug}` },
    openGraph: {
      title: `${product.name} — The Double Twenty`,
      description: product.tagline,
      url: `/prodotti/${product.slug}`,
      type: "website",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const repo = getRepository();
  const [product, categories] = await Promise.all([
    repo.getBySlug(slug),
    repo.getCategories(),
  ]);
  if (!product) notFound();

  const categoryLabel =
    categories.find((c) => c.id === product.categoryId)?.label ?? "Negozio";

  return (
    <div className="shop-container">
      <ProductJsonLd product={product} />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Negozio", href: "/negozio" },
          { label: categoryLabel, href: "/negozio" },
          { label: product.name },
        ]}
      />

      <ProductDetail product={product} />

      <div className="pdp-blocks">
        <section className={product.features.length ? "" : "pdp-blocks__wide"}>
          <h2 className="block__title">Descrizione</h2>
          <p className="prose prose--lines">{product.description}</p>
          {product.materials.length ? (
            <div className="chips" style={{ marginTop: "1.2rem" }}>
              {product.materials.map((m) => (
                <span key={m} className="material-chip">
                  {m}
                </span>
              ))}
            </div>
          ) : null}
        </section>

        {product.features.length ? (
          <section>
            <h2 className="block__title">Caratteristiche</h2>
            <ul className="feature-list">
              {product.features.map((f) => (
                <li key={f}>
                  <IconCheck /> {f}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="pdp-blocks__wide">
          <h2 className="block__title">Specifiche tecniche</h2>
          <table className="spec-table">
            <tbody>
              {product.specs.map((s) => (
                <tr key={s.label}>
                  <th scope="row">{s.label}</th>
                  <td>{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <Reviews product={product} />
      </div>

      <RelatedProducts slug={product.slug} />
    </div>
  );
}
