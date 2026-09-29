import type { ContentStrings } from "@/lib/content";

interface PageContentProps {
  content: ContentStrings;
}

/**
 * SEO/explainer content below the calculator: how interest works, how to
 * use the calculator, snowball vs. avalanche, and an FAQ.
 */
export function PageContent({ content }: PageContentProps) {
  return (
    <div className="mt-14">
      <article className="max-w-prose space-y-12">
        <section>
          <h2 className="text-xl font-semibold tracking-tight">{content.howInterestWorksHeading}</h2>
          <p className="mt-3 text-base leading-relaxed text-foreground/75 sm:text-lg">
            {content.howInterestWorksBody}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold tracking-tight">{content.howToUseHeading}</h2>
          <p className="mt-3 text-base leading-relaxed text-foreground/75 sm:text-lg">{content.howToUseBody}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold tracking-tight">{content.strategiesHeading}</h2>
          <p className="mt-3 text-base leading-relaxed text-foreground/75 sm:text-lg">{content.strategiesBody}</p>
          {/* TODO: content.strategiesLinkHref points to a multi-debt comparison
              page that doesn't exist yet. Re-add this link (and drop this
              comment) once that page ships — an internal link must never 404. */}
        </section>

        <section>
          <h2 className="text-xl font-semibold tracking-tight">{content.faqHeading}</h2>
          <dl className="mt-5 space-y-7">
            {content.faq.map((item) => (
              <div key={item.question}>
                <dt className="font-medium text-foreground">{item.question}</dt>
                <dd className="mt-1.5 text-base leading-relaxed text-foreground/75 sm:text-lg">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </article>
    </div>
  );
}
