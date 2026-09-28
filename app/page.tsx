import type { Metadata } from "next";
import { SiteChrome } from "./components/SiteChrome";
import { DebtPayoffCalculator } from "./components/calculator/DebtPayoffCalculator";
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
      <h1 className="text-3xl font-semibold tracking-tight">{strings.hero.title}</h1>
      <p className="mt-3 max-w-xl text-black/70 dark:text-white/70">{strings.hero.subtitle}</p>
      <div className="mt-8">
        <DebtPayoffCalculator region="default" />
      </div>
      <PageContent region="default" content={strings.content} />
    </SiteChrome>
  );
}
