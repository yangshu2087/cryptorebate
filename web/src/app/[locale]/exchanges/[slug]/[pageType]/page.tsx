import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FileText,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "@/components/shared/copy-button";
import { TrackedExternalLink } from "@/components/analytics/tracked-external-link";
import { TrackedInternalLink } from "@/components/analytics/tracked-internal-link";
import {
  BreadcrumbJsonLd,
  FAQJsonLd,
  HowToJsonLd,
  WebPageJsonLd,
} from "@/components/seo/json-ld";
import {
  SEO_CONTENT_LOCALES,
  getUnifiedSeoClusterLabels,
  getUnifiedSeoEntriesForExchange,
  getUnifiedSeoEntry,
  getUnifiedSeoPageHref,
  getUnifiedSeoPageLabels,
  getUnifiedSeoStaticParams,
  isSeoContentLocale,
} from "@/lib/automation/catalog";
import { getLocaleAlternates, getLocalizedUrl, getOpenGraphLocale } from "@/lib/i18n";

export function generateStaticParams() {
  return getUnifiedSeoStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string; pageType: string }>;
}): Promise<Metadata> {
  const { locale, slug, pageType } = await params;
  const entry = getUnifiedSeoEntry(locale, slug, pageType);

  if (!entry) {
    return {};
  }

  const pathname = getUnifiedSeoPageHref(slug, entry.pageType);

  return {
    title: entry.metadata.title,
    description: entry.metadata.description,
    keywords: entry.metadata.keywords,
    alternates: {
      canonical: getLocalizedUrl(locale, pathname),
      languages: getLocaleAlternates(pathname, SEO_CONTENT_LOCALES),
    },
    openGraph: {
      title: entry.metadata.title,
      description: entry.metadata.description,
      url: getLocalizedUrl(locale, pathname),
      locale: getOpenGraphLocale(locale),
      images: [
        {
          url: `/${locale}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: entry.metadata.title,
        },
      ],
    },
    twitter: {
      title: entry.metadata.title,
      description: entry.metadata.description,
      images: [`/${locale}/twitter-image`],
    },
  };
}

export default async function ExchangeSeoPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; pageType: string }>;
}) {
  const { locale, slug, pageType } = await params;
  const entry = getUnifiedSeoEntry(locale, slug, pageType);

  if (!entry || !isSeoContentLocale(locale)) {
    notFound();
  }

  const seoLocale = locale;
  const t = await getTranslations({ locale });
  const clusterLabels = getUnifiedSeoClusterLabels(seoLocale);
  const pageLabels = getUnifiedSeoPageLabels(seoLocale, entry.pageType);
  const siblingEntries = getUnifiedSeoEntriesForExchange(seoLocale, slug).filter(
    (item) => item.pageType !== entry.pageType
  );
  const pageUrl = getLocalizedUrl(locale, getUnifiedSeoPageHref(slug, entry.pageType));
  const hubUrl = getLocalizedUrl(locale, `/exchanges/${slug}`);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <TrackedInternalLink
        href={`/exchanges/${slug}`}
        analytics={{
          content_locale: locale,
          content_exchange_slug: slug,
          content_page_type: entry.pageType,
          content_cluster: "exchange_geo",
          content_primary_query: entry.primaryQuery,
          hub_page_type: "exchange_detail",
          cta_target_type: "exchange_hub",
        }}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {clusterLabels.backToHub}
      </TrackedInternalLink>

      <section className="rounded-[2rem] border border-border/70 bg-background px-6 py-8 shadow-sm md:px-8 md:py-10">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-semibold">
            {entry.exchange.name}
          </Badge>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-semibold">
            {pageLabels.nav}
          </Badge>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
            {clusterLabels.reviewed}: {entry.lastReviewed}
          </Badge>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)]">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {entry.heroTitle}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {entry.heroDescription}
            </p>

            <Card className="mt-6 border-brand/20 bg-brand/[0.04]">
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-brand">
                  {clusterLabels.answerTitle}
                </p>
                <h2 className="mt-1 text-lg font-semibold">{entry.answerBox.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {entry.answerBox.body}
                </p>
                <ul className="mt-4 space-y-2">
                  {entry.answerBox.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <TrackedExternalLink
                href={entry.cta.href ?? entry.exchange.referralLink}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                analytics={{
                  content_locale: locale,
                  content_exchange_slug: slug,
                  content_page_type: entry.pageType,
                  content_cluster: "exchange_geo",
                  content_primary_query: entry.primaryQuery,
                  cta_target_type: "external_referral",
                }}
              >
                {entry.cta.label}
                <ExternalLink className="h-4 w-4" />
              </TrackedExternalLink>
              <div className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-3 text-sm">
                <span className="font-mono font-semibold">{entry.exchange.referralCode}</span>
                <CopyButton
                  text={entry.exchange.referralCode}
                  analytics={{
                    content_locale: locale,
                    content_exchange_slug: slug,
                    content_page_type: entry.pageType,
                    content_cluster: "exchange_geo",
                    content_primary_query: entry.primaryQuery,
                    cta_target_type: "copy_invite_code",
                  }}
                />
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{entry.cta.helperText}</p>
          </div>

          <Card className="h-fit border-border/70">
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand" />
                <h2 className="text-sm font-semibold">{clusterLabels.factCardTitle}</h2>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                {entry.factCard.map((item) => (
                  <div
                    key={`${item.label}-${item.value}`}
                    className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 last:border-b-0 last:pb-0"
                  >
                    <dt className="text-muted-foreground">{item.label}</dt>
                    <dd className="text-right font-medium">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          {entry.sections.map((section) => (
            <Card key={section.title}>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {section.body}
                </p>
                {section.bullets?.length ? (
                  <ul className="mt-4 space-y-2">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand" />
                <h2 className="text-lg font-semibold">{clusterLabels.fitTitle}</h2>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium">{clusterLabels.goodFor}</p>
                <ul className="mt-3 space-y-2">
                  {entry.fit.goodFor.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-5">
                <p className="text-sm font-medium">{clusterLabels.notIdealFor}</p>
                <ul className="mt-3 space-y-2">
                  {entry.fit.notIdealFor.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">{clusterLabels.moreGuidesTitle}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {clusterLabels.detailHubSubtitle}
              </p>
              <div className="mt-4 space-y-3">
                {siblingEntries.map((item) => {
                  const labels = getUnifiedSeoPageLabels(seoLocale, item.pageType);
                  return (
                    <TrackedInternalLink
                      key={item.pageType}
                      href={getUnifiedSeoPageHref(slug, item.pageType)}
                      analytics={{
                        content_locale: locale,
                        content_exchange_slug: slug,
                        content_page_type: entry.pageType,
                        content_cluster: "exchange_geo",
                        content_primary_query: entry.primaryQuery,
                        hub_page_type: "exchange_geo",
                        cta_target_type: item.pageType,
                      }}
                      className="block rounded-2xl border border-border/70 p-4 transition-colors hover:border-brand/40 hover:bg-muted/20"
                    >
                      <p className="text-sm font-semibold">{labels.nav}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.answerBox.body}
                      </p>
                    </TrackedInternalLink>
                  );
                })}

                <TrackedInternalLink
                  href={`/exchanges/${slug}`}
                  analytics={{
                    content_locale: locale,
                    content_exchange_slug: slug,
                    content_page_type: entry.pageType,
                    content_cluster: "exchange_geo",
                    content_primary_query: entry.primaryQuery,
                    hub_page_type: "exchange_geo",
                    cta_target_type: "exchange_hub",
                  }}
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                >
                  {clusterLabels.viewHub}
                  <ArrowRight className="h-4 w-4" />
                </TrackedInternalLink>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">{clusterLabels.faqTitle}</h2>
        <Accordion className="mt-4 rounded-2xl border border-border/70 px-5 py-2">
          {entry.faq.map((item, index) => (
            <AccordionItem key={item.q} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-sm font-medium">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-7 text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <WebPageJsonLd
        locale={locale}
        name={entry.metadata.title}
        description={entry.metadata.description}
        url={pageUrl}
      />
      <FAQJsonLd locale={locale} items={entry.faq} />
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: t("nav.home"), url: getLocalizedUrl(locale) },
          { name: t("nav.exchanges"), url: getLocalizedUrl(locale, "/exchanges") },
          { name: entry.exchange.name, url: hubUrl },
          { name: pageLabels.nav, url: pageUrl },
        ]}
      />
      {(entry.pageType === "signup-kyc" || entry.pageType === "app-download") &&
      entry.howToSteps?.length ? (
        <HowToJsonLd
          locale={locale}
          name={entry.heroTitle}
          description={entry.heroDescription}
          url={pageUrl}
          steps={entry.howToSteps.map((step) => ({ name: step }))}
        />
      ) : null}
    </div>
  );
}
