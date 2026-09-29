"use client";

import { useEffect, useState } from "react";
import { monthsToPayoff, paymentForTarget, type PayoffResult } from "@/lib/engine";
import { formatCurrency, getCurrencyOptions, getPreferredCurrency, detectLocale, setPreferredCurrency } from "@/lib/locale";
import {
  addMonths,
  buildShareUrl,
  clampExtraPercent,
  decodeFormState,
  encodeFormState,
  formatMonthYear,
  interpolate,
  validateBalance,
  validatePayment,
  validateRatePercent,
  validateTargetDate,
  type CalculatorFormState,
  type ValidationError,
} from "@/lib/calculator";
import { getStrings, REGIONS, type CalculatorStrings, type RegionKey } from "@/lib/content";
import { AmortizationTable } from "./AmortizationTable";
import { PayoffChart } from "./PayoffChart";

interface DebtPayoffCalculatorProps {
  region: RegionKey;
}

// Pre-filled with an illustrative example (not blank) so results are
// visible immediately on load, without the visitor having to type
// anything first or scroll to find them. Any of these are one edit away
// from reflecting the visitor's own numbers.
function defaultState(region: RegionKey): CalculatorFormState {
  return {
    mode: "duration",
    balance: "7000",
    ratePercent: "21",
    rateType: "nominal",
    payment: "200",
    targetDate: "",
    extraPercent: "0",
    currency: REGIONS[region].currency,
  };
}

function describeError(
  error: ValidationError,
  strings: CalculatorStrings,
  format: (n: number) => string,
): string {
  switch (error.code) {
    case "required":
      return strings.errorRequired;
    case "notANumber":
      return strings.errorNotANumber;
    case "mustBePositive":
      return strings.errorMustBePositive;
    case "tooLarge":
      return interpolate(strings.errorTooLarge, { max: format(error.max) });
    case "paymentTooLow":
      return interpolate(strings.paymentTooLowMessage, { min: format(error.minPayment) });
    case "dateNotInFuture":
      return strings.errorDateNotInFuture;
    case "dateTooFar":
      return interpolate(strings.errorDateTooFar, { years: String(Math.round(error.maxMonths / 12)) });
    default:
      return strings.errorNotANumber;
  }
}

/** A blank field just means "no results yet" — only show a message once there's content to react to. */
function fieldError(result: { ok: true } | { ok: false; error: ValidationError } | null | undefined): ValidationError | undefined {
  if (!result || result.ok || result.error.code === "required") return undefined;
  return result.error;
}

type Computation =
  | { kind: "error" }
  | {
      kind: "ok";
      payment: number;
      baseline: PayoffResult;
      whatIf: PayoffResult | null;
      extraAmount: number;
    };

