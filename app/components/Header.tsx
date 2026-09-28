import Link from "next/link";
import type { SiteStrings } from "@/lib/content";

interface HeaderProps {
  strings: SiteStrings;
  homeHref: string;
}

export function Header({ strings, homeHref }: HeaderProps) {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
        <Link href={homeHref} className="text-lg font-semibold tracking-tight">
          {strings.header.siteName}
        </Link>
        <nav className="flex gap-4 text-sm">
          {strings.header.nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
