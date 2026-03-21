import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { ExchangeFilters } from "@/components/exchanges/exchange-filters";
import { getLocaleAlternates, getLocalizedUrl, getOpenGraphLocale } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = t("exchangesTitle");
  const description = t("exchangesDescription");
  return {
    title,
    description,
    alternates: {
      canonical: getLocalizedUrl(locale, "/exchanges"),
      languages: getLocaleAlternates("/exchanges"),
    },
    openGraph: {
      title,
      description,
      url: getLocalizedUrl(locale, "/exchanges"),
      locale: getOpenGraphLocale(locale),
      images: [
        {
          url: `/${locale}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      title,
      description,
      images: [`/${locale}/twitter-image`],
    },
  };
}

export default function ExchangesPage() {
  const t = useTranslations("exchanges");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold md:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>
      <ExchangeFilters />
    </div>
  );
}
