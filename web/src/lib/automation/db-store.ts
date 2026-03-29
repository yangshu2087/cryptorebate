import crypto from "node:crypto";
import type { PoolClient } from "pg";
import { exchanges } from "@/data/exchanges";
import { getAutomationDataReality } from "@/lib/automation/data-reality";
import { SITE_URL } from "@/lib/constants";
import { buildBrandPages, type BrandSeoPage } from "./brand-pages";
import { createStableId, isAutomationDbEnabled, withAutomationDb } from "./db";
import {
  getQueuedStatusForChannel,
  publishDistributionJob,
} from "./distribution";
import {
  isFocusExchangeSlug,
  isFocusLocale,
  isFocusPageType,
} from "./focus";
import {
  buildGscFocusPageRowFirstSeenAlert,
  buildGscFocusPageRowDailyTelegramSummary,
  buildGscFocusPageRowTelegramReminder,
  summarizeGscFocusPageRowMonitor,
} from "./gsc-focus-page-monitor";
import { getInternalLinkDistributionCandidates } from "./internal-links";
import type {
  AffiliateClick,
  AutomationAlert,
  AutomationRun,
  AutomationSeoPage,
  AutomationState,
  CommissionEvent,
  ConversionEvent,
  DistributionJob,
  DistributionJobPayload,
  GscFocusPageRowMonitorEntry,
  QueryOpportunity,
  RoiEntry,
} from "./types";

type SeoPageDbRow = {
  id: string;
  page_kind: string;
  route_path: string;
  locale: string;
  exchange_slug: string | null;
  page_type: string;
  topic: string | null;
  stage: string;
  primary_query: string | null;
  quality_score: number;
  opportunity_score: number;
  published_at: string | null;
  refresh_due_at: string | null;
  content: Record<string, unknown>;
  updated_at: string;
};

type SnapshotRow = {
  id: string;
  generated_at: string;
  snapshot: AutomationState;
};

