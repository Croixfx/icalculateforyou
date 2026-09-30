import type { ReactNode } from "react";

export const inputClass =
  "min-h-11 w-full rounded-lg border border-foreground/20 bg-surface px-3 py-2 text-base text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25";

export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
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
