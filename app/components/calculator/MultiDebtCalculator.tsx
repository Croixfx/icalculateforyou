"use client";

import { useEffect, useState } from "react";
import { multiDebtPlan, type Debt, type MultiDebtPlan } from "@/lib/engine";
import { formatCurrency, getCurrencyOptions, getPreferredCurrency, detectLocale, setPreferredCurrency } from "@/lib/locale";
import { addMonths, formatMonthYear, interpolate, type FieldResult, type ValidationError } from "@/lib/calculator";
import {
  buildMultiDebtShareUrl,
  decodeMultiDebtState,
  encodeMultiDebtState,
  resolveDebtName,
  sumOfMinPayments,
  validateBudget,
  validateDebtBalance,
  validateDebtMinPayment,
  validateDebtRate,
  type BudgetValidationError,
  type DebtFormRow,
  type MultiDebtFormState,
} from "@/lib/multiDebtCalculator";
import { getStrings, REGIONS, type MultiDebtCalculatorStrings, type RegionKey } from "@/lib/content";
import { Field, inputClass } from "./FormField";
import { PayoffChart } from "./PayoffChart";

interface MultiDebtCalculatorProps {
  region: RegionKey;
}

// Three illustrative example debts (not blank) so a comparison is visible
// immediately, the same reasoning as the single-debt calculator's pre-fill:
// no scrolling or typing required before there's something to look at.
function defaultState(region: RegionKey): MultiDebtFormState {
  return {
    debts: [
      { id: "debt-1", name: "Credit card A", balance: "6000", ratePercent: "24.99", minPayment: "150" },
      { id: "debt-2", name: "Credit card B", balance: "3000", ratePercent: "19.99", minPayment: "90" },
      { id: "debt-3", name: "Car loan", balance: "12000", ratePercent: "6.5", minPayment: "300" },
    ],
    budget: "700",
    currency: REGIONS[region].currency,
  };
}

function describeError(error: ValidationError, strings: MultiDebtCalculatorStrings, format: (n: number) => string): string {
  switch (error.code) {
    case "required":
      return strings.errorRequired;
    case "notANumber":
      return strings.errorNotANumber;
    case "mustBePositive":
      return strings.errorMustBePositive;
    case "tooLarge":
      return interpolate(strings.errorTooLarge, { max: format(error.max) });
    default:
      return strings.errorNotANumber;
  }
}

function describeBudgetError(error: BudgetValidationError, strings: MultiDebtCalculatorStrings, format: (n: number) => string): string {
  if (error.code === "belowMinimum") {
    return interpolate(strings.budgetTooLowMessage, { min: format(error.min) });
  }
  return describeError(error, strings, format);
}

/** A blank field just means "nothing entered yet" - only show an error once there's content to react to. */
function fieldError(result: FieldResult): ValidationError | undefined {
  if (result.ok || result.error.code === "required") return undefined;
  return result.error;
}

/** Only ever called after confirming every field in the set is ok. */
function fieldValue(result: FieldResult): number {
  return result.ok ? result.value : 0;
}

type Computation =
  | { kind: "incomplete" }
  | { kind: "belowMinimum"; minRequired: number }
  | { kind: "error" }
  | { kind: "ok"; avalanche: MultiDebtPlan; snowball: MultiDebtPlan; startingTotal: number };

function newDebtRow(): DebtFormRow {
  return {
    // Only ever called from a click handler (never during SSR/first render),
    // so crypto is always available here.
    id: crypto.randomUUID(),
    name: "",
    balance: "",
    ratePercent: "",
    minPayment: "",
  };
}

