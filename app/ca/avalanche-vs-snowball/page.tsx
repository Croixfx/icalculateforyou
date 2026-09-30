import type { Metadata } from "next";
import { HeroBanner } from "../../components/HeroBanner";
import { MultiDebtCalculator } from "../../components/calculator/MultiDebtCalculator";
import { MultiDebtPageContent } from "../../components/MultiDebtPageContent";
import { MultiDebtStructuredData } from "../../components/MultiDebtStructuredData";
import { alternateLanguages, getStrings, REGIONS, SITE_URL } from "@/lib/content";

const strings = getStrings("ca");
const multiDebt = strings.multiDebt;
const region = REGIONS.ca;

export const metadata: Metadata = {
  title: multiDebt.meta.title,
  description: multiDebt.meta.description,
  alternates: {
    canonical: `${SITE_URL}${region.path}avalanche-vs-snowball/`,
    languages: alternateLanguages("avalanche-vs-snowball/"),
  },
};

export default function CaAvalancheVsSnowball() {
  return (
    <>
      <MultiDebtStructuredData region={region} strings={multiDebt} siteName={strings.header.siteName} />
      <HeroBanner title={multiDebt.hero.title} subtitle={multiDebt.hero.subtitle} />
      <div className="mt-8">
        <MultiDebtCalculator region="ca" />
      </div>
      <MultiDebtPageContent content={multiDebt.content} />
    </>
  );
}
