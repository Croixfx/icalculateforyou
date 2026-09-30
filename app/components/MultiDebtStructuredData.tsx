import { SITE_URL, type MultiDebtPageStrings, type RegionConfig } from "@/lib/content";

interface MultiDebtStructuredDataProps {
  region: RegionConfig;
  strings: MultiDebtPageStrings;
  siteName: string;
}

/** WebApplication JSON-LD for the avalanche-vs-snowball page - no FAQ section here, so no FAQPage block. */
export function MultiDebtStructuredData({ region, strings, siteName }: MultiDebtStructuredDataProps) {
  const webApplication = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${siteName} - Avalanche vs. Snowball`,
    url: `${SITE_URL}${region.path}avalanche-vs-snowball/`,
    description: strings.meta.description,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: region.currency,
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplication) }} />;
}
