import Link from "next/link";
import type { SiteStrings } from "@/lib/content";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  strings: SiteStrings;
  homeHref: string;
}

// prefetch={false} on every link: Next's default prefetch requests an RSC
// payload at a flattened path (e.g. "/us/__next.us.__PAGE__.txt") that only
// resolves via a platform-specific rewrite (Vercel's hosting layer does
// this); a generic static host serves the actual nested file and 404s on
// the flattened request. With only 5 pages, disabling prefetch costs
// nothing noticeable and avoids console errors on every static host.
export function Header({ strings, homeHref }: HeaderProps) {
  return (
    <header className="border-b border-foreground/10 bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4 lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl">
        <Link
          href={homeHref}
          prefetch={false}
          className="min-h-11 py-2 text-lg font-semibold tracking-tight text-foreground"
        >
          {strings.header.siteName}
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {strings.header.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="flex min-h-11 items-center text-foreground/75 underline-offset-2 transition-colors hover:text-foreground hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
