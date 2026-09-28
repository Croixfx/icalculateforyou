import type { ContentStrings, RegionKey } from "@/lib/content";
import { AdSlot } from "./AdSlot";

interface PageContentProps {
  region: RegionKey;
  content: ContentStrings;
}

/**
 * SEO/explainer content below the calculator: how interest works, how to
 * use the calculator, snowball vs. avalanche, and an FAQ. Two ad slots live
 * in here — one right below the calculator's results, one further down
 * within the article body — never above the calculator and never between
 * its inputs and results (SiteChrome owns the third, page-bottom slot).
 */
export function PageContent({ region, content }: PageContentProps) {
  return (
    <div className="mt-10">
      <AdSlot id={`ad-mid-${region}`} className="mb-10" />

      <article className="space-y-10">
        <section>
          <h2 className="text-xl font-semibold tracking-tight">{content.howInterestWorksHeading}</h2>
          <p className="mt-2 text-black/75 dark:text-white/75">{content.howInterestWorksBody}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold tracking-tight">{content.howToUseHeading}</h2>
          <p className="mt-2 text-black/75 dark:text-white/75">{content.howToUseBody}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold tracking-tight">{content.strategiesHeading}</h2>
          <p className="mt-2 text-black/75 dark:text-white/75">{content.strategiesBody}</p>
          {/* TODO: content.strategiesLinkHref points to a multi-debt comparison
              page that doesn't exist yet. Re-add this link (and drop this
              comment) once that page ships — an internal link must never 404. */}
        </section>

        <AdSlot id={`ad-content-${region}`} />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">{content.faqHeading}</h2>
          <dl className="mt-4 space-y-6">
            {content.faq.map((item) => (
              <div key={item.question}>
                <dt className="font-medium text-black/90 dark:text-white/90">{item.question}</dt>
                <dd className="mt-1 text-black/75 dark:text-white/75">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </article>
    </div>
  );
}
