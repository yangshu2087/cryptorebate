import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_LANGUAGE_TAGS,
  SITE_URL,
  type Locale,
} from "./constants";

function getLocalesSubset(locales?: readonly string[]) {
  if (!locales || locales.length === 0) {
    return LOCALES;
  }

  return locales;
}

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

export function getLocaleAlternates(
  pathname = "",
  locales?: readonly string[]
): Record<string, string> {
  const normalizedPathname = normalizePathname(pathname);
  const supportedLocales = getLocalesSubset(locales);
  const alternates = Object.fromEntries(
    supportedLocales.map((locale) => [
      locale,
      normalizedPathname ? `/${locale}${normalizedPathname}` : `/${locale}`,
    ])
  );

  return {
    ...alternates,
    "x-default": normalizedPathname
      ? `/${supportedLocales.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : supportedLocales[0]}${normalizedPathname}`
      : `/${supportedLocales.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : supportedLocales[0]}`,
  };
}

export function getLocaleAlternateUrls(
  pathname = "",
  locales?: readonly string[]
): Record<string, string> {
  const supportedLocales = getLocalesSubset(locales);
  const alternates = Object.fromEntries(
    supportedLocales.map((locale) => [locale, getLocalizedUrl(locale, pathname)])
  );

  return {
    ...alternates,
    "x-default": getLocalizedUrl(
      supportedLocales.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : supportedLocales[0],
      pathname
    ),
  };
}

export function getLocalizedUrl(locale: string, pathname = ""): string {
  const normalizedPathname = normalizePathname(pathname);
  return `${SITE_URL}/${locale}${normalizedPathname}`;
}
