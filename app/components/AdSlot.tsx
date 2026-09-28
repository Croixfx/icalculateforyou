interface AdSlotProps {
  id: string;
  label?: string;
  className?: string;
}

/**
 * Placeholder for an ad unit. Swap the inner content for the real ad
 * network's script/tag once one is chosen — every call site already passes
 * a stable `id` to target. Deliberately styled to look nothing like the
 * calculator (dashed border, distinct panel, small-caps label) so it never
 * reads as part of the tool, and min-h reserves its space up front so an
 * ad loading in later never shifts the layout.
 */
export function AdSlot({ id, label = "Advertisement", className = "" }: AdSlotProps) {
  return (
    <div
      id={id}
      data-ad-slot={id}
      className={`flex min-h-[90px] w-full items-center justify-center rounded-lg border border-dashed border-foreground/20 bg-foreground/[0.03] px-4 ${className}`}
    >
      <span className="text-xs font-medium tracking-wide text-foreground/75 uppercase">{label}</span>
    </div>
  );
}
