import { DebtPayoffCalculator } from "../components/calculator/DebtPayoffCalculator";
import { HeroBanner } from "../components/HeroBanner";
import { PageContent } from "../components/PageContent";
import { StructuredData } from "../components/StructuredData";
import { getStrings, REGIONS } from "@/lib/content";

const strings = getStrings("au");

export default function AuHome() {
  return (
    <>
      <StructuredData region={REGIONS.au} strings={strings} />
      <HeroBanner title={strings.hero.title} subtitle={strings.hero.subtitle} />
      <div className="mt-8">
        <DebtPayoffCalculator region="au" />
      </div>
      <PageContent content={strings.content} />
    </>
  );
}
