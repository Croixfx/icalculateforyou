import type { Metadata } from "next";
import { alternateLanguages, getStrings, REGIONS, SITE_URL } from "@/lib/content";
import { SiteChrome } from "../components/SiteChrome";
import type { ReactNode } from "react";

const strings = getStrings("au");
const region = REGIONS.au;

export const metadata: Metadata = {
  title: strings.meta.title,
  description: strings.meta.description,
  alternates: {
    canonical: `${SITE_URL}${region.path}`,
    languages: alternateLanguages(),
  },
};

export default function AuLayout({ children }: { children: ReactNode }) {
  return <SiteChrome region="au">{children}</SiteChrome>;
}
