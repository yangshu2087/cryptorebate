import type { MetadataRoute } from "next";
import { DISCOVERY_SITEMAP_PATHS } from "@/lib/automation/discovery";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: DISCOVERY_SITEMAP_PATHS.map((path) => `${SITE_URL}${path}`),
  };
}
