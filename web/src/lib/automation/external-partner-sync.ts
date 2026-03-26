import { parse as parseCsv } from "csv-parse/sync";
import type { CommissionEvent, ConversionEvent, ExternalPartnerSyncState } from "./types";
import type { PartnerSyncConfig } from "./external-config";

type PartnerPayload = {
  conversions?: unknown[];
  commissions?: unknown[];
};

function getHeaderMap(config: PartnerSyncConfig) {
  const headers: Record<string, string> = {};

  if (config.authType === "bearer" && config.token) {
    headers.Authorization = `Bearer ${config.token}`;
    return headers;
  }

  if (config.authType === "header" && config.token) {
    headers[config.authHeaderName ?? "X-API-Key"] = config.token;
    return headers;
  }

  return headers;
}

function buildClusterId(
  exchangeSlug: string,
  locale?: string,
  pageType?: string,
  queryClusterId?: string
) {
  if (queryClusterId) return queryClusterId;
  if (!locale || !pageType) return undefined;
  return `cluster-${locale}-${exchangeSlug}-${pageType}`;
}

function normaliseConversionRow(
  exchangeSlug: string,
  row: Record<string, unknown>,
  index: number
): ConversionEvent | null {
  const locale = String(row.locale ?? row.lang ?? "").trim() || undefined;
  const pageType = String(row.pageType ?? row.page_type ?? "").trim() || undefined;
  const queryClusterId = buildClusterId(
    exchangeSlug,
    locale,
    pageType,
    String(row.queryClusterId ?? row.query_cluster_id ?? "").trim() || undefined
  );
  const registeredAt = String(
    row.registeredAt ?? row.registered_at ?? row.date ?? row.timestamp ?? ""
  ).trim();

  if (!queryClusterId || !registeredAt) return null;

  return {
    id: String(row.id ?? `${exchangeSlug}-conversion-${index}`),
    exchangeSlug,
    queryClusterId,
    registeredAt,
    tradedAt:
      String(row.tradedAt ?? row.traded_at ?? "").trim() || undefined,
    firstDepositUsd: Number(row.firstDepositUsd ?? row.first_deposit_usd ?? 0) || undefined,
    status:
      (String(row.status ?? "registered").trim() as ConversionEvent["status"]) ??
      "registered",
  };
}

function normaliseCommissionRow(
  exchangeSlug: string,
  row: Record<string, unknown>,
  index: number,
  source: CommissionEvent["source"]
): CommissionEvent | null {
  const locale = String(row.locale ?? row.lang ?? "").trim() || undefined;
  const pageType = String(row.pageType ?? row.page_type ?? "").trim() || undefined;
  const queryClusterId = buildClusterId(
    exchangeSlug,
    locale,
    pageType,
    String(row.queryClusterId ?? row.query_cluster_id ?? "").trim() || undefined
  );
  const recordedAt = String(
    row.recordedAt ?? row.recorded_at ?? row.date ?? row.timestamp ?? ""
  ).trim();
  const commissionUsd = Number(
    row.commissionUsd ?? row.commission_usd ?? row.amount ?? row.commission ?? 0
  );

  if (!queryClusterId || !recordedAt || !Number.isFinite(commissionUsd)) return null;

  return {
    id: String(row.id ?? `${exchangeSlug}-commission-${index}`),
    exchangeSlug,
    queryClusterId,
    commissionUsd,
    recordedAt,
    source,
  };
}

export function normalisePartnerPayload(
  exchangeSlug: string,
  payload: PartnerPayload | Record<string, unknown>[] | string,
  format: PartnerSyncConfig["format"]
) {
  let rows: Record<string, unknown>[] = [];
  let mode: "array" | "object" = "object";

  if (format === "csv") {
    rows = parseCsv(payload as string, {
      columns: true,
      skip_empty_lines: true,
    }) as Record<string, unknown>[];
    mode = "array";
  } else if (Array.isArray(payload)) {
    rows = payload as Record<string, unknown>[];
    mode = "array";
  }

  const conversions =
    mode === "array"
      ? (rows
          .map((row, index) => normaliseConversionRow(exchangeSlug, row, index))
          .filter(Boolean) as ConversionEvent[])
      : ((((payload as PartnerPayload).conversions ?? []) as Record<string, unknown>[])
          .map((row, index) => normaliseConversionRow(exchangeSlug, row, index))
          .filter(Boolean) as ConversionEvent[]);

  const commissions =
    mode === "array"
      ? (rows
          .map((row, index) =>
            normaliseCommissionRow(exchangeSlug, row, index, format === "csv" ? "csv" : "api")
          )
          .filter(Boolean) as CommissionEvent[])
      : ((((payload as PartnerPayload).commissions ?? []) as Record<string, unknown>[])
          .map((row, index) => normaliseCommissionRow(exchangeSlug, row, index, "api"))
          .filter(Boolean) as CommissionEvent[]);

  return { conversions, commissions };
}

export async function syncPartnerSource(
  config: PartnerSyncConfig
): Promise<{
  conversions: ConversionEvent[];
  commissions: CommissionEvent[];
  report: ExternalPartnerSyncState;
}> {
  if (!config.enabled) {
    return {
      conversions: [],
      commissions: [],
      report: {
        exchangeSlug: config.exchangeSlug,
        enabled: false,
        configured: false,
        status: "disabled",
        recordsFetched: 0,
        conversionsWritten: 0,
        commissionsWritten: 0,
      },
    };
  }

  if (!config.url) {
    return {
      conversions: [],
      commissions: [],
      report: {
        exchangeSlug: config.exchangeSlug,
        enabled: true,
        configured: false,
        status: "skipped",
        format: config.format,
        mode: config.mode,
        recordsFetched: 0,
        conversionsWritten: 0,
        commissionsWritten: 0,
        error: "Missing partner sync URL",
      },
    };
  }

  try {
    const response = await fetch(config.url, {
      headers: {
        ...getHeaderMap(config),
        Accept: config.format === "json" ? "application/json" : "text/csv",
      },
    });

    if (!response.ok) {
      throw new Error(`Partner sync failed (${response.status})`);
    }

    const payload =
      config.format === "json"
        ? ((await response.json()) as PartnerPayload | Record<string, unknown>[])
        : await response.text();

    const { conversions, commissions } = normalisePartnerPayload(
      config.exchangeSlug,
      payload,
      config.format
    );
    const totalRecords = conversions.length + commissions.length;

    return {
      conversions,
      commissions,
      report: {
        exchangeSlug: config.exchangeSlug,
        enabled: true,
        configured: true,
        status: "success",
        format: config.format,
        mode: config.mode,
        lastSyncAt: new Date().toISOString(),
        recordsFetched: totalRecords,
        conversionsWritten: conversions.length,
        commissionsWritten: commissions.length,
      },
    };
  } catch (error) {
    return {
      conversions: [],
      commissions: [],
      report: {
        exchangeSlug: config.exchangeSlug,
        enabled: true,
        configured: true,
        status: "failed",
        format: config.format,
        mode: config.mode,
        recordsFetched: 0,
        conversionsWritten: 0,
        commissionsWritten: 0,
        error: error instanceof Error ? error.message : "Unknown partner sync error",
      },
    };
  }
}
