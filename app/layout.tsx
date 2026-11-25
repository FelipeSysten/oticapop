import type { Metadata, Viewport } from "next";
import { Inter, Nunito } from "next/font/google";
import Consent from "@/components/client/Consent";
import { SITE_URL, site } from "@/lib/site";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], weight: ["800", "900"], variable: "--font-nunito", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const title = "Ótica Pop | Óculos e exame de vista em Itabuna-BA";
const description =
  "Óculos com estilo, preço que cabe no bolso e atendimento que te conhece pelo nome. Armações a partir de R$ 89,90, lentes de grau, óculos de sol e exame de vista no Centro de Itabuna-BA.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: site.name,
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#E8651A",
  width: "device-width",
  initialScale: 1,
};

function jsonLd() {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Optician",
    "@id": `${SITE_URL}/#otica`,
    name: site.name,
    slogan: site.slogan,
    description,
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image.png`,
    logo: `${SITE_URL}/img/logo-otica-pop.png`,
    priceRange: "R$",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      addressCountry: site.address.country,
    },
    areaServed: ["Itabuna", "Ilhéus", "Sul da Bahia"],
    sameAs: [site.instagram],
    makesOffer: {
      "@type": "Offer",
      name: "Armações de óculos",
      priceSpecification: { "@type": "PriceSpecification", minPrice: 89.9, priceCurrency: "BRL" },
    },
  };
  // Só entram no JSON-LD quando estiverem preenchidos em lib/site.ts
  if (site.phone) data.telephone = site.phone;
  if (site.openingHoursSchema) data.openingHours = site.openingHoursSchema;
  if (site.legalName) data.legalName = site.legalName;
  if (site.cnpj) data.taxID = site.cnpj;
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} ${inter.variable}`}>
      <body className="min-h-dvh bg-cream text-ink">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />
        {children}
        <Consent />
      </body>
    </html>
  );
}
