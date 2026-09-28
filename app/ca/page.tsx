import { DebtPayoffCalculator } from "../components/calculator/DebtPayoffCalculator";
import { HeroBanner } from "../components/HeroBanner";
import { PageContent } from "../components/PageContent";
import { StructuredData } from "../components/StructuredData";
import { getStrings, REGIONS } from "@/lib/content";

const strings = getStrings("ca");

export default function CaHome() {
  return (
    <>
      <StructuredData region={REGIONS.ca} strings={strings} />
      <HeroBanner title={strings.hero.title} subtitle={strings.hero.subtitle} />
      <div className="mt-8">
        <DebtPayoffCalculator region="ca" />
      </div>
      <PageContent region="ca" content={strings.content} />
    </>
  );
}
