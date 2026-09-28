import type { ReactNode } from "react";
import { getStrings, type RegionKey } from "@/lib/content";
import { AdSlot } from "./AdSlot";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface SiteChromeProps {
  region: RegionKey;
  children: ReactNode;
}

/**
 * Shared page chrome (header, footer, ad slots) used by every region
 * section. Only the strings passed in change; the structure stays the same
 * everywhere so the site feels consistent across currencies and locales.
 */
export function SiteChrome({ region, children }: SiteChromeProps) {
  const strings = getStrings(region);
  const homeHref = region === "default" ? "/" : `/${region}/`;

  return (
    <>
      <Header strings={strings} homeHref={homeHref} />
      <AdSlot id={`ad-top-${region}`} className="mx-auto my-4 max-w-4xl" />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">{children}</main>
      <AdSlot id={`ad-bottom-${region}`} className="mx-auto my-4 max-w-4xl" />
      <Footer strings={strings} />
    </>
  );
}
