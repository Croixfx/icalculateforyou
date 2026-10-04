import Link from "next/link";
import type { SiteStrings } from "@/lib/content";

interface FooterProps {
  strings: SiteStrings;
}

export function Footer({ strings }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-foreground/10">
      <div className="mx-auto max-w-4xl px-4 py-6 text-sm text-foreground/75 lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl">
        {strings.footer.nav.length > 0 && (
          <nav aria-label="Other regions" className="mb-4 flex flex-wrap gap-x-4 gap-y-2">
            {strings.footer.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="flex min-h-11 items-center underline-offset-2 transition-colors hover:text-foreground hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
        <p>{strings.footer.disclaimer}</p>
        <p className="mt-1">
          &copy; {year} {strings.footer.copyright}
        </p>
      </div>
    </footer>
  );
}
