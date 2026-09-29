import { DebtPayoffCalculator } from "../components/calculator/DebtPayoffCalculator";
import { HeroBanner } from "../components/HeroBanner";
import { PageContent } from "../components/PageContent";
import { StructuredData } from "../components/StructuredData";
import { getStrings, REGIONS } from "@/lib/content";

const strings = getStrings("us");

export default function UsHome() {
  return (
    <>
      <StructuredData region={REGIONS.us} strings={strings} />
      <HeroBanner title={strings.hero.title} subtitle={strings.hero.subtitle} />
      <div className="mt-8">
        <DebtPayoffCalculator region="us" />
      </div>
      <PageContent content={strings.content} />
    </>
  );
}
