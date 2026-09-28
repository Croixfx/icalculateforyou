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
 * Shared page chrome (header, footer, ad slot) used by every region
 * section. Only the strings passed in change; the structure stays the same
 * everywhere so the site feels consistent across currencies and locales.
 *
 * No ad slot runs above `children` — every page puts the calculator first,
 * and ads must never sit above it or between its inputs and results. Pages
 * that want an ad slot partway through their content (below the calculator,
 * within the article body) render <AdSlot> themselves; this wrapper only
 * owns the one guaranteed to be safe: after everything, above the footer.
 */
export function SiteChrome({ region, children }: SiteChromeProps) {
  const strings = getStrings(region);
  const homeHref = region === "default" ? "/" : `/${region}/`;

  return (
    <>
      <Header strings={strings} homeHref={homeHref} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:py-12">{children}</main>
      <AdSlot id={`ad-bottom-${region}`} className="mx-auto mb-8 max-w-4xl" />
      <Footer strings={strings} />
    </>
  );
}
