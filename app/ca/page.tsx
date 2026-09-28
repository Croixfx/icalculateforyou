import { DebtPayoffCalculator } from "../components/calculator/DebtPayoffCalculator";
import { PageContent } from "../components/PageContent";
import { StructuredData } from "../components/StructuredData";
import { getStrings, REGIONS } from "@/lib/content";

const strings = getStrings("ca");

export default function CaHome() {
  return (
    <>
      <StructuredData region={REGIONS.ca} strings={strings} />
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{strings.hero.title}</h1>
      <p className="mt-3 max-w-prose text-base leading-relaxed text-foreground/65 sm:text-lg">
        {strings.hero.subtitle}
      </p>
      <div className="mt-8">
        <DebtPayoffCalculator region="ca" />
      </div>
      <PageContent region="ca" content={strings.content} />
    </>
  );
}
