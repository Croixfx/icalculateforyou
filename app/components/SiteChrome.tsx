import type { ReactNode } from "react";
import { getStrings, type RegionKey } from "@/lib/content";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface SiteChromeProps {
  region: RegionKey;
  children: ReactNode;
}

/**
 * Shared page chrome (header, footer) used by every region section. Only
 * the strings passed in change; the structure stays the same everywhere so
 * the site feels consistent across currencies and locales.
 */
export function SiteChrome({ region, children }: SiteChromeProps) {
  const strings = getStrings(region);
  const homeHref = region === "default" ? "/" : `/${region}/`;

  return (
    <>
      <Header strings={strings} homeHref={homeHref} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:py-12 lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl">
        {children}
      </main>
      <Footer strings={strings} />
    </>
  );
}
