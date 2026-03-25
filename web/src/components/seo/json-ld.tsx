import { DEFAULT_LOCALE, SITE_NAME, SITE_URL } from "@/lib/constants";
import { getLanguageTag, getLocalizedUrl } from "@/lib/i18n";

interface FAQItem {
  q: string;
  a: string;
}

interface HowToStep {
  name: string;
  text?: string;
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

export function WebPageJsonLd({
  locale,
  name,
  description,
  url,
}: {
  locale?: string;
  name: string;
  description?: string;
  url: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url,
    inLanguage: getLanguageTag(locale ?? DEFAULT_LOCALE),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function HowToJsonLd({
  locale,
  name,
  description,
  url,
  steps,
}: {
  locale?: string;
  name: string;
  description?: string;
  url: string;
  steps: HowToStep[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    url,
    inLanguage: getLanguageTag(locale ?? DEFAULT_LOCALE),
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text ?? step.name,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
