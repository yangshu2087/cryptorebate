import { exchanges } from "@/data/exchanges";

export type GscAuthMode = "service-account" | "refresh-token";
export type PartnerSourceFormat = "json" | "csv";
export type PartnerSyncMode = "combined" | "commissions" | "conversions";
export type PartnerAuthType = "none" | "bearer" | "header";
export type PartnerSyncProvider = "generic" | "csv-portal" | "okx-broker" | "gate-api4";
export type PartnerSyncMethod = "GET" | "POST";
export type PartnerBrokerType = "api" | "oauth";
export type PartnerReportKind = "fd" | "dma";

export type SearchConsoleConfig = {
  enabled: boolean;
  property?: string;
  authMode?: GscAuthMode;
  startDaysAgo: number;
  rowLimit: number;
  serviceAccountJson?: string;
  clientEmail?: string;
  privateKey?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
};

export type PartnerSyncConfig = {
  exchangeSlug: (typeof exchanges)[number]["slug"];
  enabled: boolean;
  provider: PartnerSyncProvider;
  url?: string;
  format: PartnerSourceFormat;
  mode: PartnerSyncMode;
  method: PartnerSyncMethod;
  authType: PartnerAuthType;
  authHeaderName?: string;
  token?: string;
  apiKey?: string;
  apiSecret?: string;
  apiPassphrase?: string;
  brokerType?: PartnerBrokerType;
  reportKind?: PartnerReportKind;
  windowDays: number;
  requestBody?: string;
  fallbackAttribution: {
    locale: string;
    pageType: string;
  };
};

function parseBoolean(value: string | undefined, fallback = false) {
  if (value == null) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function parseNumber(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseServiceAccountJson() {
  const raw = process.env.AUTOMATION_GSC_SERVICE_ACCOUNT_JSON;
  if (raw) return raw;

  const base64 = process.env.AUTOMATION_GSC_SERVICE_ACCOUNT_JSON_BASE64;
  if (!base64) return undefined;

  try {
    return Buffer.from(base64, "base64").toString("utf8");
  } catch {
    return undefined;
  }
}

export function getSearchConsoleConfig(): SearchConsoleConfig {
  const authMode = process.env.AUTOMATION_GSC_AUTH_MODE as GscAuthMode | undefined;
  const serviceAccountJson = parseServiceAccountJson();

  return {
    enabled: parseBoolean(process.env.AUTOMATION_GSC_ENABLED, false),
    property: process.env.AUTOMATION_GSC_PROPERTY,
    authMode,
    startDaysAgo: parseNumber(process.env.AUTOMATION_GSC_START_DAYS_AGO, 28),
    rowLimit: parseNumber(process.env.AUTOMATION_GSC_ROW_LIMIT, 1000),
    serviceAccountJson,
    clientEmail: process.env.AUTOMATION_GSC_CLIENT_EMAIL,
    privateKey: process.env.AUTOMATION_GSC_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    clientId: process.env.AUTOMATION_GSC_CLIENT_ID,
    clientSecret: process.env.AUTOMATION_GSC_CLIENT_SECRET,
    refreshToken: process.env.AUTOMATION_GSC_REFRESH_TOKEN,
  };
}

function getPartnerConfigForExchange(
  slug: (typeof exchanges)[number]["slug"]
): PartnerSyncConfig {
  const prefix = `AUTOMATION_PARTNER_${slug.toUpperCase().replace(/-/g, "_")}`;
  const provider =
    (process.env[`${prefix}_PROVIDER`] as PartnerSyncProvider | undefined) ?? "generic";
  const format =
    (process.env[`${prefix}_FORMAT`] as PartnerSourceFormat | undefined) ?? "json";
  const mode =
    (process.env[`${prefix}_MODE`] as PartnerSyncMode | undefined) ?? "combined";
  const method =
    (process.env[`${prefix}_METHOD`] as PartnerSyncMethod | undefined) ?? "GET";
  const authType =
    (process.env[`${prefix}_AUTH_TYPE`] as PartnerAuthType | undefined) ?? "none";
  const reportKind =
    (process.env[`${prefix}_REPORT_KIND`] as PartnerReportKind | undefined) ?? undefined;
  const brokerType =
    (process.env[`${prefix}_BROKER_TYPE`] as PartnerBrokerType | undefined) ?? undefined;

  return {
    exchangeSlug: slug,
    enabled: parseBoolean(process.env[`${prefix}_ENABLED`], false),
    provider,
    url: process.env[`${prefix}_URL`],
    format,
    mode,
    method,
    authType,
    authHeaderName: process.env[`${prefix}_AUTH_HEADER`] ?? "X-API-Key",
    token: process.env[`${prefix}_TOKEN`],
    apiKey: process.env[`${prefix}_KEY`],
    apiSecret: process.env[`${prefix}_SECRET`],
    apiPassphrase: process.env[`${prefix}_PASSPHRASE`],
    brokerType,
    reportKind,
    windowDays: parseNumber(process.env[`${prefix}_WINDOW_DAYS`], 30),
    requestBody: process.env[`${prefix}_BODY_JSON`],
    fallbackAttribution: {
      locale: process.env[`${prefix}_FALLBACK_LOCALE`] ?? "en",
      pageType: process.env[`${prefix}_FALLBACK_PAGE_TYPE`] ?? "official-site",
    },
  };
}

export function getPartnerSyncConfigs() {
  return exchanges.map((exchange) => getPartnerConfigForExchange(exchange.slug));
}
