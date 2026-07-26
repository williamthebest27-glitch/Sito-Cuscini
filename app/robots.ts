import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Robots: indicizza tutto tranne carrello e checkout. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/carrello", "/checkout"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
