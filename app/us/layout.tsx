import type { Metadata } from "next";
import { alternateLanguages, getStrings, REGIONS, SITE_URL } from "@/lib/content";
import { SiteChrome } from "../components/SiteChrome";
import type { ReactNode } from "react";

const strings = getStrings("us");
const region = REGIONS.us;

export const metadata: Metadata = {
  title: strings.meta.title,
  description: strings.meta.description,
  alternates: {
    canonical: `${SITE_URL}${region.path}`,
    languages: alternateLanguages(),
  },
};

export default function UsLayout({ children }: { children: ReactNode }) {
  return <SiteChrome region="us">{children}</SiteChrome>;
}
