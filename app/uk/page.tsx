import { DebtPayoffCalculator } from "../components/calculator/DebtPayoffCalculator";
import { HeroBanner } from "../components/HeroBanner";
import { PageContent } from "../components/PageContent";
import { StructuredData } from "../components/StructuredData";
import { getStrings, REGIONS } from "@/lib/content";

const strings = getStrings("uk");

export default function UkHome() {
  return (
    <>
      <StructuredData region={REGIONS.uk} strings={strings} />
      <HeroBanner title={strings.hero.title} subtitle={strings.hero.subtitle} />
      <div className="mt-8">
        <DebtPayoffCalculator region="uk" />
      </div>
      <PageContent region="uk" content={strings.content} />
    </>
  );
}
