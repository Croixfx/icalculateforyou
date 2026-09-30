import type { MultiDebtContentStrings } from "@/lib/content";

interface MultiDebtPageContentProps {
  content: MultiDebtContentStrings;
}

/**
 * Explainer content below the avalanche-vs-snowball tool. Placeholder copy
 * (both heading and body are literally prefixed "TODO" in
 * lib/content/multiDebtStrings.ts) - flagged for review rather than shipped
 * as finished, unlike the rest of the site's content.
 */
export function MultiDebtPageContent({ content }: MultiDebtPageContentProps) {
  return (
    <div className="mt-14">
      <article className="max-w-6xl">
        <section>
          <h2 className="text-xl font-semibold tracking-tight">{content.explainerHeading}</h2>
          <p className="mt-3 text-base leading-relaxed text-foreground/75 sm:text-lg">{content.explainerBody}</p>
        </section>
      </article>
    </div>
  );
}
