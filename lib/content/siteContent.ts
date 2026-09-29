import type { ContentStrings, RegionConfig } from "./types";
import type { Spelling } from "./calculatorStrings";

export function buildSiteContent(region: RegionConfig, spelling: Spelling): ContentStrings {
  const organize = spelling === "GB" ? "organise" : "organize";
  const amortization = spelling === "GB" ? "amortisation" : "amortization";
  const currency = region.currency;

  return {
    howInterestWorksHeading: "How credit card interest works",
    howInterestWorksBody:
      "Credit cards and most consumer loans charge interest on whatever balance " +
      "you're still carrying at the end of each billing cycle. The rate is " +
      "usually quoted as an APR — an annual figure — but it's actually applied " +
      "monthly, so a chunk of every payment goes to interest before anything " +
      "reduces what you actually owe. Pay only the minimum and the balance can " +
      "barely move for months, because most of that minimum is covering interest, " +
      "not principal. The longer a balance sits, the more of your payment it eats.",
    howToUseHeading: "How to use this calculator",
    howToUseBody:
      "Enter your balance, interest rate, and monthly payment in the \"How long " +
      "will it take?\" tab to see your payoff date, or switch to \"Pay off by a " +
      "date\" and enter a target month to see the payment you'd need instead — in " +
      `whatever currency you're budgeting in. Results update as you type, no ` +
      `need to click anything. The "what if" slider shows how a bit of extra ` +
      `each month moves your payoff date and shrinks total interest, and the ` +
      `chart plots both scenarios side by side. Expand the ${amortization} ` +
      "schedule below the chart for the full month-by-month breakdown of every payment.",
    strategiesHeading: "Snowball vs. avalanche: which order should you pay off debts?",
    strategiesBody:
      `This calculator handles one debt at a time. If you're trying to ${organize} ` +
      "several debts at once, two strategies come up most often: the avalanche " +
      "method, where you put extra money toward whichever debt has the highest " +
      "interest rate first, which minimizes the total interest you'll pay overall; " +
      "and the snowball method, where you target the smallest balance first " +
      "instead, which clears individual debts faster and can be easier to stick " +
      "with. Avalanche wins on the math; snowball often wins on momentum. A " +
      "calculator for running both strategies across multiple debts at once is " +
      "planned for a future page.",
    strategiesLinkLabel: "Compare snowball vs. avalanche for multiple debts",
    strategiesLinkHref: `${region.path}avalanche-vs-snowball/`,
    faqHeading: "Frequently asked questions",
    faq: [
      {
        question: "Is this calculator free to use?",
        answer: "Yes — this calculator is free, with no sign-up required.",
      },
      {
        question: "What's the difference between nominal and effective interest rate?",
        answer:
          "A nominal rate is simply divided by 12 to get a monthly rate. An " +
          "effective annual rate already accounts for monthly compounding, so " +
          "converting it to a monthly rate involves a twelfth root instead of a " +
          "straight division. For the same quoted percentage, the effective-rate " +
          "monthly figure comes out a little lower, which means a slightly faster " +
          "payoff and less total interest than the nominal calculation gives. " +
          "Check your loan or card agreement to see which one it actually quotes — " +
          "if it doesn't say, nominal is the more common default.",
      },
      {
        question: `Can I use this calculator in a currency other than ${currency}?`,
        answer:
          "Yes — use the currency selector in the calculator to switch to any " +
          "currency; every number on the page updates to match. Your choice is " +
          "remembered for next time.",
      },
      {
        question: "Does this calculator store my financial information?",
        answer:
          "No — every calculation runs in your browser. Nothing you enter is " +
          "sent to a server. The only thing saved on your device is your " +
          "preferred currency, so it's remembered next time.",
      },
      {
        question: "Why does the amortization schedule show a smaller final payment?",
        answer:
          "Fixed monthly payments rarely divide a balance to exactly zero. Once " +
          "what's left is less than a full payment, the schedule reduces that " +
          "final payment so the balance lands on exactly zero instead of going " +
          "negative.",
      },
    ],
  };
}
