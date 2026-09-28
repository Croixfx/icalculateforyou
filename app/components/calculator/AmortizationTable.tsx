import type { AmortizationRow } from "@/lib/engine";
import { formatCurrency } from "@/lib/locale";

interface AmortizationTableProps {
  schedule: AmortizationRow[];
  currency: string;
  locale: string;
  showLabel: string;
  hideLabel: string;
  headers: {
    month: string;
    payment: string;
    interest: string;
    principal: string;
    balance: string;
  };
}

export function AmortizationTable({ schedule, currency, locale, showLabel, hideLabel, headers }: AmortizationTableProps) {
  return (
    <details className="group">
      <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center rounded-lg border border-foreground/20 px-4 text-sm font-medium text-foreground outline-none transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
        <span className="group-open:hidden">{showLabel}</span>
        <span className="hidden group-open:inline">{hideLabel}</span>
      </summary>
      <div
        tabIndex={0}
        role="region"
        aria-label={showLabel}
        className="mt-3 max-h-96 overflow-auto rounded-lg border border-foreground/10 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <table className="w-full min-w-[480px] border-collapse text-sm [font-variant-numeric:tabular-nums]">
          <thead className="bg-surface sticky top-0">
            <tr className="text-left text-foreground/75">
              <th scope="col" className="px-3 py-2 font-medium">
                {headers.month}
              </th>
              <th scope="col" className="px-3 py-2 text-right font-medium">
                {headers.payment}
              </th>
              <th scope="col" className="px-3 py-2 text-right font-medium">
                {headers.interest}
              </th>
              <th scope="col" className="px-3 py-2 text-right font-medium">
                {headers.principal}
              </th>
              <th scope="col" className="px-3 py-2 text-right font-medium">
                {headers.balance}
              </th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((row) => (
              <tr key={row.month} className="border-t border-foreground/10 text-foreground">
                <td className="px-3 py-2">{row.month}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(row.payment, currency, locale)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(row.interest, currency, locale)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(row.principal, currency, locale)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(row.balance, currency, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
