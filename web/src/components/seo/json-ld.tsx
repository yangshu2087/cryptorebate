import { DEFAULT_LOCALE, SITE_NAME, SITE_URL } from "@/lib/constants";
import { getLanguageTag, getLocalizedUrl } from "@/lib/i18n";

interface FAQItem {
  q: string;
  a: string;
}

export function WebsiteJsonLd({
  locale,
  description,
}: {
  locale: string;
  description?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: getLocalizedUrl(locale),
    description,
    inLanguage: getLanguageTag(locale),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd({
  locale,
  description,
  tagline,
}: {
  locale?: string;
  description?: string;
  tagline?: string;
} = {}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/brand/cryptorebate-mark.svg`,
    description,
    slogan: tagline,
    inLanguage: getLanguageTag(locale ?? DEFAULT_LOCALE),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function FAQJsonLd({
  locale,
  items,
}: {
  locale?: string;
  items: FAQItem[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: getLanguageTag(locale ?? DEFAULT_LOCALE),
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({
  locale,
  items,
}: {
  locale?: string;
  items: { name: string; url: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    inLanguage: getLanguageTag(locale ?? DEFAULT_LOCALE),
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
