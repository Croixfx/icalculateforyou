import Link from "next/link";
import type { SiteStrings } from "@/lib/content";

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
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
        <Link href={homeHref} prefetch={false} className="text-lg font-semibold tracking-tight">
          {strings.header.siteName}
        </Link>
        <nav className="flex gap-4 text-sm">
          {strings.header.nav.map((item) => (
            <Link key={item.href} href={item.href} prefetch={false} className="hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
