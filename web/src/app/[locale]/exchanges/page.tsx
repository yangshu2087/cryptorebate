import { getTranslations } from "next-intl/server";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { TrackedInternalLink } from "@/components/analytics/tracked-internal-link";
import { Card, CardContent } from "@/components/ui/card";
import { ExchangeFilters } from "@/components/exchanges/exchange-filters";
import {
  SEO_PAGE_TYPES,
  getExchangeSeoGuidesForLocale,
  getExchangeSeoClusterLabels,
  getExchangeSeoPageHref,
  getExchangeSeoPageLabels,
  isSeoContentLocale,
} from "@/data/exchange-seo";
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
  const locale = useLocale();
  const t = useTranslations("exchanges");
  const seoLocale = isSeoContentLocale(locale) ? locale : null;
  const geoGuides = seoLocale ? getExchangeSeoGuidesForLocale(seoLocale) : [];
  const geoLabels = seoLocale ? getExchangeSeoClusterLabels(seoLocale) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold md:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      {geoLabels ? (
        <section className="mb-10 space-y-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold">{geoLabels.listHubTitle}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                {geoLabels.listHubSubtitle}
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {SEO_PAGE_TYPES.map((pageType) => {
              const pageLabels = getExchangeSeoPageLabels(seoLocale!, pageType);

              return (
                <Card key={pageType}>
                  <CardContent className="p-5">
                    <h3 className="font-semibold">{pageLabels.nav}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {pageLabels.question}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {geoGuides.map((group) => (
                        <TrackedInternalLink
                          key={`${group.exchange.slug}-${pageType}`}
                          href={getExchangeSeoPageHref(group.exchange.slug, pageType)}
                          analytics={{
                            content_locale: locale,
                            content_exchange_slug: group.exchange.slug,
                            content_page_type: pageType,
                            content_cluster: "exchange_geo",
                            content_primary_query:
                              group.guides.find((guide) => guide.pageType === pageType)
                                ?.primaryQuery,
                            hub_page_type: "exchange_list",
                            cta_target_type: pageType,
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:border-brand/30 hover:text-brand"
                        >
                          {group.exchange.name}
                          <ArrowRight className="h-3 w-3" />
                        </TrackedInternalLink>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      <ExchangeFilters />
    </div>
  );
}
