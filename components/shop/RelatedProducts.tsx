/**
 * Prodotti correlati. Server Component: risolve i correlati dal repository e
 * riusa la ProductCard della griglia.
 */
import { getRepository } from "@/lib/shop/repository";
import ProductCard from "./ProductCard";

export default async function RelatedProducts({ slug }: { slug: string }) {
  const repo = getRepository();
  const [related, categories] = await Promise.all([
    repo.getRelated(slug, 3),
    repo.getCategories(),
  ]);
  if (related.length === 0) return null;

  const labels: Record<string, string> = Object.fromEntries(
    categories.map((c) => [c.id, c.label]),
  );

  return (
    <section className="related" aria-label="Prodotti correlati">
      <h2 className="block__title">Ti potrebbe piacere anche</h2>
      <div className="related__grid">
        {related.map((p) => (
          <ProductCard key={p.id} product={p} categoryLabel={labels[p.categoryId]} />
        ))}
      </div>
    </section>
  );
}
