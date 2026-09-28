interface AdSlotProps {
  id: string;
  label?: string;
  className?: string;
}

/**
 * Placeholder for an ad unit. Swap the inner content for the real ad
 * network's script/tag once one is chosen — every call site already passes
 * a stable `id` to target.
 */
export function AdSlot({ id, label = "Advertisement", className = "" }: AdSlotProps) {
  return (
    <div
      id={id}
      data-ad-slot={id}
      className={`flex min-h-[90px] w-full items-center justify-center border border-dashed border-black/10 bg-black/[.02] text-xs text-black/40 dark:border-white/15 dark:bg-white/[.03] dark:text-white/40 ${className}`}
    >
      {label}
    </div>
  );
}
