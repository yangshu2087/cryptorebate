import type { Metadata } from "next";
import { getLocaleAlternateUrls } from "./i18n";

export function getPageAlternates(
  pathname = "",
  locales?: readonly string[]
): Record<string, string> {
  return getLocaleAlternateUrls(pathname, locales);
}

export function getSiteIconsMetadata(): NonNullable<Metadata["icons"]> {
  return {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  };
}