export function DebtPayoffCalculator({ region }: DebtPayoffCalculatorProps) {
  const content = getStrings(region);
  const strings = content.calculator;
  const config = REGIONS[region];

  const [state, setState] = useState<CalculatorFormState>(() => defaultState(region));
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [hydrated, setHydrated] = useState(false);

  // Render with the region's default currency first (matches the server), then
  // layer in any shared-link params and the saved/detected currency after
  // mount — avoids a hydration mismatch, at the cost of a brief post-load
  // update for shared links (inherent to a statically-exported site: there's
  // no per-request server to pre-render a visitor's query string).
  //
  // Currency priority: URL param > a previously saved manual choice > the
  // region's own currency for a country page (a /ca/ visitor should see CAD
  // by default, not whatever their browser's locale happens to suggest) >
  // browser detection, which only makes sense on the currency-agnostic "/"
  // page.
  useEffect(() => {
    const fromUrl = decodeFormState(window.location.search);
    const fallbackCurrency = region === "default" ? detectLocale().currency : config.currency;
    // Adopting client-only external state (URL, localStorage) on mount; a
    // lazy useState initializer would also run during SSR and cause a
    // hydration mismatch, which is exactly what this effect exists to avoid.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((prev) => ({
      ...prev,
      ...fromUrl,
      currency: fromUrl.currency ?? getPreferredCurrency() ?? fallbackCurrency,
    }));
    setHydrated(true);
  }, [region, config.currency]);

  // Keep the URL in sync so the current result is always a shareable link,
  // without spamming browser history on every keystroke. Gated on `hydrated`
  // so this never fires with the pristine default state and briefly
  // clobbers an incoming shared link's query string before it's been read.
  useEffect(() => {
    if (!hydrated) return;
    const query = encodeFormState(state).toString();
    const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [state, hydrated]);

  function update<K extends keyof CalculatorFormState>(key: K, value: CalculatorFormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function handleCurrencyChange(currency: string) {
    update("currency", currency);
    setPreferredCurrency(currency);
  }

  const money = (n: number) => formatCurrency(n, state.currency, config.locale);

  const balanceResult = validateBalance(state.balance);
  const rateResult = validateRatePercent(state.ratePercent);
  const paymentResult =
    state.mode === "duration" && balanceResult.ok && rateResult.ok
      ? validatePayment(state.payment, {
          balance: balanceResult.value,
          ratePercent: rateResult.value,
          rateType: state.rateType,
        })
      : null;
  const targetResult = state.mode === "target" ? validateTargetDate(state.targetDate, new Date()) : null;

  const balanceError = (() => {
    const e = fieldError(balanceResult);
    return e ? describeError(e, strings, money) : undefined;
  })();
  const rateError = (() => {
    const e = fieldError(rateResult);
    return e ? describeError(e, strings, (n) => `${n}%`) : undefined;
  })();
  const paymentError = (() => {
    const e = fieldError(paymentResult);
    return e ? describeError(e, strings, money) : undefined;
  })();
  const targetError = (() => {
    const e = fieldError(targetResult);
    return e ? describeError(e, strings, money) : undefined;
  })();

  const computation: Computation | null = (() => {
    if (!balanceResult.ok || !rateResult.ok) return null;
    const balance = balanceResult.value;
    const ratePercent = rateResult.value;
    const rateType = state.rateType;

    try {
      let payment: number;
      if (state.mode === "duration") {
        if (!paymentResult || !paymentResult.ok) return null;
        payment = paymentResult.value;
      } else {
        if (!targetResult || !targetResult.ok) return null;
        payment = paymentForTarget(balance, ratePercent / 100, rateType, targetResult.value);
        if (!Number.isFinite(payment) || payment <= 0) return { kind: "error" };
      }

      const baseline = monthsToPayoff(balance, ratePercent / 100, rateType, payment);

      const extraPercent = clampExtraPercent(state.extraPercent);
      const extraAmount = payment * (extraPercent / 100);
      const whatIf = extraAmount > 0 ? monthsToPayoff(balance, ratePercent / 100, rateType, payment + extraAmount) : null;

      return { kind: "ok", payment, baseline, whatIf, extraAmount };
    } catch {
      return { kind: "error" };
    }
  })();

  // The full currency list comes from the runtime's Intl.supportedValuesOf,
  // which Node (server) and Chromium (client) can report differently sized
  // sets for — computing it during the initial render risks a hydration
  // mismatch. Render just the current currency until hydrated (guaranteed
  // identical both sides), then swap in the full list.
  const currencyOptions = hydrated
    ? getCurrencyOptions(config.locale)
    : [{ code: state.currency, name: state.currency }];

  async function handleCopyLink() {
    const base = `${window.location.origin}${window.location.pathname}`;
    const url = buildShareUrl(base, state);
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      // Clipboard API unavailable (older browser, insecure context) — the
      // URL is already synced to the address bar, so it's still shareable.
    }
  }

  return (
    <div>
      <div className="lg:grid lg:grid-cols-[26rem_1fr] lg:items-start lg:gap-10">
        {/* Left column: mode tabs, inputs, advanced. Fixed width on large
            screens (rather than an even split) so the inputs stay a
            comfortable field width instead of stretching, and the results
            column below gets the rest of the space instead. */}
        <div>
          <div role="tablist" aria-label={strings.resultsHeading} className="flex gap-1 border-b border-foreground/10">
            {(["duration", "target"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={state.mode === mode}
                onClick={() => update("mode", mode)}
                className={`-mb-px flex min-h-11 items-center border-b-2 px-4 text-sm font-medium transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  state.mode === mode
                    ? "border-accent text-foreground"
                    : "border-transparent text-foreground/75 hover:text-foreground"
                }`}
              >
                {mode === "duration" ? strings.modeDuration : strings.modeTarget}
              </button>
            ))}
          </div>

          {/* Inputs */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label={strings.balanceLabel} htmlFor="balance" error={balanceError}>
              <input
                id="balance"
                type="text"
                inputMode="decimal"
                value={state.balance}
                onChange={(e) => update("balance", e.target.value)}
                className={inputClass}
                placeholder="7,000"
              />
            </Field>

            <Field label={strings.ratePercentLabel} htmlFor="ratePercent" error={rateError}>
              <input
                id="ratePercent"
                type="text"
                inputMode="decimal"
                value={state.ratePercent}
                onChange={(e) => update("ratePercent", e.target.value)}
                className={inputClass}
                placeholder="21"
              />
            </Field>

            {state.mode === "duration" ? (
              <Field label={strings.paymentLabel} htmlFor="payment" error={paymentError}>
                <input
                  id="payment"
                  type="text"
                  inputMode="decimal"
                  value={state.payment}
                  onChange={(e) => update("payment", e.target.value)}
                  className={inputClass}
                  placeholder="200"
                />
              </Field>
            ) : (
              <Field label={strings.targetDateLabel} htmlFor="targetDate" error={targetError}>
                <input
                  id="targetDate"
                  type="month"
                  value={state.targetDate}
                  onChange={(e) => update("targetDate", e.target.value)}
                  className={inputClass}
                />
              </Field>
            )}

            <Field label={strings.currencyLabel} htmlFor="currency">
              <select
                id="currency"
                value={state.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className={inputClass}
              >
                {currencyOptions.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.code} — {opt.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Advanced: rate type */}
          <details className="group mt-5">
            <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center text-sm font-medium text-foreground/75 transition-colors hover:text-foreground">
              {strings.advancedToggle}
            </summary>
            <fieldset className="mt-2 flex flex-col gap-1 sm:flex-row sm:gap-6">
              <legend className="mb-1 text-sm text-foreground/75">{strings.rateTypeLabel}</legend>
              {(["nominal", "effective"] as const).map((rt) => (
                <label key={rt} className="flex min-h-11 items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="rateType"
                    checked={state.rateType === rt}
                    onChange={() => update("rateType", rt)}
                    className="h-4 w-4 accent-accent"
                  />
                  {rt === "nominal" ? strings.rateTypeNominal : strings.rateTypeEffective}
                </label>
              ))}
            </fieldset>
          </details>
        </div>

        {/* Right column: primary results, alongside the inputs so they never require scrolling past the form to see */}
        <div className="mt-6 lg:mt-0">
          {computation?.kind === "error" && (
            <p role="alert" className="rounded-lg border border-error/30 bg-error-bg px-4 py-3 text-sm font-medium text-error">
              {strings.errorTooSlow}
            </p>
          )}

          {computation?.kind === "ok" && (
            <div className="rounded-xl border border-foreground/10 bg-surface p-5 shadow-sm sm:p-6 lg:p-8">
              <h2 className="text-sm font-semibold tracking-wide text-foreground/75 uppercase">
                {strings.resultsHeading}
              </h2>

              <p className="mt-2 text-4xl font-semibold tracking-tight text-accent sm:text-5xl lg:text-6xl">
                {formatMonthYear(addMonths(new Date(), computation.baseline.months), config.locale)}
              </p>
              <p className="mt-1 text-sm text-foreground/75">{strings.debtFreeDateLabel}</p>

              <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 border-t border-foreground/10 pt-6 sm:grid-cols-3">
                <ResultStat label={strings.monthsLabel} value={String(computation.baseline.months)} />
                <ResultStat label={strings.totalInterestLabel} value={money(computation.baseline.totalInterest)} divided />
                <ResultStat label={strings.totalPaidLabel} value={money(computation.baseline.totalPaid)} divided />
              </dl>
              {state.mode === "target" && (
                <p className="mt-4 text-sm text-foreground/75">
                  {strings.requiredPaymentLabel}:{" "}
                  <strong className="font-semibold text-foreground">{money(computation.payment)}</strong>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Below the fold: what-if, chart, share, schedule — full width */}
      {computation?.kind === "ok" && (
        <div className="mt-6">
          {/* What if */}
          <div className="rounded-xl border border-foreground/10 p-5 sm:p-6">
            <h3 className="text-sm font-medium text-foreground">{strings.whatIfHeading}</h3>
            <div className="mt-3 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor="extraPercent" className="text-foreground/75">
                  {strings.whatIfLabel}
                </label>
                <span className="font-medium tabular-nums text-foreground">+{money(computation.extraAmount)}</span>
              </div>
              <input
                id="extraPercent"
                type="range"
                min={0}
                max={50}
                step={1}
                value={clampExtraPercent(state.extraPercent)}
                onChange={(e) => update("extraPercent", e.target.value)}
                className="mt-2 h-11 w-full rounded accent-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
            </div>
            {computation.whatIf && (
              <p className="mt-3 text-sm text-foreground/75">
                <strong className="font-semibold text-foreground">
                  {computation.baseline.months - computation.whatIf.months}
                </strong>{" "}
                {strings.whatIfMonthsSaved} &middot;{" "}
                <strong className="font-semibold text-foreground">
                  {money(computation.baseline.totalInterest - computation.whatIf.totalInterest)}
                </strong>{" "}
                {strings.whatIfInterestSaved}
              </p>
            )}
          </div>

          {/* Chart */}
          <div className="mt-6">
            <PayoffChart
              title={strings.chartTitle}
              baselineLabel={strings.chartBaselineLabel}
              whatIfLabel={strings.chartWhatIfLabel}
              xAxisLabel={strings.chartXAxisLabel}
              currency={state.currency}
              locale={config.locale}
              baseline={[
                { month: 0, balance: balanceResult.ok ? balanceResult.value : 0 },
                ...computation.baseline.schedule.map((r) => ({ month: r.month, balance: r.balance })),
              ]}
              whatIf={
                computation.whatIf
                  ? [
                      { month: 0, balance: balanceResult.ok ? balanceResult.value : 0 },
                      ...computation.whatIf.schedule.map((r) => ({ month: r.month, balance: r.balance })),
                    ]
                  : null
              }
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

          {/* Amortization schedule */}
          <div className="mt-6">
            <AmortizationTable
              schedule={computation.baseline.schedule}
              currency={state.currency}
              locale={config.locale}
              showLabel={strings.scheduleToggleShow}
              hideLabel={strings.scheduleToggleHide}
              headers={{
                month: strings.scheduleMonthHeader,
                payment: strings.schedulePaymentHeader,
                interest: strings.scheduleInterestHeader,
                principal: strings.schedulePrincipalHeader,
                balance: strings.scheduleBalanceHeader,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "min-h-11 w-full rounded-lg border border-foreground/20 bg-surface px-3 py-2 text-base text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25";

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-sm font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * `divided` draws a left border once stats sit side by side (sm:grid-cols-3)
 * so each number reads as its own cell instead of running into its
 * neighbor - on a single mobile column there's nothing to divide from.
 */
function ResultStat({ label, value, divided = false }: { label: string; value: string; divided?: boolean }) {
  return (
    <div className={divided ? "sm:border-l sm:border-foreground/10 sm:pl-6" : undefined}>
      <dt className="text-sm text-foreground/75">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums text-foreground sm:text-[1.75rem] lg:text-3xl">
        {value}
      </dd>
    </div>
  );
}
