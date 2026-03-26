import type { ComponentType } from "react";
import { AlertTriangle, ArrowUpRight, Bot, CircleAlert, ExternalLink, LineChart, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LOCALES, LOCALE_LABELS, SITE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { exchanges } from "@/data/exchanges";
import {
  getAutomationState,
  getUnifiedSeoPageHref,
  getUnifiedSeoPageLabels,
} from "@/lib/automation/catalog";
import type { AutomationAlert, QueryOpportunity, RoiEntry } from "@/lib/automation/types";

const views = ["overview", "opportunities", "roi", "alerts", "pages"] as const;
type ViewMode = (typeof views)[number];

type SeoConsoleProps = {
  locale: string;
  view: string | undefined;
  exchange: string | undefined;
  dataLocale: string | undefined;
  pageType: string | undefined;
};

function isViewMode(value: string | undefined): value is ViewMode {
  return !!value && views.includes(value as ViewMode);
}

function isKnownLocale(value: string | undefined) {
  return !!value && LOCALES.includes(value as (typeof LOCALES)[number]);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function buildHref(locale: string, params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && value !== "all") {
      query.set(key, value);
    }
  }
  const suffix = query.toString();
  return `/${locale}/admin/seo${suffix ? `?${suffix}` : ""}`;
}

function buildApiHref(path: string, params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && value !== "all") {
      query.set(key, value);
    }
  }
  const suffix = query.toString();
  return `${path}${suffix ? `?${suffix}` : ""}`;
}

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <Card className="border-border/70">
      <CardContent className="flex items-start gap-4 p-5">
        <div className="rounded-2xl bg-brand/10 p-2 text-brand">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function RankBar({ value, max }: { value: number; max: number }) {
  const width = max === 0 ? 0 : Math.max(6, Math.round((value / max) * 100));
  return (
    <div className="mt-2 h-2 rounded-full bg-muted">
      <div className="h-2 rounded-full bg-brand" style={{ width: `${width}%` }} />
    </div>
  );
}

function AlertBadge({ level }: { level: AutomationAlert["level"] }) {
  const variant = level === "critical" ? "destructive" : level === "warning" ? "outline" : "secondary";
  return <Badge variant={variant}>{level}</Badge>;
}

