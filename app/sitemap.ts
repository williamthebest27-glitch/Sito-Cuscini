import type { MetadataRoute } from "next";
import { getRepository } from "@/lib/shop/repository";
import { SITE_URL } from "@/lib/site";

/**
 * Sitemap dinamica: home, negozio e tutte le schede prodotto.
 * Aggiungendo prodotti al catalogo (o collegando un CMS/DB) la sitemap si
 * aggiorna da sola tramite il repository.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getRepository().getAll();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    {
      url: `${SITE_URL}/negozio`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/prodotti/${p.slug}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
