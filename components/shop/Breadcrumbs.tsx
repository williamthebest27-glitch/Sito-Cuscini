/**
 * Breadcrumb visivo + structured data BreadcrumbList (SEO).
 * Server Component: emette anche il JSON-LD.
 */
import Link from "next/link";
import { SITE_URL } from "@/lib/site";

export interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${SITE_URL}${c.href}` } : {}),
    })),
  };

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <span key={`${c.label}-${i}`} style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
              {c.href && !last ? (
                <Link href={c.href}>{c.label}</Link>
              ) : (
                <span className="crumbs__current" aria-current={last ? "page" : undefined}>
                  {c.label}
                </span>
              )}
              {!last ? <span className="crumbs__sep" aria-hidden="true">/</span> : null}
            </span>
          );
        })}
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
