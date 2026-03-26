import crypto from "node:crypto";
import { Pool, type PoolClient, type QueryResultRow } from "pg";

let pool: Pool | null = null;
let schemaReady = false;

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS gsc_query_daily (
  id BIGSERIAL PRIMARY KEY,
  observed_date DATE NOT NULL,
  locale TEXT NOT NULL,
  exchange_slug TEXT NOT NULL,
  page_type TEXT NOT NULL,
  page_path TEXT,
  page_url TEXT,
  query TEXT NOT NULL,
  intent TEXT,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  ctr DOUBLE PRECISION NOT NULL DEFAULT 0,
  position DOUBLE PRECISION NOT NULL DEFAULT 0,
  country TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (observed_date, locale, exchange_slug, page_type, page_path, query, country)
);

CREATE TABLE IF NOT EXISTS query_clusters (
  id TEXT PRIMARY KEY,
  locale TEXT NOT NULL,
  exchange_slug TEXT NOT NULL,
  intent TEXT NOT NULL,
  page_type TEXT NOT NULL,
  primary_query TEXT,
  score DOUBLE PRECISION NOT NULL DEFAULT 0,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS query_opportunities (
  id TEXT PRIMARY KEY,
  cluster_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  exchange_slug TEXT NOT NULL,
  intent TEXT NOT NULL,
  page_type TEXT NOT NULL,
  primary_query TEXT NOT NULL,
  score DOUBLE PRECISION NOT NULL DEFAULT 0,
  stage TEXT NOT NULL,
  quality_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  projected_epc_usd DOUBLE PRECISION NOT NULL DEFAULT 0,
  projected_monthly_revenue_usd DOUBLE PRECISION NOT NULL DEFAULT 0,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seo_pages (
  id TEXT PRIMARY KEY,
  page_kind TEXT NOT NULL,
  route_path TEXT NOT NULL,
  locale TEXT NOT NULL,
  exchange_slug TEXT,
  page_type TEXT NOT NULL,
  topic TEXT,
  stage TEXT NOT NULL,
  primary_query TEXT,
  quality_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  opportunity_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  refresh_due_at TIMESTAMPTZ,
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS page_versions (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL REFERENCES seo_pages(id) ON DELETE CASCADE,
  version_hash TEXT NOT NULL,
  content JSONB NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (page_id, version_hash)
);

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id TEXT PRIMARY KEY,
  clicked_at TIMESTAMPTZ NOT NULL,
  page_url TEXT NOT NULL,
  referrer TEXT,
  locale TEXT,
  exchange_slug TEXT,
  page_type TEXT,
  query_cluster_id TEXT,
  landing_page_key TEXT,
  primary_query TEXT,
  visitor_id TEXT,
  session_id TEXT,
  target_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  source TEXT,
  data_source TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversion_events (
  id TEXT PRIMARY KEY,
  exchange_slug TEXT NOT NULL,
  query_cluster_id TEXT NOT NULL,
  locale TEXT,
  page_type TEXT,
  landing_page_key TEXT,
  visitor_id TEXT,
  session_id TEXT,
  registered_at TIMESTAMPTZ NOT NULL,
  traded_at TIMESTAMPTZ,
  first_deposit_usd DOUBLE PRECISION,
  status TEXT NOT NULL,
  source TEXT,
  data_source TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS commission_events (
  id TEXT PRIMARY KEY,
  exchange_slug TEXT NOT NULL,
  query_cluster_id TEXT NOT NULL,
  locale TEXT,
  page_type TEXT,
  landing_page_key TEXT,
  visitor_id TEXT,
  session_id TEXT,
  commission_usd DOUBLE PRECISION NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL,
  data_source TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sync_runs (
  id TEXT PRIMARY KEY,
  job TEXT NOT NULL,
  status TEXT NOT NULL,
  summary TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS operator_alerts (
  id TEXT PRIMARY KEY,
  level TEXT NOT NULL,
  type TEXT NOT NULL,
  scope JSONB NOT NULL DEFAULT '{}'::jsonb,
  message TEXT NOT NULL,
  href TEXT,
  source TEXT,
  source_label TEXT,
  triggered_at TIMESTAMPTZ NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS distribution_jobs (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL,
  locale TEXT NOT NULL,
  exchange_slug TEXT,
  page_type TEXT,
  topic TEXT,
  route_path TEXT NOT NULL,
  status TEXT NOT NULL,
  payload JSONB NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  next_attempt_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  UNIQUE (channel, locale, route_path)
);

CREATE TABLE IF NOT EXISTS automation_snapshots (
  id TEXT PRIMARY KEY,
  generated_at TIMESTAMPTZ NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gsc_query_daily_locale_exchange ON gsc_query_daily(locale, exchange_slug, page_type);
CREATE INDEX IF NOT EXISTS idx_query_opportunities_score ON query_opportunities(score DESC);
CREATE INDEX IF NOT EXISTS idx_seo_pages_lookup ON seo_pages(locale, exchange_slug, page_type, stage);
CREATE UNIQUE INDEX IF NOT EXISTS idx_seo_pages_locale_route_path ON seo_pages(locale, route_path);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_cluster ON affiliate_clicks(query_cluster_id, exchange_slug, locale, page_type);
CREATE INDEX IF NOT EXISTS idx_conversion_events_cluster ON conversion_events(query_cluster_id, exchange_slug);
CREATE INDEX IF NOT EXISTS idx_commission_events_cluster ON commission_events(query_cluster_id, exchange_slug);
CREATE INDEX IF NOT EXISTS idx_sync_runs_job_completed ON sync_runs(job, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_distribution_jobs_status ON distribution_jobs(status, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_distribution_jobs_channel_locale_route_path
  ON distribution_jobs(channel, locale, route_path);
`;

export function isAutomationDbEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

export function createStableId(prefix: string, raw: string) {
  const hash = crypto.createHash("sha1").update(raw).digest("hex").slice(0, 20);
  return `${prefix}-${hash}`;
}

function getSslConfig() {
  const mode = process.env.AUTOMATION_DB_SSL?.toLowerCase();
  if (!mode || mode === "false" || mode === "off" || mode === "0") {
    return undefined;
  }

  return { rejectUnauthorized: false };
}

export function getAutomationDbPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: getSslConfig(),
      max: 4,
    });
  }

  return pool;
}

export async function ensureAutomationDbSchema() {
  const db = getAutomationDbPool();
  if (!db || schemaReady) {
    return;
  }

  await db.query(SCHEMA_SQL);
  await db.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'seo_pages_route_path_key'
      ) THEN
        ALTER TABLE seo_pages DROP CONSTRAINT seo_pages_route_path_key;
      END IF;

      IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'distribution_jobs_channel_route_path_key'
      ) THEN
        ALTER TABLE distribution_jobs DROP CONSTRAINT distribution_jobs_channel_route_path_key;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'distribution_jobs' AND column_name = 'retry_count'
      ) THEN
        ALTER TABLE distribution_jobs ADD COLUMN retry_count INTEGER NOT NULL DEFAULT 0;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'distribution_jobs' AND column_name = 'last_attempt_at'
      ) THEN
        ALTER TABLE distribution_jobs ADD COLUMN last_attempt_at TIMESTAMPTZ;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'distribution_jobs' AND column_name = 'next_attempt_at'
      ) THEN
        ALTER TABLE distribution_jobs ADD COLUMN next_attempt_at TIMESTAMPTZ;
      END IF;
    END
    $$;
  `);
  schemaReady = true;
}

export async function withAutomationDb<T>(
  runner: (client: PoolClient) => Promise<T>
): Promise<T | null> {
  const db = getAutomationDbPool();
  if (!db) {
    return null;
  }

  await ensureAutomationDbSchema();
  const client = await db.connect();
  try {
    return await runner(client);
  } finally {
    client.release();
  }
}

export async function queryAutomationDb<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = []
) {
  const db = getAutomationDbPool();
  if (!db) {
    return null;
  }

  await ensureAutomationDbSchema();
  return db.query<T>(text, values);
}
