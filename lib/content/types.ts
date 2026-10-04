export type RegionKey = "default" | "us" | "uk" | "ca" | "au";

export interface RegionConfig {
  key: RegionKey;
  path: string;
  hreflang: string;
  locale: string;
  currency: string;
  countryName: string;
}

export interface CalculatorStrings {
  modeDuration: string;
  modeTarget: string;
  balanceLabel: string;
  ratePercentLabel: string;
  paymentLabel: string;
  targetDateLabel: string;
  currencyLabel: string;
  advancedToggle: string;
  rateTypeLabel: string;
  rateTypeNominal: string;
  rateTypeEffective: string;
  resultsHeading: string;
  debtFreeDateLabel: string;
  monthsLabel: string;
  totalInterestLabel: string;
  totalPaidLabel: string;
  requiredPaymentLabel: string;
  /** {min} is replaced with the formatted minimum payment. */
  paymentTooLowMessage: string;
  errorRequired: string;
  errorNotANumber: string;
  errorMustBePositive: string;
  /** {max} is replaced with the formatted maximum. */
  errorTooLarge: string;
  errorDateNotInFuture: string;
  /** {years} is replaced with the maximum horizon in years. */
  errorDateTooFar: string;
  errorTooSlow: string;
  whatIfHeading: string;
  whatIfLabel: string;
  whatIfMonthsSaved: string;
  whatIfInterestSaved: string;
  chartTitle: string;
  chartBaselineLabel: string;
  chartWhatIfLabel: string;
  chartYAxisLabel: string;
  chartXAxisLabel: string;
  scheduleToggleShow: string;
  scheduleToggleHide: string;
  scheduleMonthHeader: string;
  schedulePaymentHeader: string;
  scheduleInterestHeader: string;
  schedulePrincipalHeader: string;
  scheduleBalanceHeader: string;
  copyLinkButton: string;
  copyLinkCopied: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ContentStrings {
  howInterestWorksHeading: string;
  howInterestWorksBody: string;
  howToUseHeading: string;
  howToUseBody: string;
  strategiesHeading: string;
  strategiesBody: string;
  strategiesLinkLabel: string;
  strategiesLinkHref: string;
  faqHeading: string;
  faq: FaqItem[];
}

export interface SiteStrings {
  meta: {
    title: string;
    description: string;
  };
  header: {
    siteName: string;
    nav: { label: string; href: string }[];
  };
  hero: {
    title: string;
    subtitle: string;
  };
  calculator: CalculatorStrings;
  content: ContentStrings;
  footer: {
    disclaimer: string;
    copyright: string;
    /** Region-switcher links, e.g. the country list - secondary to the
     *  header nav so they stay reachable (and crawlable) without cluttering
     *  the primary nav. Empty unless a region actually has siblings to link. */
    nav: { label: string; href: string }[];
  };
  multiDebt: MultiDebtPageStrings;
}

export interface MultiDebtCalculatorStrings {
  debtsHeading: string;
  debtNameLabel: string;
  /** {n} is replaced with the debt's 1-based position, e.g. "Debt 1". */
  debtNamePlaceholder: string;
  debtBalanceLabel: string;
  debtRateLabel: string;
  debtMinPaymentLabel: string;
  addDebtButton: string;
  /** {name} is replaced with the debt's own name. */
  removeDebtButton: string;
  currencyLabel: string;

  budgetHeading: string;
  budgetLabel: string;
  /** {min} is replaced with the formatted minimum budget needed. */
  budgetTooLowMessage: string;

  comparisonHeading: string;
  avalancheHeading: string;
  avalancheDescription: string;
  snowballHeading: string;
  snowballDescription: string;
  debtFreeDateLabel: string;
  totalInterestLabel: string;
  payoffOrderLabel: string;
  /** {month} is replaced with the 1-based month number a debt is cleared in. */
  clearedInMonthLabel: string;
  /** {method}, {amount}, and {percent} describe how much the cheaper method saves. */
  winnerMessage: string;
  tieMessage: string;
  motivationNote: string;

  chartTitle: string;
  chartXAxisLabel: string;
  chartAvalancheLabel: string;
  chartSnowballLabel: string;

  errorRequired: string;
  errorNotANumber: string;
  errorMustBePositive: string;
  /** {max} is replaced with the formatted maximum. */
  errorTooLarge: string;

  copyLinkButton: string;
  copyLinkCopied: string;
}

export interface MultiDebtContentStrings {
  explainerHeading: string;
  explainerBody: string;
}

export interface MultiDebtPageStrings {
  meta: {
    title: string;
    description: string;
  };
  hero: {
    title: string;
    subtitle: string;
  };
  calculator: MultiDebtCalculatorStrings;
  content: MultiDebtContentStrings;
}
