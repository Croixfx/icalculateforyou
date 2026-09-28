export type RegionKey = "default" | "us" | "uk" | "ca" | "au";

export interface RegionConfig {
  key: RegionKey;
  path: string;
  hreflang: string;
  locale: string;
  currency: string;
  countryName: string;
}

export interface SiteStrings {
  meta: {
    title: string;
    description: string;
  };
  header: {
    siteName: string;
    nav: { label: string; href: string }[];
  };
  hero: {
    title: string;
    subtitle: string;
  };
  footer: {
    disclaimer: string;
    copyright: string;
  };
}
