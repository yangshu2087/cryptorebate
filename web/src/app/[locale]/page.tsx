import { useLocale, useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { TrackedInternalLink } from "@/components/analytics/tracked-internal-link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, Shield, BarChart3, Globe, RefreshCw, Users, TrendingUp, Percent, Coins } from "lucide-react";
import {
  getAutomationAlerts,
  getTopAutomationOpportunities,
  getTopAutomationRoiPages,
  getUnifiedSeoClusterLabels,
  getUnifiedSeoGuidesForLocale,
  getUnifiedSeoPageHref,
  getUnifiedSeoPageLabels,
  isSeoContentLocale,
} from "@/lib/automation/catalog";
import { exchanges } from "@/data/exchanges";
import { ExchangeCard } from "@/components/exchanges/exchange-card";
import { SavingsEstimator } from "@/components/home/savings-estimator";
import { FAQJsonLd } from "@/components/seo/json-ld";
import { TrackedExternalLink } from "@/components/analytics/tracked-external-link";
import { getLocaleAlternates, getLocalizedUrl, getOpenGraphLocale } from "@/lib/i18n";
import { SITE_NAME } from "@/lib/constants";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("homeTitle"),
    description: t("siteDescription"),
    alternates: {
      canonical: getLocalizedUrl(locale),
      languages: getLocaleAlternates(),
    },
    openGraph: {
      title: t("homeTitle"),
      description: t("siteDescription"),
      siteName: SITE_NAME,
      url: getLocalizedUrl(locale),
      locale: getOpenGraphLocale(locale),
      images: [
        {
          url: `/${locale}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: t("homeTitle"),
        },
      ],
    },
    twitter: {
      title: t("homeTitle"),
      description: t("siteDescription"),
      images: [`/${locale}/twitter-image`],
    },
  };
}

export default function HomePage() {
  const locale = useLocale();
  const t = useTranslations("home");
  const sortedExchanges = [...exchanges].sort((a, b) => a.order - b.order);
  const seoLocale = isSeoContentLocale(locale) ? locale : null;
  const geoGuides = seoLocale ? getUnifiedSeoGuidesForLocale(seoLocale) : [];
  const geoLabels = seoLocale ? getUnifiedSeoClusterLabels(seoLocale) : null;
  const topOpportunities = seoLocale ? getTopAutomationOpportunities(seoLocale, 6) : [];
  const topRoiPages = seoLocale ? getTopAutomationRoiPages(seoLocale, 6) : [];
  const automationAlerts = seoLocale ? getAutomationAlerts(seoLocale, 4) : [];

  const whyItems = [
    { icon: Shield, titleKey: "why1Title" as const, descKey: "why1Desc" as const },
    { icon: BarChart3, titleKey: "why2Title" as const, descKey: "why2Desc" as const },
    { icon: Globe, titleKey: "why3Title" as const, descKey: "why3Desc" as const },
    { icon: RefreshCw, titleKey: "why4Title" as const, descKey: "why4Desc" as const },
  ];

  const faqItems = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
    { q: t("faq4Q"), a: t("faq4A") },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="relative py-16 text-center md:py-24 lg:py-28">
        <div className="absolute inset-x-0 top-8 -z-10 mx-auto h-56 max-w-4xl rounded-[3rem] bg-[radial-gradient(circle_at_center,rgba(0,102,255,0.12),transparent_62%)] blur-3xl" />
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-border/60 bg-background/70 px-6 py-10 shadow-sm backdrop-blur-sm md:px-10 md:py-14">
          <div className="mx-auto inline-flex items-center rounded-full border border-brand/15 bg-brand/8 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand md:text-sm">
            {t("heroBadge")}
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("heroSubtitle")}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href="/exchanges" className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-base font-medium text-white shadow-[0_10px_30px_rgba(0,102,255,0.22)] transition-colors hover:bg-brand-dark">
              {t("ctaBrowse")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/calculator" className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-6 py-3 text-base font-medium transition-colors hover:bg-accent">
              {t("ctaCalculator")}
            </Link>
          </div>
          <div className="mx-auto mt-7 max-w-3xl rounded-2xl border border-border/60 bg-muted/30 px-4 py-4 text-left md:px-5">
            <p className="text-sm font-semibold text-foreground md:text-[15px]">
              {t("brandCardSubtitle")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("brandCardDescription")}
            </p>
          </div>
        </div>
      </section>

      {/* Savings Estimator */}
      <section className="pb-16">
        <SavingsEstimator />
      </section>

      {/* Featured Exchanges */}
      <section className="pb-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">{t("featuredTitle")}</h2>
          <p className="mt-2 text-muted-foreground">{t("featuredSubtitle")}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedExchanges.map((exchange) => (
            <ExchangeCard
              key={exchange.slug}
              exchange={exchange}
              pageType="home_featured"
            />
          ))}
        </div>
      </section>

      {geoLabels ? (
        <>
          <section className="pb-16">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold md:text-3xl">{geoLabels.geoHubTitle}</h2>
              <p className="mt-2 text-muted-foreground">{geoLabels.geoHubSubtitle}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {geoGuides.map((group) => (
                <Card key={group.exchange.slug} className="border-border/70">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">{group.exchange.name}</h3>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                          {group.guides[0]?.answerBox.body}
                        </p>
                      </div>
                      <div className="shrink-0 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                        {group.exchange.spotRebate}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {group.guides.map((guide) => {
                        const labels = getUnifiedSeoPageLabels(seoLocale!, guide.pageType);

                        return (
                          <TrackedInternalLink
                            key={guide.pageType}
                            href={getUnifiedSeoPageHref(group.exchange.slug, guide.pageType)}
                            analytics={{
                              content_locale: locale,
                              content_exchange_slug: group.exchange.slug,
                              content_page_type: guide.pageType,
                              content_cluster: "exchange_geo",
                              content_primary_query: guide.primaryQuery,
                              hub_page_type: "home",
                              cta_target_type: guide.pageType,
                            }}
                            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:border-brand/30 hover:text-brand"
                          >
                            {labels.short}
                            <ArrowRight className="h-3 w-3" />
                          </TrackedInternalLink>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="pb-16">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold md:text-3xl">
                {geoLabels.browseByQuestionTitle}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {geoLabels.browseByQuestionSubtitle}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from(new Set(geoGuides.flatMap((group) => group.guides.map((guide) => guide.pageType)))).map((pageType) => {
                const pageLabels = getUnifiedSeoPageLabels(seoLocale!, pageType);

                return (
                  <Card key={pageType} className="border-border/70">
                    <CardContent className="p-5">
                      <h3 className="font-semibold">{pageLabels.nav}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {pageLabels.question}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {geoGuides.map((group) => {
                          const guide = group.guides.find((item) => item.pageType === pageType);
                          if (!guide) return null;

                          return (
                            <TrackedInternalLink
                              key={`${group.exchange.slug}-${pageType}`}
                              href={getUnifiedSeoPageHref(group.exchange.slug, pageType)}
                              analytics={{
                                content_locale: locale,
                                content_exchange_slug: group.exchange.slug,
                                content_page_type: pageType,
                                content_cluster: "exchange_geo",
                                content_primary_query: guide.primaryQuery,
                                hub_page_type: "home_question_hub",
                                cta_target_type: pageType,
                              }}
                              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:border-brand/30 hover:text-brand"
                            >
                              {group.exchange.name}
                              <ArrowRight className="h-3 w-3" />
                            </TrackedInternalLink>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        </>
      ) : null}

      {seoLocale ? (
        <section className="pb-16">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              Autonomous SEO / GEO opportunity queue
            </h2>
            <p className="mt-2 text-muted-foreground">
              Query signals, projected revenue, and high-intent landing paths are scored
              and published automatically across all locales.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border/70">
              <CardContent className="p-5">
                <h3 className="text-lg font-semibold">Top opportunity pages</h3>
                <div className="mt-4 space-y-3">
                  {topOpportunities.map((item) => (
                    <TrackedInternalLink
                      key={item.id}
                      href={getUnifiedSeoPageHref(item.exchangeSlug, item.pageType)}
                      analytics={{
                        content_locale: locale,
                        content_exchange_slug: item.exchangeSlug,
                        content_page_type: item.pageType,
                        content_cluster: "autonomous_geo",
                        content_primary_query: item.primaryQuery,
                        hub_page_type: "home_autonomous_opportunity",
                        cta_target_type: item.pageType,
                      }}
                      className="block rounded-2xl border border-border/70 p-4 transition-colors hover:border-brand/30 hover:bg-muted/20"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">
                            {item.exchangeSlug} · {getUnifiedSeoPageLabels(seoLocale, item.pageType).nav}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">{item.primaryQuery}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-semibold text-brand">{item.score}</p>
                          <p className="text-muted-foreground">${item.projectedMonthlyRevenueUsd}/mo</p>
                        </div>
                      </div>
                    </TrackedInternalLink>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-5">
                <h3 className="text-lg font-semibold">Top ROI pages</h3>
                <div className="mt-4 space-y-3">
                  {topRoiPages.map((item) => (
                    <TrackedInternalLink
                      key={item.id}
                      href={getUnifiedSeoPageHref(item.exchangeSlug, item.pageType)}
                      analytics={{
                        content_locale: locale,
                        content_exchange_slug: item.exchangeSlug,
                        content_page_type: item.pageType,
                        content_cluster: "autonomous_geo",
                        content_primary_query: item.primaryQuery,
                        hub_page_type: "home_autonomous_roi",
                        cta_target_type: item.pageType,
                      }}
                      className="block rounded-2xl border border-border/70 p-4 transition-colors hover:border-brand/30 hover:bg-muted/20"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">
                            {item.exchangeSlug} · {item.primaryQuery}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {getUnifiedSeoPageLabels(seoLocale, item.pageType).nav}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-semibold text-brand">${item.commissionsUsd}</p>
                          <p className="text-muted-foreground">EPC ${item.epcUsd}</p>
                        </div>
                      </div>
                    </TrackedInternalLink>
                  ))}
                </div>
                {automationAlerts.length > 0 ? (
                  <div className="mt-5 rounded-2xl border border-amber-300/50 bg-amber-50/70 p-4 text-sm dark:border-amber-600/40 dark:bg-amber-950/20">
                    <p className="font-semibold">Automation alerts</p>
                    <ul className="mt-2 space-y-1.5 text-muted-foreground">
                      {automationAlerts.map((alert) => (
                        <li key={alert.id}>• {alert.message}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </section>
      ) : null}

      {/* Why Choose Us */}
      <section className="pb-16">
        <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">
          {t("whyTitle")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {whyItems.map((item) => (
            <Card key={item.titleKey}>
              <CardContent className="p-5">
                <item.icon className="h-8 w-8 text-brand" />
                <h3 className="mt-3 font-semibold">{t(item.titleKey)}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {t(item.descKey)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Exchange Comparison Table */}
      <section className="pb-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">{t("comparisonTitle")}</h2>
          <p className="mt-2 text-muted-foreground">{t("comparisonSubtitle")}</p>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">{t("comparisonExchange")}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">{t("comparisonSpotFee")}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">{t("comparisonFuturesFee")}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">{t("comparisonRebate")}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">{t("comparisonPairs")}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">{t("comparisonKYC")}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedExchanges.map((exchange) => (
                    <tr key={exchange.slug} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="whitespace-nowrap px-4 py-3 font-medium">{exchange.name}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {(exchange.fees.spotTaker * 100).toFixed(2)}%
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {(exchange.fees.futuresTaker * 100).toFixed(3)}%
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-brand">
                        {exchange.spotRebate}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {exchange.tradingPairs.toLocaleString()}+
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {exchange.kyc === "required" ? t("kycRequired") : t("kycOptional")}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <TrackedExternalLink
                          href={exchange.referralLink}
                          target="_blank"
                          rel="noopener noreferrer nofollow sponsored"
                          className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark transition-colors"
                          analytics={{
                            cta_type: "comparison_action",
                            exchange_slug: exchange.slug,
                            locale,
                            page_type: "home_comparison_table",
                          }}
                        >
                          {t("comparisonAction")}
                          <ArrowRight className="h-3 w-3" />
                        </TrackedExternalLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Who Is This For — Persona Paths */}
      <section className="pb-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">{t("personaTitle")}</h2>
          <p className="mt-2 text-muted-foreground">{t("personaSubtitle")}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Beginners */}
          <Card>
            <CardContent className="p-5">
              <Users className="h-8 w-8 text-brand" />
              <h3 className="mt-3 font-semibold">{t("persona1Title")}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {t("persona1Desc")}
              </p>
              <p className="mt-3 text-sm font-medium">{t("persona1Recommend")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/exchanges/binance" className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
                  Binance <ArrowRight className="h-3 w-3" />
                </Link>
                <Link href="/exchanges/kucoin" className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
                  KuCoin <ArrowRight className="h-3 w-3" />
                </Link>
                <Link href="/exchanges/bitget" className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
                  Bitget <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Futures Traders */}
          <Card>
            <CardContent className="p-5">
              <TrendingUp className="h-8 w-8 text-brand" />
              <h3 className="mt-3 font-semibold">{t("persona2Title")}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {t("persona2Desc")}
              </p>
              <p className="mt-3 text-sm font-medium">{t("persona2Recommend")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/exchanges/bybit" className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
                  Bybit <ArrowRight className="h-3 w-3" />
                </Link>
                <Link href="/exchanges/okx" className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
                  OKX <ArrowRight className="h-3 w-3" />
                </Link>
                <Link href="/exchanges/huobi" className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
                  Huobi <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* High Rebate Seekers */}
          <Card>
            <CardContent className="p-5">
              <Percent className="h-8 w-8 text-brand" />
              <h3 className="mt-3 font-semibold">{t("persona3Title")}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {t("persona3Desc")}
              </p>
              <p className="mt-3 text-sm font-medium">{t("persona3Recommend")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/exchanges/kucoin" className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
                  KuCoin <ArrowRight className="h-3 w-3" />
                </Link>
                <Link href="/exchanges/bybit" className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
                  Bybit <ArrowRight className="h-3 w-3" />
                </Link>
                <Link href="/exchanges/huobi" className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
                  Huobi <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Altcoin Hunters */}
          <Card>
            <CardContent className="p-5">
              <Coins className="h-8 w-8 text-brand" />
              <h3 className="mt-3 font-semibold">{t("persona4Title")}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {t("persona4Desc")}
              </p>
              <p className="mt-3 text-sm font-medium">{t("persona4Recommend")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/exchanges/gate" className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
                  Gate.io <ArrowRight className="h-3 w-3" />
                </Link>
                <Link href="/exchanges/kucoin" className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
                  KuCoin <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-20">
        <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">
          {t("faqTitle")}
        </h2>
        <div className="mx-auto max-w-3xl">
          <Accordion>
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <FAQJsonLd locale={locale} items={faqItems} />
    </div>
  );
}
