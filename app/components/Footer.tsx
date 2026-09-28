import type { SiteStrings } from "@/lib/content";

interface FooterProps {
  strings: SiteStrings;
}

export function Footer({ strings }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-black/10 dark:border-white/10">
      <div className="mx-auto max-w-4xl px-4 py-6 text-xs text-black/60 dark:text-white/60">
        <p>{strings.footer.disclaimer}</p>
        <p className="mt-1">
          &copy; {year} {strings.footer.copyright}
        </p>
      </div>
    </footer>
  );
}
