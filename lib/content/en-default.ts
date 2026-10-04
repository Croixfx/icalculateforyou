import { buildCalculatorStrings } from "./calculatorStrings";
import { buildMultiDebtStrings } from "./multiDebtStrings";
import { buildSiteContent } from "./siteContent";
import { REGIONS } from "./regions";
import type { SiteStrings } from "./types";

export const strings: SiteStrings = {
  meta: {
    title: "Debt Payoff Calculator — Any Currency, Any Country | CalculatorHub",
    description:
      "Free debt payoff calculator that works in any currency. Compare the avalanche and snowball methods and see exactly when you'll be debt-free.",
  },
  header: {
    siteName: "CalculatorHub",
    nav: [{ label: "Compare multiple debts", href: "/avalanche-vs-snowball/" }],
  },
  hero: {
    title: "Pay Off Debt Faster",
    subtitle:
      "Build a personalized payoff plan in your own currency using the avalanche or snowball method.",
  },
  calculator: buildCalculatorStrings("US"),
  content: buildSiteContent(REGIONS.default, "US"),
  multiDebt: buildMultiDebtStrings(REGIONS.default, "US"),
  footer: {
    disclaimer:
      "This calculator does not constitute financial advice.",
    copyright: "CalculatorHub. All rights reserved.",
    nav: [
      { label: "United States", href: "/us/" },
      { label: "United Kingdom", href: "/uk/" },
      { label: "Canada", href: "/ca/" },
      { label: "Australia", href: "/au/" },
    ],
  },
};
