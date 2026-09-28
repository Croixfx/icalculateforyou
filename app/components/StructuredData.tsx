import { SITE_URL, type RegionConfig, type SiteStrings } from "@/lib/content";

interface StructuredDataProps {
  region: RegionConfig;
  strings: SiteStrings;
}

/**
 * WebApplication + FAQPage JSON-LD for the debt payoff calculator. Renders
 * the same shape for every region, differing only by URL, name, currency,
 * and FAQ content.
 */
export function StructuredData({ region, strings }: StructuredDataProps) {
  const webApplication = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: strings.header.siteName,
    url: `${SITE_URL}${region.path}`,
    description: strings.meta.description,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: region.currency,
    },
  };

  const faqPage =
    strings.content.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: strings.content.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplication) }} />
      {faqPage && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
      )}
    </>
  );
}
