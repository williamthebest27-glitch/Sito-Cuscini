import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans",
  display: "swap",
});

const SITE_URL = "https://thedoubletwenty.example";
const BRAND = "The Double Twenty";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND} — Cuscini ergonomici in puro lattice`,
    template: `%s · ${BRAND}`,
  },
  description:
    "Cuscini ergonomici in puro lattice naturale, modellati sulla curva del collo. Comfort, benessere e design per un riposo su misura.",
  keywords: [
    "cuscino ergonomico",
    "cuscino cervicale",
    "lattice naturale",
    "cuscino di design",
    "benessere del sonno",
  ],
  authors: [{ name: BRAND }],
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: SITE_URL,
    siteName: BRAND,
    title: `${BRAND} — Il comfort prende forma`,
    description:
      "Cuscini ergonomici in puro lattice naturale, modellati sulla curva del collo.",
    images: [{ url: "/images/hero-poster.jpg", width: 1112, height: 834, alt: "Cuscino ergonomico The Double Twenty" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND} — Il comfort prende forma`,
    description: "Cuscini ergonomici in puro lattice naturale.",
    images: ["/images/hero-poster.jpg"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
};

export const viewport: Viewport = {
  themeColor: "#f4f0e9",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Brand",
  name: BRAND,
  description:
    "Cuscini ergonomici in puro lattice naturale, modellati sulla curva del collo.",
  url: SITE_URL,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={`${display.variable} ${sans.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