export function SeoConsole({ locale, view, exchange, dataLocale, pageType }: SeoConsoleProps) {
  const state = getAutomationState();
  const activeView: ViewMode = isViewMode(view) ? view : "overview";
  const selectedExchange: string = exchanges.some((item) => item.slug === exchange) ? exchange ?? "all" : "all";
  const selectedDataLocale = isKnownLocale(dataLocale) ? String(dataLocale) : "all";
  const labelsLocale = selectedDataLocale === "all" ? locale : selectedDataLocale;
  const generatedAt = formatDate(state.generatedAt);

  const filteredOpportunities = state.opportunities
    .filter((item) => (selectedExchange === "all" ? true : item.exchangeSlug === selectedExchange))
    .filter((item) => (selectedDataLocale === "all" ? true : item.locale === selectedDataLocale))
    .filter((item) => (!pageType || pageType === "all" ? true : item.pageType === pageType))
    .sort((a, b) => b.score - a.score);

  const filteredPageRoi = state.pageRoiDaily
    .filter((item) => (selectedExchange === "all" ? true : item.exchangeSlug === selectedExchange))
    .filter((item) => (selectedDataLocale === "all" ? true : item.locale === selectedDataLocale))
    .filter((item) => (!pageType || pageType === "all" ? true : item.pageType === pageType))
    .sort((a, b) => b.commissionsUsd - a.commissionsUsd);

  const filteredQueryRoi = state.queryRoiDaily
    .filter((item) => (selectedExchange === "all" ? true : item.exchangeSlug === selectedExchange))
    .filter((item) => (selectedDataLocale === "all" ? true : item.locale === selectedDataLocale))
    .filter((item) => (!pageType || pageType === "all" ? true : item.pageType === pageType))
    .sort((a, b) => b.commissionsUsd - a.commissionsUsd);

  const filteredPages = state.pages
    .filter((item) => (selectedExchange === "all" ? true : item.exchangeSlug === selectedExchange))
    .filter((item) => (selectedDataLocale === "all" ? true : item.locale === selectedDataLocale))
    .filter((item) => (!pageType || pageType === "all" ? true : item.pageType === pageType))
    .sort((a, b) => b.qualityScore - a.qualityScore);

  const filteredAlerts = state.alerts.filter((item) => {
    const exchangePass = selectedExchange === "all" ? true : item.scope.exchangeSlug === selectedExchange;
    const localePass = selectedDataLocale === "all" ? true : item.scope.locale === selectedDataLocale;
    return exchangePass && localePass;
  });

  const exchangeSummaries = exchanges
    .map((item) => {
      const opps = state.opportunities.filter((opp) => opp.exchangeSlug === item.slug);
      const roi = state.pageRoiDaily.filter((entry) => entry.exchangeSlug === item.slug);
      const alerts = state.alerts.filter((alert) => alert.scope.exchangeSlug === item.slug);
      return {
        slug: item.slug,
        name: item.name,
        opportunityCount: opps.length,
        projectedRevenueUsd: opps.reduce((sum, opp) => sum + opp.projectedMonthlyRevenueUsd, 0),
        realizedRevenueUsd: roi.reduce((sum, entry) => sum + entry.commissionsUsd, 0),
        alertCount: alerts.length,
      };
    })
    .sort((a, b) => b.projectedRevenueUsd - a.projectedRevenueUsd);

  const pageTypeOptions = Array.from(
    new Set(state.opportunities.map((item) => item.pageType).concat(state.pages.map((item) => item.pageType)))
  ).sort();

  const statsApiHref = buildApiHref("/api/stats/seo", {
    locale: selectedDataLocale === "all" ? undefined : selectedDataLocale,
  });
  const opportunitiesApiHref = buildApiHref("/api/opportunities", {
    locale: selectedDataLocale === "all" ? undefined : selectedDataLocale,
    exchange: selectedExchange === "all" ? undefined : selectedExchange,
    pageType: pageType === "all" ? undefined : pageType,
    limit: "10",
  });
  const roiApiHref = buildApiHref("/api/roi", {
    mode: "page",
    locale: selectedDataLocale === "all" ? undefined : selectedDataLocale,
    exchange: selectedExchange === "all" ? undefined : selectedExchange,
  });
  const pagesApiHref = buildApiHref("/api/pages", {
    locale: selectedDataLocale === "all" ? undefined : selectedDataLocale,
    exchange: selectedExchange === "all" ? undefined : selectedExchange,
    pageType: pageType === "all" ? undefined : pageType,
  });

  const maxProjected = Math.max(...exchangeSummaries.map((item) => item.projectedRevenueUsd), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Operator console</Badge>
            <Badge variant="outline">Noindex</Badge>
            <Badge variant={state.controlPlane.paused ? "destructive" : "default"}>
              {state.controlPlane.paused ? "Paused" : "Automation active"}
            </Badge>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            SEO / GEO Automation Console
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
            A live operator view for opportunities, ROI, alerts, generated pages, and the current automation control plane.
            This page is intentionally not indexed and is meant for internal operating review.
          </p>
        </div>
        <Card className="min-w-[280px] border-border/70">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Snapshot generated</p>
            <p className="mt-1 text-lg font-semibold">{generatedAt}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Source of truth: automation state + live API routes under <span className="font-medium">{SITE_URL}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={Sparkles} label="Signals" value={formatNumber(state.metrics.totalSignals)} helper="Query and demand inputs currently in the engine" />
        <MetricCard icon={TrendingUp} label="Opportunities" value={formatNumber(state.metrics.totalOpportunities)} helper="Ranked page opportunities across locales and exchanges" />
        <MetricCard icon={Bot} label="Published pages" value={formatNumber(state.metrics.publishedPages)} helper="Pages currently considered active by the automation loop" />
        <MetricCard icon={LineChart} label="Projected monthly revenue" value={formatUsd(state.metrics.monthlyProjectedRevenueUsd)} helper="Projected from current opportunity scoring and earnings model" />
        <MetricCard icon={CircleAlert} label="Alerts" value={formatNumber(state.alerts.length)} helper={`${state.controlPlane.quarantinedPageKeys.length} quarantined page keys · quality avg ${state.metrics.averageQualityScore}`} />
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Filter bar</CardTitle>
            <CardDescription>Use quick filters to narrow the operator view without leaving the page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">View</p>
              <div className="flex flex-wrap gap-2">
                {views.map((item) => (
                  <a
                    key={item}
                    href={buildHref(locale, {
                      view: item,
                      exchange: selectedExchange === "all" ? undefined : selectedExchange,
                      dataLocale: selectedDataLocale === "all" ? undefined : selectedDataLocale,
                      pageType: pageType === "all" ? undefined : pageType,
                    })}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      activeView === item
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-background hover:border-brand/40 hover:text-brand"
                    )}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Exchange</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={buildHref(locale, {
                    view: activeView,
                    dataLocale: selectedDataLocale === "all" ? undefined : selectedDataLocale,
                    pageType: pageType === "all" ? undefined : pageType,
                  })}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    selectedExchange === "all"
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-background hover:border-brand/40 hover:text-brand"
                  )}
                >
                  All exchanges
                </a>
                {exchanges.map((item) => (
                  <a
                    key={item.slug}
                    href={buildHref(locale, {
                      view: activeView,
                      exchange: item.slug,
                      dataLocale: selectedDataLocale === "all" ? undefined : selectedDataLocale,
                      pageType: pageType === "all" ? undefined : pageType,
                    })}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      selectedExchange === item.slug
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-background hover:border-brand/40 hover:text-brand"
                    )}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Data locale</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={buildHref(locale, {
                    view: activeView,
                    exchange: selectedExchange === "all" ? undefined : selectedExchange,
                    pageType: pageType === "all" ? undefined : pageType,
                  })}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    selectedDataLocale === "all"
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-background hover:border-brand/40 hover:text-brand"
                  )}
                >
                  All locales
                </a>
                {LOCALES.map((item) => (
                  <a
                    key={item}
                    href={buildHref(locale, {
                      view: activeView,
                      exchange: selectedExchange === "all" ? undefined : selectedExchange,
                      dataLocale: item,
                      pageType: pageType === "all" ? undefined : pageType,
                    })}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      selectedDataLocale === item
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-background hover:border-brand/40 hover:text-brand"
                    )}
                  >
                    {LOCALE_LABELS[item]}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Page type</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={buildHref(locale, {
                    view: activeView,
                    exchange: selectedExchange === "all" ? undefined : selectedExchange,
                    dataLocale: selectedDataLocale === "all" ? undefined : selectedDataLocale,
                  })}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    !pageType || pageType === "all"
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-background hover:border-brand/40 hover:text-brand"
                  )}
                >
                  All types
                </a>
                {pageTypeOptions.map((item) => (
                  <a
                    key={item}
                    href={buildHref(locale, {
                      view: activeView,
                      exchange: selectedExchange === "all" ? undefined : selectedExchange,
                      dataLocale: selectedDataLocale === "all" ? undefined : selectedDataLocale,
                      pageType: item,
                    })}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      pageType === item
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-background hover:border-brand/40 hover:text-brand"
                    )}
                  >
                    {getUnifiedSeoPageLabels(labelsLocale, item).short}
                  </a>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Live endpoints</CardTitle>
            <CardDescription>These links open the same live API payloads the automation and operators rely on.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { label: "Stats", href: statsApiHref },
              { label: "Opportunities", href: opportunitiesApiHref },
              { label: "ROI", href: roiApiHref },
              { label: "Pages", href: pagesApiHref },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3 transition-colors hover:border-brand/30 hover:bg-muted/20"
              >
                <span>{item.label}</span>
                <span className="inline-flex items-center gap-1 text-brand">
                  Open
                  <ExternalLink className="h-4 w-4" />
                </span>
              </a>
            ))}
            <Separator className="my-3" />
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>Rollout mode: <span className="font-medium text-foreground">{state.controlPlane.rolloutMode}</span></p>
              <p>Publish limit per exchange / day: <span className="font-medium text-foreground">{state.controlPlane.publishDailyLimitPerExchange}</span></p>
              <p>Refresh limit per exchange / day: <span className="font-medium text-foreground">{state.controlPlane.refreshDailyLimitPerExchange}</span></p>
              <p>Quarantined locales: <span className="font-medium text-foreground">{state.controlPlane.quarantinedLocales.length}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Exchange monetization board</CardTitle>
            <CardDescription>Quick ranking across the 7 exchanges by projected revenue and realized page-side commissions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {exchangeSummaries.map((item) => (
              <div key={item.slug} className="rounded-2xl border border-border/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.opportunityCount} opportunities · {item.alertCount} alerts
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-brand">{formatUsd(item.projectedRevenueUsd)}</p>
                    <p className="text-xs text-muted-foreground">Projected</p>
                  </div>
                </div>
                <RankBar value={item.projectedRevenueUsd} max={maxProjected} />
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Realized page revenue</span>
                  <span className="font-medium text-foreground">{formatUsd(item.realizedRevenueUsd)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Recent automation runs</CardTitle>
            <CardDescription>Latest pipeline jobs recorded in the current snapshot.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.runs.slice(0, 8).map((run) => (
              <div key={run.id} className="rounded-2xl border border-border/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{run.job}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{run.summary}</p>
                  </div>
                  <Badge variant={run.status === "failed" ? "destructive" : run.status === "warning" ? "outline" : "secondary"}>
                    {run.status}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(run.completedAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 space-y-8">
        {(activeView === "overview" || activeView === "opportunities") && (
          <section>
            <SectionHeading title="Top opportunities" description="Highest-ranked page opportunities under the current filters." />
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredOpportunities.slice(0, 12).map((item) => (
                <OpportunityCard key={item.id} locale={locale} item={item} />
              ))}
            </div>
          </section>
        )}

        {(activeView === "overview" || activeView === "roi") && (
          <section>
            <SectionHeading title="Page ROI leaderboard" description="Pages currently generating the strongest commission signal." />
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredPageRoi.slice(0, 12).map((item) => (
                <RoiCard key={item.id} locale={locale} item={item} mode="page" />
              ))}
            </div>
          </section>
        )}

        {(activeView === "overview" || activeView === "roi") && (
          <section>
            <SectionHeading title="Query ROI leaderboard" description="Query clusters ranked by commission contribution." />
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredQueryRoi.slice(0, 12).map((item) => (
                <RoiCard key={item.id} locale={locale} item={item} mode="query" />
              ))}
            </div>
          </section>
        )}

        {(activeView === "overview" || activeView === "alerts") && (
          <section>
            <SectionHeading title="Alerts" description="Current automation warnings and critical states under the active filters." />
            {filteredAlerts.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredAlerts.map((item) => (
                  <Card key={item.id} className="border-border/70">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "mt-0.5 rounded-xl p-2",
                            item.level === "critical" ? "bg-destructive/10 text-destructive" : item.level === "warning" ? "bg-amber-100 text-amber-700" : "bg-muted text-foreground"
                          )}>
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold">{item.type}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                          </div>
                        </div>
                        <AlertBadge level={item.level} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {item.scope.exchangeSlug ? <span>Exchange: {item.scope.exchangeSlug}</span> : null}
                        {item.scope.locale ? <span>Locale: {item.scope.locale}</span> : null}
                        {item.scope.pageType ? <span>Type: {item.scope.pageType}</span> : null}
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">Triggered {formatDate(item.triggeredAt)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-border/70">
                <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  No alerts matched the current filters.
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {(activeView === "overview" || activeView === "pages") && (
          <section>
            <SectionHeading title="Generated pages" description="Current pages inside the automation state, sorted by quality score." />
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredPages.slice(0, 12).map((page) => (
                <Card key={page.id} className="border-border/70">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{page.exchangeSlug} · {getUnifiedSeoPageLabels(page.locale, page.pageType).short}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{page.primaryQuery}</p>
                      </div>
                      <Badge variant={page.stage === "published" ? "secondary" : page.stage === "quarantined" ? "destructive" : "outline"}>
                        {page.stage}
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-4">
                      <div>
                        <p className="font-medium text-foreground">{page.locale}</p>
                        <p>Locale</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{page.qualityScore}</p>
                        <p>Quality</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{formatDate(page.lastReviewed)}</p>
                        <p>Last reviewed</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{formatDate(page.refreshDueAt)}</p>
                        <p>Refresh due</p>
                      </div>
                    </div>
                    <a
                      href={`/${locale}${getUnifiedSeoPageHref(page.exchangeSlug, page.pageType)}`}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                    >
                      Open landing page
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function OpportunityCard({ locale, item }: { locale: string; item: QueryOpportunity }) {
  const pageHref = `/${locale}${getUnifiedSeoPageHref(item.exchangeSlug, item.pageType)}`;
  return (
    <Card className="border-border/70">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{item.locale}</Badge>
              <Badge variant="outline">{item.exchangeSlug}</Badge>
              <Badge variant="outline">{item.pageType}</Badge>
            </div>
            <p className="mt-3 text-lg font-semibold tracking-tight">{item.primaryQuery}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Action: {item.recommendedAction} · Stage: {item.stage}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Score</p>
            <p className="text-2xl font-semibold text-brand">{item.score}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <Metric label="Quality" value={String(item.qualityScore)} />
          <Metric label="Projected EPC" value={formatUsd(item.projectedEpcUsd)} />
          <Metric label="Monthly revenue" value={formatUsd(item.projectedMonthlyRevenueUsd)} />
          <Metric label="Observed" value={formatDate(item.observedAt)} />
        </div>
        <a href={pageHref} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
          Open landing page
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </CardContent>
    </Card>
  );
}

function RoiCard({ locale, item, mode }: { locale: string; item: RoiEntry; mode: "page" | "query" }) {
  const pageHref = `/${locale}${getUnifiedSeoPageHref(item.exchangeSlug, item.pageType)}`;
  return (
    <Card className="border-border/70">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{item.locale}</Badge>
              <Badge variant="outline">{item.exchangeSlug}</Badge>
              <Badge variant="outline">{item.pageType}</Badge>
            </div>
            <p className="mt-3 text-lg font-semibold tracking-tight">{item.primaryQuery}</p>
            <p className="mt-1 text-sm text-muted-foreground">{mode === "page" ? "Page ROI" : "Query ROI"} key: {item.key}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Commission</p>
            <p className="text-2xl font-semibold text-brand">{formatUsd(item.commissionsUsd)}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <Metric label="Clicks" value={formatNumber(item.clicks)} />
          <Metric label="Registrations" value={formatNumber(item.registrations)} />
          <Metric label="EPC" value={formatUsd(item.epcUsd)} />
          <Metric label="RPM" value={formatUsd(item.rpmUsd)} />
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(item.observedAt)}</span>
          <a href={pageHref} className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
            Open landing page
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/40 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}
