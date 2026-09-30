import Link from "next/link";
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
      <article className="max-w-6xl space-y-12">
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
          <Link
            href={content.strategiesLinkHref}
            prefetch={false}
            className="mt-3 inline-flex min-h-11 items-center text-base font-medium text-accent underline-offset-2 hover:underline sm:text-lg"
          >
            {content.strategiesLinkLabel} →
          </Link>
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
