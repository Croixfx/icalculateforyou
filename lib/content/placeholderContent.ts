import type { ContentStrings, RegionConfig } from "./types";
import type { Spelling } from "./calculatorStrings";

/**
 * TODO: This entire module is placeholder body copy, flagged inline with
 * "TODO:" so it's obvious in the rendered page. Review and rewrite before
 * launch — it's here so the page layout, SEO structure, and FAQ schema
 * have real content to render and test against.
 */
export function buildPlaceholderContent(region: RegionConfig, spelling: Spelling): ContentStrings {
  const organize = spelling === "GB" ? "organise" : "organize";
  const currency = region.currency;

  return {
    howInterestWorksHeading: "How credit card interest works",
    howInterestWorksBody:
      "TODO: replace with reviewed copy. Credit cards and most consumer loans " +
      "charge interest on whatever balance you're still carrying at the end of " +
      `each billing cycle. The rate is usually quoted as an APR — an annual ` +
      "figure — but it's actually applied monthly, so a big chunk of every " +
      "minimum payment goes to interest before anything reduces what you " +
      "actually owe. The longer a balance sits, the more of your payment " +
      "interest eats.",
    howToUseHeading: "How to use this calculator",
    howToUseBody:
      "TODO: replace with reviewed copy. Enter your balance, interest rate, " +
      `and either a monthly payment or a target payoff date, in whatever ` +
      `currency you're budgeting in. The results update as you type — no ` +
      `need to click anything. Use the "what if" slider to see how a bit of ` +
      `extra each month changes your payoff date, then expand the ` +
      `amortization schedule if you want the full month-by-month breakdown.`,
    strategiesHeading: "Snowball vs. avalanche: which order should you pay off debts?",
    strategiesBody:
      `TODO: replace with reviewed copy. If you're trying to ${organize} ` +
      "multiple debts, not just one, two common strategies are the " +
      "avalanche method (pay off the highest interest rate first, which " +
      "minimizes total interest) and the snowball method (pay off the " +
      "smallest balance first, which builds momentum with quick wins). " +
      "We'll cover both in detail, with a calculator for multiple debts at " +
      "once, on the page below.",
    strategiesLinkLabel: "Compare snowball vs. avalanche for multiple debts",
    strategiesLinkHref: `${region.path}avalanche-vs-snowball/`,
    faqHeading: "Frequently asked questions",
    faq: [
      {
        question: "Is this calculator free to use?",
        answer: "TODO: replace with reviewed copy. Yes — this calculator is free, with no sign-up required.",
      },
      {
        question: "What's the difference between nominal and effective interest rate?",
        answer:
          "TODO: replace with reviewed copy. A nominal rate is simply divided by " +
          "12 to get a monthly rate. An effective annual rate already accounts " +
          "for monthly compounding, so converting it to a monthly rate involves " +
          "a twelfth root instead of a straight division — the two can produce " +
          "slightly different payoff timelines for the same quoted percentage.",
      },
      {
        question: `Can I use this calculator in a currency other than ${currency}?`,
        answer:
          "TODO: replace with reviewed copy. Yes — use the currency selector in " +
          "the calculator to switch to any currency; every number on the page " +
          "updates to match.",
      },
      {
        question: "Does this calculator store my financial information?",
        answer:
          "TODO: replace with reviewed copy. No — all calculations run in your " +
          "browser. Nothing you enter is sent to a server. The only thing " +
          "saved locally on your device is your preferred currency, so it's " +
          "remembered next time.",
      },
    ],
  };
}
