import type { MetadataRoute } from "next";
import { REGIONS, SITE_URL } from "@/lib/content";

// Required for `output: "export"` - this whole site is static, so the
// sitemap is generated once at build time, never per-request.
export const dynamic = "force-static";

/**
 * Static sitemap for the whole site - every region's main calculator page
 * plus its avalanche-vs-snowball page. Generated once at build time (this
 * is a static export, no per-request data here), so a new page only needs
 * adding to this list once it actually exists.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const regions = Object.values(REGIONS);

  const mainPages = regions.map((region) => ({
    url: `${SITE_URL}${region.path}`,
    priority: region.key === "default" ? 1 : 0.9,
  }));

  const multiDebtPages = regions.map((region) => ({
    url: `${SITE_URL}${region.path}avalanche-vs-snowball/`,
    priority: 0.7,
  }));

  return [...mainPages, ...multiDebtPages].map((entry) => ({
    url: entry.url,
    lastModified: new Date(),
    priority: entry.priority,
  }));
}
