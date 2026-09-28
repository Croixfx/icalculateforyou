/** Replaces "{key}" placeholders in a template string with the given values. */
export function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => vars[key] ?? match);
}

/** Adds a whole number of months to a date, handling year rollover correctly. */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth() + months, 1);
  return result;
}

/** Formats a date as a localized "Month Year" string (e.g. "March 2031"). */
export function formatMonthYear(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" }).format(date);
}
