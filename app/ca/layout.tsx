import type { Metadata } from "next";
import { alternateLanguages, getStrings, REGIONS, SITE_URL } from "@/lib/content";
import { SiteChrome } from "../components/SiteChrome";
import type { ReactNode } from "react";

const strings = getStrings("ca");
const region = REGIONS.ca;

export const metadata: Metadata = {
  title: strings.meta.title,
  description: strings.meta.description,
  alternates: {
    canonical: `${SITE_URL}${region.path}`,
    languages: alternateLanguages(),
  },
};

export default function CaLayout({ children }: { children: ReactNode }) {
  return <SiteChrome region="ca">{children}</SiteChrome>;
}
