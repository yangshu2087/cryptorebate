import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";
import { TrackedInternalLink } from "@/components/analytics/tracked-internal-link";
import { TrackedExternalLink } from "@/components/analytics/tracked-external-link";
import { BreadcrumbJsonLd, FAQJsonLd, WebPageJsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BRAND_TOPICS, buildBrandPages, type BrandSeoPage } from "@/lib/automation/brand-pages";
import { getLatestAutomationSnapshotFromDb, getBrandPageFromDb } from "@/lib/automation/db-store";
import { getAutomationState } from "@/lib/automation/catalog";
import { getLocalizedUrl, getOpenGraphLocale } from "@/lib/i18n";
import { getPageAlternates } from "@/lib/metadata";
import { SITE_NAME } from "@/lib/constants";

export const dynamicParams = true;
export const revalidate = 3600;

type BrandPageParams = {
  locale: string;
  topic: string;
};

export function generateStaticParams() {
  const locales = Array.from(new Set(getAutomationState().pages.map((page) => page.locale)));
  return locales.flatMap((locale) =>
    BRAND_TOPICS.map((topic) => ({
      locale,
      topic,
    }))
  );
}

async function getBrandPage(locale: string, topic: string): Promise<BrandSeoPage | null> {
  const dbPage = await getBrandPageFromDb(locale, topic);
  if (dbPage) {
    return dbPage as BrandSeoPage;
  }

  const dbSnapshot = await getLatestAutomationSnapshotFromDb();
  const state = dbSnapshot?.snapshot ?? getAutomationState();
  return (
    buildBrandPages(state).find(
      (page) => page.locale === locale && page.topic === topic
    ) ?? null
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<BrandPageParams>;
}): Promise<Metadata> {
  const { locale, topic } = await params;
  const page = await getBrandPage(locale, topic);

  if (!page) {
    return {};
  }

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    keywords: page.metadata.keywords,
    alternates: {
      canonical: getLocalizedUrl(locale, page.routePath),
      languages: getPageAlternates(page.routePath),
    },
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      url: getLocalizedUrl(locale, page.routePath),
      locale: getOpenGraphLocale(locale),
      images: [
        {
          url: `/${locale}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: page.metadata.title,
        },
      ],
    },
    twitter: {
      title: page.metadata.title,
      description: page.metadata.description,
      images: [`/${locale}/twitter-image`],
    },
  };
}

export default async function BrandTopicPage({
  params,
}: {
  params: Promise<BrandPageParams>;
}) {
  const { locale, topic } = await params;
  const page = await getBrandPage(locale, topic);

  if (!page) {
    notFound();
  }

  const pageUrl = getLocalizedUrl(locale, page.routePath);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-[2rem] border border-border/70 bg-background px-6 py-8 shadow-sm md:px-8 md:py-10">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-semibold">
            品牌页
          </Badge>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
            {page.topic}
          </Badge>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
            最近复核：{page.lastReviewed}
          </Badge>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.95fr)]">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {page.heroTitle}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {page.heroDescription}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <TrackedInternalLink
                href={page.cta.href}
                analytics={{
                  content_locale: locale,
                  content_page_type: "brand",
                  content_cluster: "brand_page",
                  content_primary_query: page.metadata.keywords[0],
                  cta_target_type: "brand_hub",
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                {page.cta.label}
                <ArrowRight className="h-4 w-4" />
              </TrackedInternalLink>
              <TrackedExternalLink
                href={pageUrl}
                analytics={{
                  content_locale: locale,
                  content_page_type: "brand",
                  content_cluster: "brand_page",
                  content_primary_query: page.metadata.keywords[0],
                  cta_target_type: "share_brand_page",
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-3 text-sm"
              >
                分享品牌页
                <ExternalLink className="h-4 w-4" />
              </TrackedExternalLink>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{page.cta.helperText}</p>
          </div>

          <Card className="h-fit border-border/70">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-brand">品牌关键词</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {page.metadata.keywords.map((keyword) => (
                  <li key={keyword} className="rounded-xl border border-border/60 px-3 py-2">
                    {keyword}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        {page.sections.map((section) => (
          <Card key={section.title}>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {section.body}
              </p>
              {section.bullets?.length ? (
                <ul className="mt-4 space-y-2">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="text-sm text-muted-foreground">
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold">品牌 FAQ</h2>
            <div className="mt-4 space-y-4">
              {page.faq.map((item) => (
                <div key={item.q} className="rounded-2xl border border-border/70 p-4">
                  <p className="font-semibold">{item.q}</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <WebPageJsonLd
        locale={locale}
        name={page.metadata.title}
        description={page.metadata.description}
        url={pageUrl}
      />
      <FAQJsonLd locale={locale} items={page.faq} />
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: SITE_NAME, url: getLocalizedUrl(locale) },
          { name: "Brand", url: pageUrl },
        ]}
      />
    </div>
  );
}