export function MultiDebtCalculator({ region }: MultiDebtCalculatorProps) {
  const content = getStrings(region);
  const strings = content.multiDebt.calculator;
  const config = REGIONS[region];

  const [state, setState] = useState<MultiDebtFormState>(() => defaultState(region));
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [hydrated, setHydrated] = useState(false);

  // Same reasoning as the single-debt calculator: render the region default
  // first (matches the server), then layer in a shared link and the saved/
  // detected currency after mount, to avoid a hydration mismatch.
  useEffect(() => {
    const fromUrl = decodeMultiDebtState(window.location.search);
    const fallbackCurrency = region === "default" ? detectLocale().currency : config.currency;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((prev) => ({
      ...prev,
      ...fromUrl,
      currency: fromUrl.currency ?? getPreferredCurrency() ?? fallbackCurrency,
    }));
    setHydrated(true);
  }, [region, config.currency]);

  useEffect(() => {
    if (!hydrated) return;
    const query = encodeMultiDebtState(state).toString();
    const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [state, hydrated]);

  function updateDebt(id: string, patch: Partial<DebtFormRow>) {
    setState((prev) => ({
      ...prev,
      debts: prev.debts.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    }));
  }

  function addDebt() {
    setState((prev) => ({ ...prev, debts: [...prev.debts, newDebtRow()] }));
  }

  function removeDebt(id: string) {
    setState((prev) => (prev.debts.length <= 1 ? prev : { ...prev, debts: prev.debts.filter((d) => d.id !== id) }));
  }

  function handleCurrencyChange(currency: string) {
    setState((prev) => ({ ...prev, currency }));
    setPreferredCurrency(currency);
  }

  const money = (n: number) => formatCurrency(n, state.currency, config.locale);

  const debtResults = state.debts.map((d) => ({
    id: d.id,
    balance: validateDebtBalance(d.balance),
    rate: validateDebtRate(d.ratePercent),
    minPayment: validateDebtMinPayment(d.minPayment),
  }));
  const allDebtsValid = debtResults.every((r) => r.balance.ok && r.rate.ok && r.minPayment.ok);
  const minRequiredBudget = sumOfMinPayments(state.debts);
  const budgetResult = allDebtsValid ? validateBudget(state.budget, minRequiredBudget) : null;

  const computation: Computation = (() => {
    if (!allDebtsValid || !budgetResult) return { kind: "incomplete" };
    if (!budgetResult.ok) {
      if (budgetResult.error.code === "belowMinimum") {
        return { kind: "belowMinimum", minRequired: budgetResult.error.min };
      }
      return { kind: "incomplete" };
    }

    try {
      // allDebtsValid already confirmed every result.ok above; `?? 0` here is
      // just to satisfy the type checker across the array-index access, not
      // a real fallback path.
      const debts: Debt[] = state.debts.map((d, i) => ({
        id: d.id,
        balance: fieldValue(debtResults[i].balance),
        annualRate: fieldValue(debtResults[i].rate) / 100,
        rateType: "nominal",
        minPayment: fieldValue(debtResults[i].minPayment),
      }));
      const startingTotal = debts.reduce((sum, d) => sum + d.balance, 0);
      const avalanche = multiDebtPlan(debts, budgetResult.value, "avalanche");
      const snowball = multiDebtPlan(debts, budgetResult.value, "snowball");
      return { kind: "ok", avalanche, snowball, startingTotal };
    } catch {
      return { kind: "error" };
    }
  })();

  const currencyOptions = hydrated
    ? getCurrencyOptions(config.locale)
    : [{ code: state.currency, name: state.currency }];

  async function handleCopyLink() {
    const base = `${window.location.origin}${window.location.pathname}`;
    const url = buildMultiDebtShareUrl(base, state);
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      // Clipboard API unavailable - the URL is already synced to the address bar.
    }
  }

  return (
    <div>
      {/* Debts */}
      <div>
        <h2 className="text-sm font-semibold tracking-wide text-foreground/75 uppercase">{strings.debtsHeading}</h2>
        <div className="mt-4 space-y-4">
          {state.debts.map((debt, i) => {
            const result = debtResults[i];
            const balanceError = fieldError(result.balance);
            const rateError = fieldError(result.rate);
            const minPaymentError = fieldError(result.minPayment);
            const displayName = resolveDebtName(debt.name, i + 1);

            return (
              <div key={debt.id} className="relative rounded-xl border border-foreground/10 p-4 sm:p-5">
                <button
                  type="button"
                  onClick={() => removeDebt(debt.id)}
                  disabled={state.debts.length <= 1}
                  aria-label={interpolate(strings.removeDebtButton, { name: displayName })}
                  className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-lg text-lg text-foreground/50 outline-none transition-colors hover:bg-error-bg hover:text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground/50"
                >
                  ×
                </button>
                <div className="grid gap-3 pr-12 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label={strings.debtNameLabel} htmlFor={`name-${debt.id}`}>
                    <input
                      id={`name-${debt.id}`}
                      type="text"
                      value={debt.name}
                      onChange={(e) => updateDebt(debt.id, { name: e.target.value })}
                      className={inputClass}
                      placeholder={interpolate(strings.debtNamePlaceholder, { n: String(i + 1) })}
                    />
                  </Field>

                  <Field label={strings.debtBalanceLabel} htmlFor={`balance-${debt.id}`} error={balanceError && describeError(balanceError, strings, money)}>
                    <input
                      id={`balance-${debt.id}`}
                      type="text"
                      inputMode="decimal"
                      value={debt.balance}
                      onChange={(e) => updateDebt(debt.id, { balance: e.target.value })}
                      className={inputClass}
                      placeholder="6,000"
                    />
                  </Field>

                  <Field label={strings.debtRateLabel} htmlFor={`rate-${debt.id}`} error={rateError && describeError(rateError, strings, (n) => `${n}%`)}>
                    <input
                      id={`rate-${debt.id}`}
                      type="text"
                      inputMode="decimal"
                      value={debt.ratePercent}
                      onChange={(e) => updateDebt(debt.id, { ratePercent: e.target.value })}
                      className={inputClass}
                      placeholder="24.99"
                    />
                  </Field>

                  <Field
                    label={strings.debtMinPaymentLabel}
                    htmlFor={`min-${debt.id}`}
                    error={minPaymentError && describeError(minPaymentError, strings, money)}
                  >
                    <input
                      id={`min-${debt.id}`}
                      type="text"
                      inputMode="decimal"
                      value={debt.minPayment}
                      onChange={(e) => updateDebt(debt.id, { minPayment: e.target.value })}
                      className={inputClass}
                      placeholder="150"
                    />
                  </Field>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addDebt}
          className="mt-4 flex min-h-11 items-center rounded-lg border border-foreground/20 px-4 text-sm font-medium text-foreground outline-none transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          + {strings.addDebtButton}
        </button>
      </div>

      {/* Budget + currency */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:items-end lg:max-w-xl">
        <Field
          label={strings.budgetLabel}
          htmlFor="budget"
          error={
            computation.kind === "belowMinimum"
              ? describeBudgetError({ code: "belowMinimum", min: computation.minRequired }, strings, money)
              : undefined
          }
        >
          <input
            id="budget"
            type="text"
            inputMode="decimal"
            value={state.budget}
            onChange={(e) => setState((prev) => ({ ...prev, budget: e.target.value }))}
            className={inputClass}
            placeholder="700"
          />
        </Field>

        <Field label={strings.currencyLabel} htmlFor="currency">
          <select id="currency" value={state.currency} onChange={(e) => handleCurrencyChange(e.target.value)} className={inputClass}>
            {currencyOptions.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.code} — {opt.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Comparison */}
      {computation.kind === "ok" && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold tracking-wide text-foreground/75 uppercase">{strings.comparisonHeading}</h2>

          <WinnerMessage strings={strings} avalanche={computation.avalanche} snowball={computation.snowball} money={money} />

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <StrategyCard
              heading={strings.avalancheHeading}
              description={strings.avalancheDescription}
              plan={computation.avalanche}
              debts={state.debts}
              strings={strings}
              locale={config.locale}
              money={money}
            />
            <StrategyCard
              heading={strings.snowballHeading}
              description={strings.snowballDescription}
              plan={computation.snowball}
              debts={state.debts}
              strings={strings}
              locale={config.locale}
              money={money}
            />
          </div>

          <p className="mt-5 text-sm text-foreground/75">{strings.motivationNote}</p>

          {/* Chart */}
          <div className="mt-8">
            <PayoffChart
              title={strings.chartTitle}
              baselineLabel={strings.chartAvalancheLabel}
              whatIfLabel={strings.chartSnowballLabel}
              xAxisLabel={strings.chartXAxisLabel}
              currency={state.currency}
              locale={config.locale}
              baseline={[
                { month: 0, balance: computation.startingTotal },
                ...computation.avalanche.schedule.map((r) => ({ month: r.month, balance: r.totalBalance })),
              ]}
              whatIf={[
                { month: 0, balance: computation.startingTotal },
                ...computation.snowball.schedule.map((r) => ({ month: r.month, balance: r.totalBalance })),
              ]}
            />
          </div>

          {/* Copy link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="mt-6 flex min-h-11 items-center rounded-lg border border-foreground/20 px-4 text-sm font-medium text-foreground outline-none transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {copyStatus === "copied" ? strings.copyLinkCopied : strings.copyLinkButton}
          </button>
        </div>
      )}

      {computation.kind === "error" && (
        <p role="alert" className="mt-8 rounded-lg border border-error/30 bg-error-bg px-4 py-3 text-sm font-medium text-error">
          {strings.errorNotANumber}
        </p>
      )}
    </div>
  );
}

function WinnerMessage({
  strings,
  avalanche,
  snowball,
  money,
}: {
  strings: MultiDebtCalculatorStrings;
  avalanche: MultiDebtPlan;
  snowball: MultiDebtPlan;
  money: (n: number) => string;
}) {
  const difference = Math.abs(snowball.totalInterest - avalanche.totalInterest);
  const cheaper = avalanche.totalInterest <= snowball.totalInterest ? strings.avalancheHeading : strings.snowballHeading;
  const moreExpensive = Math.max(avalanche.totalInterest, snowball.totalInterest);
  const percent = moreExpensive > 0 ? (difference / moreExpensive) * 100 : 0;

  if (difference < 0.5) {
    return <p className="mt-3 text-base text-foreground sm:text-lg">{strings.tieMessage}</p>;
  }

  return (
    <p className="mt-3 text-base text-foreground sm:text-lg">
      {interpolate(strings.winnerMessage, {
        method: cheaper,
        amount: money(difference),
        percent: `${percent.toFixed(1)}%`,
      })}
    </p>
  );
}

function StrategyCard({
  heading,
  description,
  plan,
  debts,
  strings,
  locale,
  money,
}: {
  heading: string;
  description: string;
  plan: MultiDebtPlan;
  debts: DebtFormRow[];
  strings: MultiDebtCalculatorStrings;
  locale: string;
  money: (n: number) => string;
}) {
  const nameById = new Map(debts.map((d, i) => [d.id, resolveDebtName(d.name, i + 1)]));

  return (
    <div className="rounded-xl border border-foreground/10 bg-surface p-5 shadow-sm sm:p-6">
      <h3 className="text-lg font-semibold tracking-tight text-foreground">{heading}</h3>
      <p className="mt-1 text-sm text-foreground/75">{description}</p>

      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-4 border-t border-foreground/10 pt-4">
        <div>
          <dt className="text-sm text-foreground/75">{strings.debtFreeDateLabel}</dt>
          <dd className="mt-1 text-xl font-semibold text-nowrap text-accent">
            {formatMonthYear(addMonths(new Date(), plan.debtFreeMonth), locale)}
          </dd>
        </div>
        <div className="sm:border-l sm:border-foreground/10 sm:pl-6">
          <dt className="text-sm text-foreground/75">{strings.totalInterestLabel}</dt>
          <dd className="mt-1 text-xl font-semibold text-nowrap text-foreground">{money(plan.totalInterest)}</dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-foreground/10 pt-4">
        <h4 className="text-sm text-foreground/75">{strings.payoffOrderLabel}</h4>
        <ol className="mt-2 space-y-1.5 text-sm text-foreground">
          {plan.order.map((id, i) => {
            const entry = plan.debts.find((d) => d.id === id);
            return (
              <li key={id} className="flex items-baseline justify-between gap-3">
                <span>
                  {i + 1}. {nameById.get(id) ?? id}
                </span>
                <span className="text-foreground/75">
                  {entry ? interpolate(strings.clearedInMonthLabel, { month: String(entry.payoffMonth) }) : ""}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
