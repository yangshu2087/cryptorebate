import { getTranslations } from "next-intl/server";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { TrackedInternalLink } from "@/components/analytics/tracked-internal-link";
import { Card, CardContent } from "@/components/ui/card";
import { ExchangeFilters } from "@/components/exchanges/exchange-filters";
import {
  getOpportunityQuestionGroupsForLocale,
  getTopOpportunityEntriesForLocale,
  getUnifiedSeoGuidesForLocale,
  getUnifiedSeoClusterLabels,
  getUnifiedSeoPageHref,
  getUnifiedSeoPageLabels,
  isSeoContentLocale,
} from "@/lib/automation/catalog";
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
  const geoGuides = seoLocale ? getUnifiedSeoGuidesForLocale(seoLocale) : [];
  const geoLabels = seoLocale ? getUnifiedSeoClusterLabels(seoLocale) : null;
  const topOpportunityEntries = seoLocale ? getTopOpportunityEntriesForLocale(seoLocale, 9) : [];
  const questionGroups = seoLocale ? getOpportunityQuestionGroupsForLocale(seoLocale, 8, 7) : [];
  const seoLinksByExchange = seoLocale
    ? Object.fromEntries(
        geoGuides.map((group) => [
          group.exchange.slug,
          group.guides.map((guide) => ({
            pageType: guide.pageType,
            primaryQuery: guide.primaryQuery,
            label: getUnifiedSeoPageLabels(seoLocale, guide.pageType).short,
            href: getUnifiedSeoPageHref(group.exchange.slug, guide.pageType),
          })),
        ])
      )
    : {};
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
            {questionGroups.map(({ pageType, guides }) => {
              const pageLabels = getUnifiedSeoPageLabels(seoLocale!, pageType);

              return (
                <Card key={pageType}>
                  <CardContent className="p-5">
                    <h3 className="font-semibold">{pageLabels.nav}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {pageLabels.question}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {guides.map((guide) => (
                        <TrackedInternalLink
                          key={`${guide.exchange.slug}-${pageType}`}
                          href={getUnifiedSeoPageHref(guide.exchange.slug, pageType)}
                          analytics={{
                            content_locale: locale,
                            content_exchange_slug: guide.exchange.slug,
                            content_page_type: pageType,
                            content_cluster: "exchange_geo",
                            content_primary_query: guide.primaryQuery,
                            hub_page_type: "exchange_list",
                            cta_target_type: pageType,
                          }}
                          className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-left text-xs font-medium transition-colors hover:border-brand/30 hover:text-brand"
                        >
                          {guide.primaryQuery}
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

      {seoLocale ? (
        <section className="mb-10">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold">Automated monetization queue</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                These are the highest-scoring pages generated from query, click, and
                projected revenue signals.
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {topOpportunityEntries.map((item) => (
                  <TrackedInternalLink
                    key={`${item.exchange.slug}:${item.pageType}`}
                    href={getUnifiedSeoPageHref(item.exchange.slug, item.pageType)}
                    analytics={{
                      content_locale: locale,
                      content_exchange_slug: item.exchange.slug,
                      content_page_type: item.pageType,
                      content_cluster: "autonomous_geo",
                      content_primary_query: item.primaryQuery,
                      hub_page_type: "exchange_list_autonomous",
                      cta_target_type: item.pageType,
                    }}
                    className="rounded-2xl border border-border/70 p-4 transition-colors hover:border-brand/30 hover:bg-muted/20"
                  >
                    <p className="text-sm font-semibold">
                      {item.primaryQuery}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.exchange.name} · {getUnifiedSeoPageLabels(seoLocale, item.pageType).short}
                    </p>
                    <p className="mt-3 text-sm font-medium text-brand">
                      Score {Math.round(item.opportunityScore ?? 0)} · {item.automationSource === "dynamic" ? "动态长尾" : "核心 GEO"}
                    </p>
                  </TrackedInternalLink>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      ) : null}

      <ExchangeFilters seoLinksByExchange={seoLinksByExchange} />
    </div>
  );
}
