export function rewriteXDefaultAlternateLinkHeader(
  headerValue: string | null,
  defaultLocale: string
) {
  if (!headerValue) {
    return headerValue;
  }

  return headerValue
    .split(/,\s*(?=<)/)
    .map((entry) => {
      if (!entry.includes('hreflang="x-default"')) {
        return entry;
      }

      const match = entry.match(/^<([^>]+)>(.*)$/);
      if (!match) {
        return entry;
      }

      const [, rawUrl, suffix] = match;

      try {
        const url = new URL(rawUrl);
        const localePrefix = `/${defaultLocale}`;
        const pathname =
          url.pathname === "/"
            ? localePrefix
            : url.pathname.startsWith(localePrefix)
              ? url.pathname
              : `${localePrefix}${url.pathname}`;
        url.pathname = pathname;
        return `<${url.toString()}>${suffix}`;
      } catch {
        return entry;
      }
    })
    .join(", ");
}
