import type { Metadata } from "next";
import { SiteChrome } from "./components/SiteChrome";
import { DebtPayoffCalculator } from "./components/calculator/DebtPayoffCalculator";
import { HeroBanner } from "./components/HeroBanner";
import { PageContent } from "./components/PageContent";
import { StructuredData } from "./components/StructuredData";
import { alternateLanguages, getStrings, REGIONS, SITE_URL } from "@/lib/content";

const strings = getStrings("default");

export const metadata: Metadata = {
  title: strings.meta.title,
  description: strings.meta.description,
  alternates: {
    canonical: SITE_URL,
    languages: alternateLanguages(),
  },
};

export default function Home() {
  return (
    <SiteChrome region="default">
      <StructuredData region={REGIONS.default} strings={strings} />
      <HeroBanner title={strings.hero.title} subtitle={strings.hero.subtitle} />
      <div className="mt-8">
        <DebtPayoffCalculator region="default" />
      </div>
      <PageContent content={strings.content} />
    </SiteChrome>
  );
}
