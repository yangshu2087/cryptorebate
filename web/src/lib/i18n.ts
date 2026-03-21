import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_LANGUAGE_TAGS,
  SITE_URL,
  type Locale,
} from "./constants";

export function getLanguageTag(locale: string): string {
  return LOCALE_LANGUAGE_TAGS[locale as Locale] ?? LOCALE_LANGUAGE_TAGS[DEFAULT_LOCALE];
}

export function getOpenGraphLocale(locale: string): string {
  return getLanguageTag(locale).replace("-", "_");
}

function normalizePathname(pathname = ""): string {
  if (!pathname || pathname === "/") {
    return "";
  }

  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}

export function getLocaleAlternates(pathname = ""): Record<string, string> {
  const normalizedPathname = normalizePathname(pathname);
  const alternates = Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      normalizedPathname ? `/${locale}${normalizedPathname}` : `/${locale}`,
    ])
  );

  return {
    ...alternates,
    "x-default": normalizedPathname
      ? `/${DEFAULT_LOCALE}${normalizedPathname}`
      : `/${DEFAULT_LOCALE}`,
  };
}

export function getLocaleAlternateUrls(pathname = ""): Record<string, string> {
  const alternates = Object.fromEntries(
    LOCALES.map((locale) => [locale, getLocalizedUrl(locale, pathname)])
  );

  return {
    ...alternates,
    "x-default": getLocalizedUrl(DEFAULT_LOCALE, pathname),
  };
}

export function getLocalizedUrl(locale: string, pathname = ""): string {
  const normalizedPathname = normalizePathname(pathname);
  return `${SITE_URL}/${locale}${normalizedPathname}`;
}
