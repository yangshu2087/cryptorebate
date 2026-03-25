import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrackedInternalLink } from "@/components/analytics/tracked-internal-link";
import { TrackedExternalLink } from "@/components/analytics/tracked-external-link";
import {
  getExchangeSeoEntriesForExchange,
  getExchangeSeoPageHref,
  getExchangeSeoPageLabels,
  isSeoContentLocale,
} from "@/data/exchange-seo";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { Exchange } from "@/types/exchange";

export function ExchangeCard({
  exchange,
  pageType = "exchange_card",
  showSeoLinks = false,
}: {
  exchange: Exchange;
  pageType?: string;
  showSeoLinks?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations();
  const seoLocale = isSeoContentLocale(locale) ? locale : null;
  const geoEntries =
    showSeoLinks && seoLocale
      ? getExchangeSeoEntriesForExchange(seoLocale, exchange.slug)
      : [];
  const geoSectionLabel = locale === "zh" ? "问题页入口" : "SEO / GEO guides";

  return (
    <Card className="group transition-all hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center">
              <Image
                src={exchange.logo}
                alt={exchange.name}
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </div>
            <div>
              <h3 className="font-semibold text-base">{exchange.name}</h3>
              <div className="mt-0.5 flex flex-wrap gap-1.5">
                {exchange.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {t(`tags.${tag}`)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">{t("exchanges.rebateRate")}</div>
            <div className="text-lg font-bold text-brand">{exchange.spotRebate}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-xs text-muted-foreground">{t("exchanges.spotFees")}</span>
            <p className="font-medium">
              {(exchange.fees.spotMaker * 100).toFixed(2)}% / {(exchange.fees.spotTaker * 100).toFixed(2)}%
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">{t("exchanges.futuresFees")}</span>
            <p className="font-medium">
              {(exchange.fees.futuresMaker * 100).toFixed(3)}% / {(exchange.fees.futuresTaker * 100).toFixed(3)}%
            </p>
          </div>
        </div>

        {geoEntries.length > 0 ? (
          <div className="mt-4 rounded-xl border border-border/70 bg-muted/20 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {geoSectionLabel}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {geoEntries.map((entry) => {
                const labels = getExchangeSeoPageLabels(seoLocale!, entry.pageType);

                return (
                  <TrackedInternalLink
                    key={entry.pageType}
                    href={getExchangeSeoPageHref(exchange.slug, entry.pageType)}
                    analytics={{
                      content_locale: locale,
                      content_exchange_slug: exchange.slug,
                      content_page_type: entry.pageType,
                      content_cluster: "exchange_geo",
                      content_primary_query: entry.primaryQuery,
                      hub_page_type: pageType,
                      cta_target_type: entry.pageType,
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium transition-colors hover:border-brand/30 hover:text-brand"
                  >
                    {labels.short}
                    <ArrowRight className="h-3 w-3" />
                  </TrackedInternalLink>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex items-center gap-2">
          <Link href={`/exchanges/${exchange.slug}`} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent transition-colors">
            {t("exchanges.viewDetails")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <TrackedExternalLink
            href={exchange.referralLink}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-cta px-3 py-2 text-sm font-semibold text-black hover:bg-cta-hover transition-colors"
            analytics={{
              cta_type: "register",
              exchange_slug: exchange.slug,
              page_type: pageType,
            }}
          >
            {t("exchanges.register")}
            <ExternalLink className="h-3.5 w-3.5" />
          </TrackedExternalLink>
        </div>
      </CardContent>
    </Card>
  );
}
