export const FOCUS_SITEMAP_XML_PATH = "/focus-sitemap.xml";
export const FOCUS_SITEMAP_API_PATH = "/api/discovery/focus-sitemap";

export function getDiscoveryAssetRewrites() {
  return [
    {
      source: FOCUS_SITEMAP_XML_PATH,
      destination: FOCUS_SITEMAP_API_PATH,
    },
  ];
}
