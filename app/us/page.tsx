import { DebtPayoffCalculator } from "../components/calculator/DebtPayoffCalculator";
import { PageContent } from "../components/PageContent";
import { StructuredData } from "../components/StructuredData";
import { getStrings, REGIONS } from "@/lib/content";

const strings = getStrings("us");

export default function UsHome() {
  return (
    <>
      <StructuredData region={REGIONS.us} strings={strings} />
      <h1 className="text-3xl font-semibold tracking-tight">{strings.hero.title}</h1>
      <p className="mt-3 max-w-xl text-black/70 dark:text-white/70">{strings.hero.subtitle}</p>
      <div className="mt-8">
        <DebtPayoffCalculator region="us" />
      </div>
      <PageContent region="us" content={strings.content} />
    </>
  );
}