type DistributionJobRow = {
  id: string;
  channel: string;
  locale: string;
  exchange_slug: string | null;
  page_type: string | null;
  topic: string | null;
  route_path: string;
  status: string;
  payload: Record<string, unknown>;
  retry_count: number;
  last_attempt_at: string | null;
  next_attempt_at: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

type OperatorAlertRow = {
  id: string;
  level: string;
  type: string;
  scope: Record<string, unknown>;
  message: string;
  href: string | null;
  source: string | null;
  source_label: string | null;
  triggered_at: string;
  meta: Record<string, unknown>;
};

function toDistributionJob(row: DistributionJobRow): DistributionJob {
  return {
    id: row.id,
    channel: row.channel as DistributionJob["channel"],
    locale: row.locale,
    exchangeSlug: row.exchange_slug as DistributionJob["exchangeSlug"],
    pageType: row.page_type,
    topic: row.topic,
    routePath: row.route_path,
    status: row.status as DistributionJob["status"],
    payload: row.payload as DistributionJobPayload,
    retryCount: row.retry_count,
    lastAttemptAt: row.last_attempt_at,
    nextAttemptAt: row.next_attempt_at,
    error: row.error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  };
}

function toAutomationAlert(row: OperatorAlertRow): AutomationAlert {
  const meta = row.meta ?? {};
  return {
    id: row.id,
    level: row.level as AutomationAlert["level"],
    type: row.type as AutomationAlert["type"],
    scope: (row.scope ?? {}) as AutomationAlert["scope"],
    message: row.message,
    href: row.href ?? undefined,
    source: (row.source as AutomationAlert["source"]) ?? undefined,
    sourceLabel: row.source_label ?? undefined,
    triggeredAt: row.triggered_at,
    ...(typeof meta === "object" ? meta : {}),
  };
}

async function listOperatorAlertsFromDb(limit = 20) {
  const result = await withAutomationDb(async (client) =>
    client.query<OperatorAlertRow>(
      `SELECT * FROM operator_alerts ORDER BY triggered_at DESC LIMIT $1`,
      [limit]
    )
  );
  return (result?.rows ?? []).map(toAutomationAlert);
}

function buildRunAlertId(job: AutomationRun["job"]) {
  return `alert-run-${job}`;
}

async function upsertOperatorAlert(
  client: PoolClient,
  alert: AutomationAlert
) {
  await client.query(
    `INSERT INTO operator_alerts (
      id, level, type, scope, message, href, source, source_label, triggered_at, meta
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    ON CONFLICT (id) DO UPDATE SET
      level = EXCLUDED.level,
      type = EXCLUDED.type,
      scope = EXCLUDED.scope,
      message = EXCLUDED.message,
      href = EXCLUDED.href,
      source = EXCLUDED.source,
      source_label = EXCLUDED.source_label,
      triggered_at = EXCLUDED.triggered_at,
      meta = EXCLUDED.meta`,
    [
      alert.id,
      alert.level,
      alert.type,
      JSON.stringify(alert.scope),
      alert.message,
      alert.href ?? null,
      alert.source ?? null,
      alert.sourceLabel ?? null,
      alert.triggeredAt,
      JSON.stringify(alert),
    ]
  );
}

function hashContent(value: unknown) {
  return crypto.createHash("sha1").update(JSON.stringify(value)).digest("hex");
}

function parseClusterId(clusterId: string) {
  const prefix = "cluster-";
  if (!clusterId.startsWith(prefix)) return null;
  const body = clusterId.slice(prefix.length);
  for (const exchange of exchanges) {
    const suffix = `-${exchange.slug}-`;
    const matchIndex = body.indexOf(suffix);
    if (matchIndex === -1) continue;
    const locale = body.slice(0, matchIndex);
    const pageType = body.slice(matchIndex + suffix.length);
    if (!locale || !pageType) continue;
    return { locale, exchangeSlug: exchange.slug, pageType };
  }
  return null;
}

function deriveLandingPageKey(locale?: string | null, exchangeSlug?: string | null, pageType?: string | null) {
  return [locale, exchangeSlug, pageType].filter(Boolean).join(":") || null;
}

function normaliseConversionForDb(item: Omit<ConversionEvent, "id"> | ConversionEvent) {
  const parsed = parseClusterId(item.queryClusterId);
  return {
    ...item,
    locale: parsed?.locale ?? null,
    pageType: parsed?.pageType ?? null,
    landingPageKey: deriveLandingPageKey(parsed?.locale, item.exchangeSlug, parsed?.pageType),
  };
}

function normaliseCommissionForDb(item: Omit<CommissionEvent, "id"> | CommissionEvent) {
  const parsed = parseClusterId(item.queryClusterId);
  return {
    ...item,
    locale: parsed?.locale ?? null,
    pageType: parsed?.pageType ?? null,
    landingPageKey: deriveLandingPageKey(parsed?.locale, item.exchangeSlug, parsed?.pageType),
  };
}

function pageToDbRecord(page: AutomationSeoPage) {
  return {
    id: page.id,
    pageKind: "exchange",
    routePath: `/exchanges/${page.exchangeSlug}/${page.pageType}`,
    locale: page.locale,
    exchangeSlug: page.exchangeSlug,
    pageType: page.pageType,
    topic: null,
    stage: page.stage,
    primaryQuery: page.primaryQuery,
    qualityScore: page.qualityScore,
    opportunityScore: page.qualityScore,
    publishedAt: page.publishedAt ?? null,
    refreshDueAt: page.refreshDueAt,
    content: page,
  };
}

function brandPageToDbRecord(page: BrandSeoPage) {
  return {
    id: page.id,
    pageKind: "brand",
    routePath: page.routePath,
    locale: page.locale,
    exchangeSlug: null,
    pageType: "brand",
    topic: page.topic,
    stage: "published",
    primaryQuery: page.metadata.keywords[0] ?? page.metadata.title,
    qualityScore: page.qualityScore,
    opportunityScore: page.qualityScore,
    publishedAt: page.publishedAt,
    refreshDueAt: null,
    content: page,
  };
}

async function upsertSeoPages(
  state: AutomationState,
  additionalBrandPages: BrandSeoPage[]
) {
  return withAutomationDb(async (client) => {
    const exchangePages = state.pages.map(pageToDbRecord);
    const brandPages = additionalBrandPages.map(brandPageToDbRecord);
    const records = [...exchangePages, ...brandPages];

    await client.query("BEGIN");
    try {
      await client.query("DELETE FROM seo_pages WHERE page_kind IN ('exchange','brand')");

      for (const record of records) {
        await client.query(
          `INSERT INTO seo_pages (
            id, page_kind, route_path, locale, exchange_slug, page_type, topic, stage,
            primary_query, quality_score, opportunity_score, published_at, refresh_due_at, content, updated_at
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW()
          )`,
          [
            record.id,
            record.pageKind,
            record.routePath,
            record.locale,
            record.exchangeSlug,
            record.pageType,
            record.topic,
            record.stage,
            record.primaryQuery,
            record.qualityScore,
            record.opportunityScore,
            record.publishedAt,
            record.refreshDueAt,
            JSON.stringify(record.content),
          ]
        );

        const versionHash = hashContent(record.content);
        await client.query(
          `INSERT INTO page_versions (id, page_id, version_hash, content, source)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (page_id, version_hash) DO NOTHING`,
          [
            createStableId("pagever", `${record.id}:${versionHash}`),
            record.id,
            versionHash,
            JSON.stringify(record.content),
            record.pageKind === "brand" ? "brand-automation" : "query-automation",
          ]
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function persistAutomationStateToDb(state: AutomationState) {
  if (!isAutomationDbEnabled()) {
    return null;
  }

  const brandPages = buildBrandPages(state);

  await withAutomationDb(async (client) => {
    await client.query("BEGIN");
    try {
      await client.query("DELETE FROM query_clusters");
      await client.query("DELETE FROM query_opportunities");
      await client.query("DELETE FROM operator_alerts");
      await client.query("DELETE FROM sync_runs WHERE job IN ('daily_query_clustering','daily_opportunity_scoring','daily_page_generation','daily_page_publish','daily_page_refresh','daily_roi_recompute','weekly_staleness_audit','weekly_underperformance_pruning')");

      for (const cluster of state.clusters) {
        await client.query(
          `INSERT INTO query_clusters (id, locale, exchange_slug, intent, page_type, primary_query, score, data, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
          [
            cluster.id,
            cluster.locale,
            cluster.exchangeSlug,
            cluster.intent,
            cluster.pageType,
            cluster.queries[0] ?? null,
            cluster.score,
            JSON.stringify(cluster),
          ]
        );
      }

      for (const opportunity of state.opportunities) {
        await client.query(
          `INSERT INTO query_opportunities (
            id, cluster_id, locale, exchange_slug, intent, page_type, primary_query,
            score, stage, quality_score, projected_epc_usd, projected_monthly_revenue_usd, data, updated_at
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW()
          )`,
          [
            opportunity.id,
            opportunity.clusterId,
            opportunity.locale,
            opportunity.exchangeSlug,
            opportunity.intent,
            opportunity.pageType,
            opportunity.primaryQuery,
            opportunity.score,
            opportunity.stage,
            opportunity.qualityScore,
            opportunity.projectedEpcUsd,
            opportunity.projectedMonthlyRevenueUsd,
            JSON.stringify(opportunity),
          ]
        );
      }

      for (const alert of state.alerts) {
        await client.query(
          `INSERT INTO operator_alerts (
            id, level, type, scope, message, href, source, source_label, triggered_at, meta
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
            alert.id,
            alert.level,
            alert.type,
            JSON.stringify(alert.scope),
            alert.message,
            alert.href ?? null,
            alert.source ?? null,
            alert.sourceLabel ?? null,
            alert.triggeredAt,
            JSON.stringify(alert),
          ]
        );
      }

      for (const run of state.runs) {
        await client.query(
          `INSERT INTO sync_runs (id, job, status, summary, started_at, completed_at, meta)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (id) DO UPDATE SET
             job = EXCLUDED.job,
             status = EXCLUDED.status,
             summary = EXCLUDED.summary,
             started_at = EXCLUDED.started_at,
             completed_at = EXCLUDED.completed_at,
             meta = EXCLUDED.meta`,
          [run.id, run.job, run.status, run.summary, run.startedAt, run.completedAt, JSON.stringify(run)]
        );
      }

      await client.query(
        `INSERT INTO automation_snapshots (id, generated_at, snapshot)
         VALUES ($1,$2,$3)
         ON CONFLICT (id) DO UPDATE SET generated_at = EXCLUDED.generated_at, snapshot = EXCLUDED.snapshot`,
        ["latest", state.generatedAt, JSON.stringify(state)]
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });

  await upsertSeoPages(state, brandPages);

  return { brandPages: brandPages.length, exchangePages: state.pages.length };
}

export async function upsertGscSignalsToDb(state: AutomationState) {
  if (!isAutomationDbEnabled()) return null;
  const gscSignals = state.signals.filter((signal) => signal.source === "gsc");

  return withAutomationDb(async (client) => {
    await client.query("BEGIN");
    try {
      await client.query("DELETE FROM gsc_query_daily");
      for (const signal of gscSignals) {
        const observedDate = signal.observedAt.slice(0, 10);
        const routePath = `/exchanges/${signal.exchangeSlug}/${signal.pageType}`;
        await client.query(
          `INSERT INTO gsc_query_daily (
            observed_date, locale, exchange_slug, page_type, page_path, page_url,
            query, intent, impressions, clicks, ctr, position, country, meta, updated_at
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW()
          )`,
          [
            observedDate,
            signal.locale,
            signal.exchangeSlug,
            signal.pageType,
            routePath,
            `${SITE_URL}/${signal.locale}${routePath}`,
            signal.query,
            signal.intent,
            signal.impressions,
            signal.clicks,
            signal.ctr,
            signal.position,
            null,
            JSON.stringify(signal),
          ]
        );
      }
      await client.query("COMMIT");
      return { inserted: gscSignals.length };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function recordAffiliateClickToDb(click: Omit<AffiliateClick, "id">) {
  if (!isAutomationDbEnabled()) return null;

  const id = createStableId(
    "click",
    [
      click.exchangeSlug,
      click.locale,
      click.pageType,
      click.pageUrl,
      click.clickedAt,
      click.sessionId ?? "",
      click.visitorId ?? "",
      click.targetUrl ?? "",
    ].join("::")
  );

  return withAutomationDb(async (client) => {
    await client.query(
      `INSERT INTO affiliate_clicks (
        id, clicked_at, page_url, referrer, locale, exchange_slug, page_type,
        query_cluster_id, landing_page_key, primary_query, visitor_id, session_id,
        target_url, utm_source, utm_medium, utm_campaign, utm_content, utm_term,
        source, data_source, meta
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21
      ) ON CONFLICT (id) DO NOTHING`,
      [
        id,
        click.clickedAt,
        click.pageUrl,
        click.referrer ?? null,
        click.locale,
        click.exchangeSlug,
        click.pageType,
        click.queryClusterId,
        deriveLandingPageKey(click.locale, click.exchangeSlug, click.pageType),
        click.primaryQuery ?? null,
        click.visitorId ?? null,
        click.sessionId ?? null,
        click.targetUrl ?? null,
        click.utmSource ?? null,
        click.utmMedium ?? null,
        click.utmCampaign ?? null,
        click.utmContent ?? null,
        click.utmTerm ?? null,
        click.source ?? null,
        click.dataSource ?? null,
        JSON.stringify(click),
      ]
    );

    return { id };
  });
}

export async function importPartnerEventsToDb(input: {
  conversions?: Array<Omit<ConversionEvent, "id"> | ConversionEvent>;
  commissions?: Array<Omit<CommissionEvent, "id"> | CommissionEvent>;
}) {
  if (!isAutomationDbEnabled()) return null;

  const conversions = (input.conversions ?? []).map(normaliseConversionForDb);
  const commissions = (input.commissions ?? []).map(normaliseCommissionForDb);

  return withAutomationDb(async (client) => {
    await client.query("BEGIN");
    try {
      for (const item of conversions) {
        const id = "id" in item && item.id ? item.id : createStableId("conv", [item.exchangeSlug, item.queryClusterId, item.registeredAt, item.status, item.source ?? "csv"].join("::"));
        await client.query(
          `INSERT INTO conversion_events (
            id, exchange_slug, query_cluster_id, locale, page_type, landing_page_key,
            visitor_id, session_id, registered_at, traded_at, first_deposit_usd,
            status, source, data_source, meta
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
          ) ON CONFLICT (id) DO NOTHING`,
          [
            id,
            item.exchangeSlug,
            item.queryClusterId,
            item.locale,
            item.pageType,
            item.landingPageKey,
            null,
            null,
            item.registeredAt,
            item.tradedAt ?? null,
            item.firstDepositUsd ?? null,
            item.status,
            item.source ?? null,
            item.dataSource ?? null,
            JSON.stringify(item),
          ]
        );
      }

      for (const item of commissions) {
        const id = "id" in item && item.id ? item.id : createStableId("comm", [item.exchangeSlug, item.queryClusterId, item.recordedAt, item.commissionUsd, item.source ?? "csv"].join("::"));
        await client.query(
          `INSERT INTO commission_events (
            id, exchange_slug, query_cluster_id, locale, page_type, landing_page_key,
            visitor_id, session_id, commission_usd, recorded_at, source, data_source, meta
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
          ) ON CONFLICT (id) DO NOTHING`,
          [
            id,
            item.exchangeSlug,
            item.queryClusterId,
            item.locale,
            item.pageType,
            item.landingPageKey,
            null,
            null,
            item.commissionUsd,
            item.recordedAt,
            item.source,
            item.dataSource ?? null,
            JSON.stringify(item),
          ]
        );
      }

      await client.query("COMMIT");
      return { conversions: conversions.length, commissions: commissions.length };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function insertSyncRun(run: AutomationRun, meta: Record<string, unknown> = {}) {
  if (!isAutomationDbEnabled()) return null;
  return withAutomationDb(async (client) => {
    await client.query(
      `INSERT INTO sync_runs (id, job, status, summary, started_at, completed_at, meta)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status,
         summary = EXCLUDED.summary,
         started_at = EXCLUDED.started_at,
         completed_at = EXCLUDED.completed_at,
         meta = EXCLUDED.meta`,
      [run.id, run.job, run.status, run.summary, run.startedAt, run.completedAt, JSON.stringify(meta)]
    );

    const alertId = buildRunAlertId(run.job);
    if (run.status === "failed" || run.status === "warning") {
      await upsertOperatorAlert(client, {
        id: alertId,
        level: run.status === "failed" ? "critical" : "warning",
        type: "sync_failure",
        scope: {},
        message: `${run.job} ${run.status === "failed" ? "失败" : "警告"}：${run.summary}`,
        triggeredAt: run.completedAt,
        source: "internal",
        sourceLabel: "Automation Loop",
        href: undefined,
      });
    } else {
      await client.query(`DELETE FROM operator_alerts WHERE id = $1`, [alertId]);
    }

    return run;
  });
}

export async function getLatestAutomationSnapshotFromDb() {
  const result = await withAutomationDb(async (client) => {
    return client.query<SnapshotRow>(
      `SELECT id, generated_at, snapshot FROM automation_snapshots WHERE id = 'latest' LIMIT 1`
    );
  });

  return result?.rows[0] ?? null;
}

export async function listOpportunitiesFromDb(filters: {
  locale?: string | null;
  exchangeSlug?: string | null;
  pageType?: string | null;
  stage?: string | null;
  limit?: number;
}) {
  const snapshot = await getLatestAutomationSnapshotFromDb();
  if (!snapshot) return null;

  const limit = Math.max(1, Math.min(filters.limit ?? 50, 200));
  const clauses: string[] = [];
  const values: unknown[] = [];

  if (filters.locale) {
    values.push(filters.locale);
    clauses.push(`locale = $${values.length}`);
  }
  if (filters.exchangeSlug) {
    values.push(filters.exchangeSlug);
    clauses.push(`exchange_slug = $${values.length}`);
  }
  if (filters.pageType) {
    values.push(filters.pageType);
    clauses.push(`page_type = $${values.length}`);
  }
  if (filters.stage) {
    values.push(filters.stage);
    clauses.push(`stage = $${values.length}`);
  }

  values.push(limit);
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const result = await withAutomationDb(async (client) =>
    client.query<{ data: QueryOpportunity }>(
      `SELECT data FROM query_opportunities ${where} ORDER BY score DESC LIMIT $${values.length}`,
      values
    )
  );

  return {
    data: result?.rows.map((row: { data: QueryOpportunity }) => row.data) ?? [],
    generatedAt: snapshot.generated_at,
  };
}

export async function listPagesFromDb(filters: {
  locale?: string | null;
  exchangeSlug?: string | null;
  pageType?: string | null;
  stage?: string | null;
}) {
  const snapshot = await getLatestAutomationSnapshotFromDb();
  if (!snapshot) return null;

  const clauses: string[] = [];
  const values: unknown[] = [];

  if (filters.locale) {
    values.push(filters.locale);
    clauses.push(`locale = $${values.length}`);
  }
  if (filters.exchangeSlug) {
    values.push(filters.exchangeSlug);
    clauses.push(`exchange_slug = $${values.length}`);
  }
  if (filters.pageType) {
    values.push(filters.pageType);
    clauses.push(`page_type = $${values.length}`);
  }
  if (filters.stage) {
    values.push(filters.stage);
    clauses.push(`stage = $${values.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const result = await withAutomationDb(async (client) =>
    client.query<SeoPageDbRow>(`SELECT * FROM seo_pages ${where} ORDER BY updated_at DESC`, values)
  );

  return {
    data:
      result?.rows.map((row: SeoPageDbRow) => ({
        id: row.id,
        routePath: row.route_path,
        pageKind: row.page_kind,
        locale: row.locale,
        exchangeSlug: row.exchange_slug,
        pageType: row.page_type,
        topic: row.topic,
        stage: row.stage,
        primaryQuery: row.primary_query,
        qualityScore: row.quality_score,
        opportunityScore: row.opportunity_score,
        publishedAt: row.published_at,
        refreshDueAt: row.refresh_due_at,
        content: row.content,
      })) ?? [],
    generatedAt: snapshot.generated_at,
  };
}

export async function getPageByIdFromDb(id: string) {
  const result = await withAutomationDb(async (client) =>
    client.query<SeoPageDbRow>(`SELECT * FROM seo_pages WHERE id = $1 LIMIT 1`, [id])
  );
  const row = result?.rows[0];
  if (!row) return null;
  return {
    id: row.id,
    routePath: row.route_path,
    pageKind: row.page_kind,
    locale: row.locale,
    exchangeSlug: row.exchange_slug,
    pageType: row.page_type,
    topic: row.topic,
    stage: row.stage,
    primaryQuery: row.primary_query,
    qualityScore: row.quality_score,
    opportunityScore: row.opportunity_score,
    publishedAt: row.published_at,
    refreshDueAt: row.refresh_due_at,
    content: row.content,
  };
}

export async function getPublishedSeoPageFromDb(locale: string, slug: string, pageType: string) {
  const result = await withAutomationDb(async (client) =>
    client.query<SeoPageDbRow>(
      `SELECT * FROM seo_pages
       WHERE page_kind = 'exchange' AND locale = $1 AND exchange_slug = $2 AND page_type = $3 AND stage = 'published'
       LIMIT 1`,
      [locale, slug, pageType]
    )
  );

  return result?.rows[0]?.content ?? null;
}

export async function getBrandPageFromDb(locale: string, topic: string) {
  const result = await withAutomationDb(async (client) =>
    client.query<SeoPageDbRow>(
      `SELECT * FROM seo_pages
       WHERE page_kind = 'brand' AND locale = $1 AND topic = $2 AND stage = 'published'
       LIMIT 1`,
      [locale, topic]
    )
  );

  return result?.rows[0]?.content ?? null;
}

export async function getRoiFromDb(mode: "page" | "query", filters: {
  locale?: string | null;
  exchangeSlug?: string | null;
}) {
  const snapshot = await getLatestAutomationSnapshotFromDb();
  if (!snapshot) return null;

  const source = mode === "page" ? snapshot.snapshot.pageRoiDaily : snapshot.snapshot.queryRoiDaily;
  const data = source
    .filter((item: QueryOpportunity | RoiEntry) => (!filters.locale ? true : item.locale === filters.locale))
    .filter((item: QueryOpportunity | RoiEntry) => (!filters.exchangeSlug ? true : item.exchangeSlug === filters.exchangeSlug));

  return {
    data,
    generatedAt: snapshot.generated_at,
  };
}

export async function listDistributionJobsFromDb(limit = 20) {
  const result = await withAutomationDb(async (client) =>
    client.query<DistributionJobRow>(
      `SELECT * FROM distribution_jobs ORDER BY created_at DESC LIMIT $1`,
      [limit]
    )
  );
  return (result?.rows ?? []).map(toDistributionJob);
}

async function upsertDistributionJobRecord(
  client: PoolClient,
  job: {
    channel: DistributionJob["channel"];
    locale: string;
    exchangeSlug: string | null;
    pageType: string | null;
    topic: string | null;
    routePath: string;
    payload: DistributionJobPayload;
  }
) {
  const defaultStatus = getQueuedStatusForChannel(job.channel);
  return client.query<DistributionJobRow>(
    `INSERT INTO distribution_jobs (
      id, channel, locale, exchange_slug, page_type, topic, route_path, status, payload, updated_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
    ON CONFLICT (channel, locale, route_path) DO UPDATE SET
      payload = EXCLUDED.payload,
      exchange_slug = EXCLUDED.exchange_slug,
      page_type = EXCLUDED.page_type,
      topic = EXCLUDED.topic,
      status = CASE
        WHEN distribution_jobs.status = 'published' THEN distribution_jobs.status
        WHEN distribution_jobs.status = 'in_progress' THEN distribution_jobs.status
        ELSE EXCLUDED.status
      END,
      next_attempt_at = CASE
        WHEN distribution_jobs.status = 'published' THEN distribution_jobs.next_attempt_at
        WHEN distribution_jobs.status = 'in_progress' THEN distribution_jobs.next_attempt_at
        ELSE NULL
      END,
      updated_at = NOW()
    RETURNING *`,
    [
      createStableId("dist", `${job.channel}:${job.locale}:${job.routePath}`),
      job.channel,
      job.locale,
      job.exchangeSlug,
      job.pageType,
      job.topic,
      job.routePath,
      defaultStatus,
      JSON.stringify(job.payload),
    ]
  );
}

const MAX_DISTRIBUTION_RETRY_ATTEMPTS = 5;

async function processDistributionJobs(
  client: PoolClient,
  jobs: DistributionJob[]
) {
  for (const job of jobs) {
    await client.query(
      `UPDATE distribution_jobs
       SET status = 'in_progress', updated_at = NOW(), last_attempt_at = NOW(), error = NULL
       WHERE id = $1`,
      [job.id]
    );

    try {
      const result = await publishDistributionJob(job);
      if (result.ok) {
        await client.query(
          `UPDATE distribution_jobs
           SET status = 'published', published_at = NOW(), updated_at = NOW(), error = NULL,
               next_attempt_at = NULL
           WHERE id = $1`,
          [job.id]
        );
      } else {
        const retryCount =
          result.status === "pending" ? job.retryCount : job.retryCount + 1;
        const shouldRetry =
          result.status !== "pending" && retryCount < MAX_DISTRIBUTION_RETRY_ATTEMPTS;
        const nextAttemptAt = shouldRetry
          ? new Date(
              Date.now() +
                Math.min(
                  24 * 60 * 60 * 1000,
                  15 * 60 * 1000 * 2 ** (retryCount - 1)
                )
            )
          : null;
        await client.query(
          `UPDATE distribution_jobs
           SET status = $2,
               error = $3,
               retry_count = $4,
               next_attempt_at = $5,
               updated_at = NOW()
           WHERE id = $1`,
          [
            job.id,
            shouldRetry ? "queued" : result.status,
            result.error,
            retryCount,
            nextAttemptAt?.toISOString() ?? null,
          ]
        );
      }
    } catch (error) {
      const retryCount = job.retryCount + 1;
      const shouldRetry = retryCount < MAX_DISTRIBUTION_RETRY_ATTEMPTS;
      const nextAttemptAt = shouldRetry
        ? new Date(
            Date.now() +
              Math.min(
                24 * 60 * 60 * 1000,
                15 * 60 * 1000 * 2 ** (retryCount - 1)
              )
          )
        : null;
      await client.query(
        `UPDATE distribution_jobs
         SET status = $2,
             error = $3,
             retry_count = $4,
             next_attempt_at = $5,
             updated_at = NOW()
         WHERE id = $1`,
        [
          job.id,
          shouldRetry ? "queued" : "failed",
          error instanceof Error ? error.message.slice(0, 400) : "未知分发错误",
          retryCount,
          nextAttemptAt?.toISOString() ?? null,
        ]
      );
    }
  }
}

async function syncDistributionFailureAlerts(client: PoolClient) {
  const failureCounts = await client.query<{
    channel: string;
    failures: string;
    queued: string;
  }>(
    `SELECT channel,
            COUNT(*) FILTER (WHERE status = 'failed')::text AS failures,
            COUNT(*) FILTER (WHERE status = 'queued')::text AS queued
     FROM distribution_jobs
     GROUP BY channel`
  );

  for (const row of failureCounts.rows) {
    const failures = Number(row.failures ?? 0);
    const queued = Number(row.queued ?? 0);
    const alertId = `alert-distribution-${row.channel}`;
    if (failures > 0) {
      await upsertOperatorAlert(client, {
        id: alertId,
        level: "warning",
        type: "sync_failure",
        scope: {},
        message: `${row.channel.toUpperCase()} 分发失败 ${failures} 条，仍有 ${queued} 条待重试/排队。`,
        triggeredAt: new Date().toISOString(),
        source: "internal",
        sourceLabel: "Distribution Queue",
      });
    } else {
      await client.query(`DELETE FROM operator_alerts WHERE id = $1`, [alertId]);
    }
  }
}

export async function buildSeoStatsFromDb(locale?: string | null) {
  const snapshot = await getLatestAutomationSnapshotFromDb();
  if (!snapshot) return null;

  const state = snapshot.snapshot;
  const dataReality = getAutomationDataReality(state);
  const topOpportunities = state.opportunities
    .filter((item: QueryOpportunity) => (!locale ? true : item.locale === locale))
    .sort((a: QueryOpportunity, b: QueryOpportunity) => b.score - a.score)
    .slice(0, 10);
  const topRoiPages = state.pageRoiDaily
    .filter((item: RoiEntry) => (!locale ? true : item.locale === locale))
    .sort((a: RoiEntry, b: RoiEntry) => b.commissionsUsd - a.commissionsUsd)
    .slice(0, 10);
  const distributionJobs = await listDistributionJobsFromDb(12);
  const dbAlerts = await listOperatorAlertsFromDb(20);
  const publishedBrandPages = await withAutomationDb(async (client) =>
    client.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM seo_pages WHERE page_kind = 'brand' AND stage = 'published'`)
  );
  const gscDaily = await withAutomationDb(async (client) =>
    client.query<{ impressions: string; clicks: string }>(
      `SELECT COALESCE(SUM(impressions),0)::text AS impressions, COALESCE(SUM(clicks),0)::text AS clicks
       FROM gsc_query_daily WHERE observed_date >= CURRENT_DATE - INTERVAL '28 days'`
    )
  );

  return {
    state: {
      ...state,
      alerts: dbAlerts.length ? dbAlerts : state.alerts,
    },
    dataReality,
    topOpportunities,
    topRoiPages,
    distributionJobs,
    dbAlerts,
    metrics: {
      ...state.metrics,
      publishedBrandPages: Number(publishedBrandPages?.rows[0]?.count ?? 0),
      impressions28d: Number(gscDaily?.rows[0]?.impressions ?? 0),
      clicks28d: Number(gscDaily?.rows[0]?.clicks ?? 0),
    },
  };
}

export async function enqueueDistributionJobsFromDb(state: AutomationState) {
  if (!isAutomationDbEnabled()) return null;

  const brandPages = buildBrandPages(state).slice(0, 12);
  const internalLinkCandidates = getInternalLinkDistributionCandidates(state, 24, 2);
  const candidatePages = state.pages
    .filter(
      (page: AutomationSeoPage) =>
        page.stage === "published" &&
        isFocusLocale(page.locale) &&
        isFocusExchangeSlug(page.exchangeSlug) &&
        isFocusPageType(page.pageType)
    )
    .sort((a: AutomationSeoPage, b: AutomationSeoPage) => b.qualityScore - a.qualityScore)
    .slice(0, 20);

  return withAutomationDb(async (client) => {
    await client.query("BEGIN");
    try {
      for (const page of candidatePages) {
        const routePath = `/exchanges/${page.exchangeSlug}/${page.pageType}`;
        const payload: DistributionJobPayload = {
          title: page.heroTitle,
          summary: page.heroDescription,
          url: `${SITE_URL}/${page.locale}${routePath}`,
          exchangeSlug: page.exchangeSlug,
          pageType: page.pageType,
          primaryQuery: page.primaryQuery,
          source: "page",
          sourceLabel: "焦点新页",
          tags: [
            "page-publish",
            "focus-cluster",
            "search-discovery",
            page.exchangeSlug,
            page.pageType,
          ],
        };
        await upsertDistributionJobRecord(client, {
          channel: "telegram",
          locale: page.locale,
          exchangeSlug: page.exchangeSlug,
          pageType: page.pageType,
          topic: null,
          routePath,
          payload,
        });
        await upsertDistributionJobRecord(client, {
          channel: "x",
          locale: page.locale,
          exchangeSlug: page.exchangeSlug,
          pageType: page.pageType,
          topic: null,
          routePath,
          payload,
        });
      }

      for (const candidate of internalLinkCandidates) {
        const payload: DistributionJobPayload = {
          title: candidate.title,
          summary: candidate.summary,
          url: `${SITE_URL}/${candidate.locale}${candidate.routePath}`,
          exchangeSlug: candidate.exchangeSlug,
          pageType: candidate.pageType,
          primaryQuery: candidate.primaryQuery,
          refreshScore: candidate.score,
          source: "internal-link-refresh",
          sourceLabel: "内链刷新推荐位",
          tags: candidate.tags,
        };
        await upsertDistributionJobRecord(client, {
          channel: "telegram",
          locale: candidate.locale,
          exchangeSlug: candidate.exchangeSlug,
          pageType: candidate.pageType,
          topic: null,
          routePath: candidate.routePath,
          payload,
        });
        await upsertDistributionJobRecord(client, {
          channel: "x",
          locale: candidate.locale,
          exchangeSlug: candidate.exchangeSlug,
          pageType: candidate.pageType,
          topic: null,
          routePath: candidate.routePath,
          payload,
        });
      }

      for (const page of brandPages) {
        const payload: DistributionJobPayload = {
          title: page.heroTitle,
          summary: page.heroDescription,
          url: `${SITE_URL}/${page.locale}${page.routePath}`,
          topic: page.topic,
          primaryQuery: page.metadata.keywords[0] ?? page.metadata.title,
          source: "brand",
          sourceLabel: "品牌页",
          tags: ["brand-page", page.topic],
        };
        await upsertDistributionJobRecord(client, {
          channel: "telegram",
          locale: page.locale,
          exchangeSlug: null,
          pageType: "brand",
          topic: page.topic,
          routePath: page.routePath,
          payload,
        });
        await upsertDistributionJobRecord(client, {
          channel: "x",
          locale: page.locale,
          exchangeSlug: null,
          pageType: "brand",
          topic: page.topic,
          routePath: page.routePath,
          payload,
        });
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }

    return listDistributionJobsFromDb(20);
  });
}

export async function recordGscFocusPageRowFirstSeenEventsFromDb(
  entries: GscFocusPageRowMonitorEntry[]
) {
  if (!isAutomationDbEnabled() || entries.length === 0) {
    return { alertsRecorded: 0, jobs: [] as DistributionJob[] };
  }

  return withAutomationDb(async (client) => {
    await client.query("BEGIN");
    try {
      const jobIds: string[] = [];

      for (const entry of entries) {
        await upsertOperatorAlert(client, buildGscFocusPageRowFirstSeenAlert(entry));

        const reminder = buildGscFocusPageRowTelegramReminder(entry);
        const result = await upsertDistributionJobRecord(client, {
          channel: "telegram",
          locale: reminder.locale,
          exchangeSlug: reminder.exchangeSlug,
          pageType: reminder.pageType,
          topic: null,
          routePath: reminder.routePath,
          payload: reminder.payload,
        });
        const jobId = result.rows[0]?.id;
        if (jobId) {
          jobIds.push(jobId);
        }
      }

      const jobsResult = jobIds.length
        ? await client.query<DistributionJobRow>(
            `SELECT * FROM distribution_jobs
             WHERE id = ANY($1::text[])
               AND status = 'queued'
             ORDER BY created_at ASC`,
            [jobIds]
          )
        : null;
      const jobs = jobsResult?.rows.map(toDistributionJob) ?? [];
      await processDistributionJobs(client, jobs);
      await syncDistributionFailureAlerts(client);
      await client.query("COMMIT");
      return {
        alertsRecorded: entries.length,
        jobs: jobs.length,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function enqueueGscFocusPageRowDailySummaryFromDb(
  entries: GscFocusPageRowMonitorEntry[],
  reportDate: string
) {
  if (!isAutomationDbEnabled()) {
    return { enqueued: 0 };
  }

  return withAutomationDb(async (client) => {
    await client.query("BEGIN");
    try {
      const summary = summarizeGscFocusPageRowMonitor(entries);
      const dailyReport = buildGscFocusPageRowDailyTelegramSummary(
        summary,
        reportDate
      );
      await upsertDistributionJobRecord(client, {
        channel: "telegram",
        locale: dailyReport.locale,
        exchangeSlug: null,
        pageType: null,
        topic: null,
        routePath: dailyReport.routePath,
        payload: dailyReport.payload,
      });
      await client.query("COMMIT");
      return { enqueued: 1 };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function publishQueuedDistributionJobsFromDb(limit = 10) {
  if (!isAutomationDbEnabled()) return null;

  return withAutomationDb(async (client) => {
    const jobsResult = await client.query<DistributionJobRow>(
      `SELECT * FROM distribution_jobs
       WHERE status = 'queued'
         AND (next_attempt_at IS NULL OR next_attempt_at <= NOW())
       ORDER BY created_at ASC
       LIMIT $1`,
      [limit]
    );

    const jobs = jobsResult.rows.map(toDistributionJob);
    await processDistributionJobs(client, jobs);
    await syncDistributionFailureAlerts(client);

    return listDistributionJobsFromDb(20);
  });
}
