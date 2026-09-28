import type { Metadata } from "next";
import { SiteChrome } from "./components/SiteChrome";
import { alternateLanguages, getStrings, SITE_URL } from "@/lib/content";

const strings = getStrings("default");

export const metadata: Metadata = {
  title: strings.meta.title,
  description: strings.meta.description,
  alternates: {
    canonical: SITE_URL,
    languages: alternateLanguages(),
  },
};

export default function Home() {
  return (
    <SiteChrome region="default">
      <h1 className="text-3xl font-semibold tracking-tight">{strings.hero.title}</h1>
      <p className="mt-3 max-w-xl text-black/70 dark:text-white/70">{strings.hero.subtitle}</p>
    </SiteChrome>
  );
}
