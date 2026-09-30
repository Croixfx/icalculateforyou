import type { Metadata } from "next";
import { SiteChrome } from "../components/SiteChrome";
import { HeroBanner } from "../components/HeroBanner";
import { MultiDebtCalculator } from "../components/calculator/MultiDebtCalculator";
import { MultiDebtPageContent } from "../components/MultiDebtPageContent";
import { MultiDebtStructuredData } from "../components/MultiDebtStructuredData";
import { alternateLanguages, getStrings, REGIONS, SITE_URL } from "@/lib/content";

const strings = getStrings("default");
const multiDebt = strings.multiDebt;

export const metadata: Metadata = {
  title: multiDebt.meta.title,
  description: multiDebt.meta.description,
  alternates: {
    canonical: `${SITE_URL}/avalanche-vs-snowball/`,
    languages: alternateLanguages("avalanche-vs-snowball/"),
  },
};

export default function AvalancheVsSnowball() {
  return (
    <SiteChrome region="default">
      <MultiDebtStructuredData region={REGIONS.default} strings={multiDebt} siteName={strings.header.siteName} />
      <HeroBanner title={multiDebt.hero.title} subtitle={multiDebt.hero.subtitle} />
      <div className="mt-8">
        <MultiDebtCalculator region="default" />
      </div>
      <MultiDebtPageContent content={multiDebt.content} />
    </SiteChrome>
  );
}
