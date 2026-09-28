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
      <summary className="cursor-pointer list-none rounded border border-black/15 px-4 py-2 text-sm font-medium text-black/80 hover:bg-black/[.03] dark:border-white/20 dark:text-white/80 dark:hover:bg-white/[.05]">
        <span className="group-open:hidden">{showLabel}</span>
        <span className="hidden group-open:inline">{hideLabel}</span>
      </summary>
      <div className="mt-2 max-h-96 overflow-auto rounded border border-black/10 dark:border-white/10">
        <table className="w-full min-w-[480px] border-collapse text-sm [font-variant-numeric:tabular-nums]">
          <thead className="sticky top-0 bg-white dark:bg-black">
            <tr className="text-left text-black/60 dark:text-white/60">
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
              <tr key={row.month} className="border-t border-black/5 dark:border-white/10">
                <td className="px-3 py-1.5">{row.month}</td>
                <td className="px-3 py-1.5 text-right">{formatCurrency(row.payment, currency, locale)}</td>
                <td className="px-3 py-1.5 text-right">{formatCurrency(row.interest, currency, locale)}</td>
                <td className="px-3 py-1.5 text-right">{formatCurrency(row.principal, currency, locale)}</td>
                <td className="px-3 py-1.5 text-right">{formatCurrency(row.balance, currency, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
