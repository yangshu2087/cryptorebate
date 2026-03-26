import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CopyButton } from "@/components/shared/copy-button";
import { ExchangeCard } from "@/components/exchanges/exchange-card";
import { TrackedInternalLink } from "@/components/analytics/tracked-internal-link";
import { TrackedExternalLink } from "@/components/analytics/tracked-external-link";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import {
  getExchangeOpportunityGuides,
  getUnifiedSeoClusterLabels,
  getUnifiedSeoEntriesForExchange,
  getUnifiedSeoPageHref,
  getUnifiedSeoPageLabels,
  isSeoContentLocale,
} from "@/lib/automation/catalog";
import { exchanges, getExchangeBySlug, getAllExchangeSlugs } from "@/data/exchanges";
import { getLocaleAlternates, getLocalizedUrl, getOpenGraphLocale } from "@/lib/i18n";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Check,
  X,
  Calendar,
  MapPin,
  BarChart3,
  Shield,
  Clock,
  AlertTriangle,
  Zap,
  Layers,
} from "lucide-react";
import type { Metadata } from "next";

export function generateStaticParams() {
  return getAllExchangeSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const exchange = getExchangeBySlug(slug);
  if (!exchange) return {};

  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("exchangeDetailTitle", { name: exchange.name }),
    description: t("exchangeDetailDescription", {
      name: exchange.name,
      rebate: exchange.spotRebate,
    }),
    alternates: {
      canonical: getLocalizedUrl(locale, `/exchanges/${slug}`),
      languages: getLocaleAlternates(`/exchanges/${slug}`),
    },
    openGraph: {
      title: t("exchangeDetailTitle", { name: exchange.name }),
      description: t("exchangeDetailDescription", {
        name: exchange.name,
        rebate: exchange.spotRebate,
      }),
      url: getLocalizedUrl(locale, `/exchanges/${slug}`),
      locale: getOpenGraphLocale(locale),
      images: [
        {
          url: `/${locale}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: t("exchangeDetailTitle", { name: exchange.name }),
        },
      ],
    },
    twitter: {
      title: t("exchangeDetailTitle", { name: exchange.name }),
      description: t("exchangeDetailDescription", {
        name: exchange.name,
        rebate: exchange.spotRebate,
      }),
      images: [`/${locale}/twitter-image`],
    },
  };
}

export default function ExchangeDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  // We need to use the sync version for the component body
  // but generateMetadata handles the async params
  return <ExchangeDetailContent params={params} />;
}

async function ExchangeDetailContent({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const exchange = getExchangeBySlug(slug);
  if (!exchange) notFound();

  return <ExchangeDetailView exchange={exchange} locale={locale} />;
}

function ExchangeDetailView({
  exchange,
  locale,
}: {
  exchange: NonNullable<ReturnType<typeof getExchangeBySlug>>;
  locale: string;
}) {
  const t = useTranslations();
  const slug = exchange.slug;
  const localizedBaseUrl = getLocalizedUrl(locale);

  const description = t(`exchanges.${slug}.description`);
  const pros = t.raw(`exchanges.${slug}.pros`) as string[];
  const cons = t.raw(`exchanges.${slug}.cons`) as string[];
  const bestFor = t(`exchanges.${slug}.bestFor`);
  const tutorial = t.raw(`exchanges.${slug}.tutorial`) as string[];
  const faq = t.raw(`exchanges.${slug}.faq`) as { q: string; a: string }[];
  const seoLocale = isSeoContentLocale(locale) ? locale : null;
  const geoGuides = seoLocale ? getUnifiedSeoEntriesForExchange(seoLocale, slug) : [];
  const opportunityGuides = seoLocale
    ? getExchangeOpportunityGuides(seoLocale, slug, 4, 6)
    : { featured: [], supporting: [] };
  const geoLabels = seoLocale ? getUnifiedSeoClusterLabels(seoLocale) : null;

  const relatedExchanges = exchanges
    .filter((e) => e.slug !== slug)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/exchanges"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("common.backToList")}
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-4">
          <Image
            src={exchange.logo}
            alt={exchange.name}
            width={56}
            height={56}
            className="rounded-xl"
          />
          <div>
            <h1 className="text-3xl font-bold">{exchange.name}</h1>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {exchange.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {t(`tags.${tag}`)}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
            <span className="text-xs text-muted-foreground">
              {t("exchanges.referralCode")}:
            </span>
            <code className="font-mono font-semibold">{exchange.referralCode}</code>
            <CopyButton
              text={exchange.referralCode}
              analytics={{
                exchange_slug: exchange.slug,
                locale,
                page_type: "exchange_detail_header",
              }}
            />
          </div>
          <TrackedExternalLink
            href={exchange.referralLink}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="inline-flex items-center gap-2 rounded-md bg-cta px-4 py-2 font-semibold text-black hover:bg-cta-hover transition-colors"
            analytics={{
              cta_type: "register",
              exchange_slug: exchange.slug,
              locale,
              page_type: "exchange_detail_header",
            }}
          >
            {t("exchanges.register")}
            <ExternalLink className="h-4 w-4" />
          </TrackedExternalLink>
        </div>
      </div>

      {/* Info Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{t("exchanges.founded")} {exchange.founded}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{exchange.headquarters}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BarChart3 className="h-4 w-4" />
          <span>{exchange.tradingPairs.toLocaleString()} {t("exchanges.tradingPairs")}</span>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Description */}
      <p className="text-base leading-relaxed text-muted-foreground">{description}</p>

      {geoLabels && geoGuides.length > 0 ? (
        <section className="mt-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">{geoLabels.detailHubTitle}</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              {geoLabels.detailHubSubtitle}
            </p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {(opportunityGuides.featured.length ? opportunityGuides.featured : geoGuides.slice(0, 4)).map((guide) => {
              const labels = getUnifiedSeoPageLabels(seoLocale!, guide.pageType);

              return (
                <TrackedInternalLink
                  key={guide.pageType}
                  href={getUnifiedSeoPageHref(exchange.slug, guide.pageType)}
                  analytics={{
                    content_locale: locale,
                    content_exchange_slug: exchange.slug,
                    content_page_type: guide.pageType,
                    content_cluster: "exchange_geo",
                    content_primary_query: guide.primaryQuery,
                    hub_page_type: "exchange_detail",
                    cta_target_type: guide.pageType,
                  }}
                  className="block rounded-2xl border border-border/70 bg-background p-5 transition-colors hover:border-brand/30 hover:bg-muted/20"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{labels.nav}</p>
                    <Badge variant="outline">每日刷新推荐</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {guide.answerBox.body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand">
                    {labels.short}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </TrackedInternalLink>
              );
            })}
          </div>
          {opportunityGuides.supporting.length ? (
            <div className="mt-4 rounded-2xl border border-border/70 bg-muted/20 p-5">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">更多高意图问题</h3>
                <p className="text-sm text-muted-foreground">
                  这些链接由 daily_internal_link_refresh 按机会分数、点击与收益倾向补位，不只是默认排序。
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {opportunityGuides.supporting.map((guide) => {
                  const labels = getUnifiedSeoPageLabels(seoLocale!, guide.pageType);
                  return (
                    <TrackedInternalLink
                      key={`support-${guide.pageType}`}
                      href={getUnifiedSeoPageHref(exchange.slug, guide.pageType)}
                      analytics={{
                        content_locale: locale,
                        content_exchange_slug: exchange.slug,
                        content_page_type: guide.pageType,
                        content_cluster: "exchange_geo_supporting",
                        content_primary_query: guide.primaryQuery,
                        hub_page_type: "exchange_detail_supporting",
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
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Rebate Info */}
      <Card className="mt-8 border-brand/20">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold">{t("exchanges.rebateRate")}</h2>
          <div className="mt-4 grid grid-cols-2 gap-6">
            <div>
              <span className="text-sm text-muted-foreground">
                {t("exchanges.spotRebate")}
              </span>
              <p className="mt-1 text-3xl font-bold text-brand">
                {exchange.spotRebate}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                {t("exchanges.futuresRebate")}
              </span>
              <p className="mt-1 text-3xl font-bold text-brand">
                {exchange.futuresRebate}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Info */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold">{t("exchanges.quickInfo")}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div>
                <span className="text-sm font-medium">{t("exchanges.regionRestrictions")}</span>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {exchange.regionRestrictions.length > 0
                    ? exchange.regionRestrictions.join(", ")
                    : t("exchanges.noRestrictions")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <div>
                <span className="text-sm font-medium">{t("exchanges.kycDifficulty")}</span>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {exchange.kycDifficulty === "easy"
                    ? t("exchanges.kycEasy")
                    : exchange.kycDifficulty === "moderate"
                      ? t("exchanges.kycModerate")
                      : t("exchanges.kycStrict")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              <div>
                <span className="text-sm font-medium">{t("exchanges.rebateActivation")}</span>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {exchange.rebateAutoActivate
                    ? t("exchanges.rebateAutoYes")
                    : t("exchanges.rebateAutoNo")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-purple-500" />
              <div>
                <span className="text-sm font-medium">{t("exchanges.rebateSettlement")}</span>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {exchange.rebateSettlement === "instant"
                    ? t("exchanges.settlementInstant")
                    : t("exchanges.settlementDaily")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Layers className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
              <div>
                <span className="text-sm font-medium">{t("exchanges.platformTokenStack")}</span>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {exchange.platformTokenStacking && exchange.fees.tokenName
                    ? t("exchanges.tokenStackYes", { token: exchange.fees.tokenName })
                    : t("exchanges.tokenStackNo")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
              <div>
                <span className="text-sm font-medium">{t("exchanges.lastReviewed")}</span>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {exchange.lastReviewed}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Table */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold">{t("exchanges.spotFees")} & {t("exchanges.futuresFees")}</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-2 text-left font-medium"></th>
                  <th className="pb-2 text-center font-medium">{t("exchanges.maker")}</th>
                  <th className="pb-2 text-center font-medium">{t("exchanges.taker")}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 font-medium">{t("exchanges.spotFees")}</td>
                  <td className="py-3 text-center">{(exchange.fees.spotMaker * 100).toFixed(2)}%</td>
                  <td className="py-3 text-center">{(exchange.fees.spotTaker * 100).toFixed(2)}%</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">{t("exchanges.futuresFees")}</td>
                  <td className="py-3 text-center">{(exchange.fees.futuresMaker * 100).toFixed(3)}%</td>
                  <td className="py-3 text-center">{(exchange.fees.futuresTaker * 100).toFixed(3)}%</td>
                </tr>
              </tbody>
            </table>
            {exchange.fees.tokenName && (
              <p className="mt-3 text-xs text-muted-foreground">
                * {t("exchanges.tokenDiscount", { token: exchange.fees.tokenName, percent: String(((exchange.fees.tokenDiscount || 0) * 100).toFixed(0)) })}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pros & Cons */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-green-500">{t("exchanges.pros")}</h3>
            <ul className="mt-3 space-y-2">
              {pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-red-500">{t("exchanges.cons")}</h3>
            <ul className="mt-3 space-y-2">
              {cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Best For */}
      <Card className="mt-6 bg-brand/5 border-brand/20">
        <CardContent className="p-5">
          <p className="text-sm font-medium">{bestFor}</p>
        </CardContent>
      </Card>

      {/* Tutorial */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">
          {t("exchanges.registrationGuide", { name: exchange.name })}
        </h2>
        <div className="mt-4 space-y-3">
          {tutorial.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-white text-xs font-bold">
                {i + 1}
              </div>
              <p className="pt-0.5 text-sm leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
        <TrackedExternalLink
          href={exchange.referralLink}
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-cta px-6 py-2.5 font-semibold text-black hover:bg-cta-hover transition-colors"
          analytics={{
            cta_type: "register",
            exchange_slug: exchange.slug,
            locale,
            page_type: "exchange_detail_guide",
          }}
        >
          {t("exchanges.register")} {exchange.name}
          <ExternalLink className="h-4 w-4" />
        </TrackedExternalLink>
      </section>

      {/* FAQ */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">{t("exchanges.faqTitle")}</h2>
        <Accordion className="mt-4">
          {faq.map((item, i) => (
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
      </section>

      {/* Related Exchanges */}
      <section className="mt-12">
        <h2 className="mb-4 text-xl font-bold">
          {t("common.relatedExchanges")}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {relatedExchanges.map((ex) => (
            <ExchangeCard
              key={ex.slug}
              exchange={ex}
              pageType="exchange_detail_related"
            />
          ))}
        </div>
      </section>

      <FAQJsonLd locale={locale} items={faq} />
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: t("nav.home"), url: localizedBaseUrl },
          { name: t("nav.exchanges"), url: `${localizedBaseUrl}/exchanges` },
          { name: exchange.name, url: `${localizedBaseUrl}/exchanges/${exchange.slug}` },
        ]}
      />
    </div>
  );
}
