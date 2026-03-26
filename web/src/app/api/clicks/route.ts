import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { appendClicksToDisk } from "@/lib/automation/persistence";
import { getExchangeBySlug } from "@/data/exchanges";

type ClickPayload = {
  event: string;
  timestamp: string;
  page_url: string;
  referrer: string;
  target_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  locale?: string;
  exchange_slug?: string;
  page_type?: string;
  query_cluster_id?: string;
  primary_query?: string;
  landing_page_key?: string;
  cta_target_type?: string;
  session_id?: string;
  visitor_id?: string;
  properties?: Record<string, string | number | boolean | null>;
};

function sanitizeString(value: unknown, maxLength = 1024) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function sanitizeProperties(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const sanitized: NonNullable<ClickPayload["properties"]> = {};

  for (const [key, entry] of Object.entries(value)) {
    if (entry === null) {
      sanitized[key] = null;
      continue;
    }

    if (
      typeof entry === "string" ||
      typeof entry === "number" ||
      typeof entry === "boolean"
    ) {
      sanitized[key] = typeof entry === "string" ? entry.slice(0, 512) : entry;
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

function sanitizeClickPayload(body: unknown): ClickPayload | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  const event = sanitizeString((body as Record<string, unknown>).event, 120);
  const timestamp = sanitizeString(
    (body as Record<string, unknown>).timestamp,
    64
  );
  const pageUrl = sanitizeString(
    (body as Record<string, unknown>).page_url,
    2048
  );
  const referrer =
    sanitizeString((body as Record<string, unknown>).referrer, 2048) ?? "";

  if (!event || !timestamp || !pageUrl) {
    return null;
  }

  return {
    event,
    timestamp,
    page_url: pageUrl,
    referrer,
    target_url: sanitizeString(
      (body as Record<string, unknown>).target_url,
      2048
    ),
    utm_source: sanitizeString((body as Record<string, unknown>).utm_source, 256),
    utm_medium: sanitizeString((body as Record<string, unknown>).utm_medium, 256),
    utm_campaign: sanitizeString(
      (body as Record<string, unknown>).utm_campaign,
      256
    ),
    utm_content: sanitizeString(
      (body as Record<string, unknown>).utm_content,
      256
    ),
    utm_term: sanitizeString((body as Record<string, unknown>).utm_term, 256),
    locale: sanitizeString((body as Record<string, unknown>).locale, 32),
    exchange_slug: sanitizeString(
      (body as Record<string, unknown>).exchange_slug,
      64
    ),
    page_type: sanitizeString((body as Record<string, unknown>).page_type, 128),
    query_cluster_id: sanitizeString(
      (body as Record<string, unknown>).query_cluster_id,
      256
    ),
    primary_query: sanitizeString(
      (body as Record<string, unknown>).primary_query,
      256
    ),
    landing_page_key: sanitizeString(
      (body as Record<string, unknown>).landing_page_key,
      256
    ),
    cta_target_type: sanitizeString(
      (body as Record<string, unknown>).cta_target_type,
      64
    ),
    session_id: sanitizeString(
      (body as Record<string, unknown>).session_id,
      128
    ),
    visitor_id: sanitizeString(
      (body as Record<string, unknown>).visitor_id,
      128
    ),
    properties: sanitizeProperties((body as Record<string, unknown>).properties),
  };
}

function deriveAttribution(payload: ClickPayload) {
  const exchangeSlug =
    payload.exchange_slug ??
    (typeof payload.properties?.content_exchange_slug === "string"
      ? payload.properties.content_exchange_slug
      : undefined);
  const locale =
    payload.locale ??
    (typeof payload.properties?.content_locale === "string"
      ? payload.properties.content_locale
      : undefined);
  const pageType =
    payload.page_type ??
    (typeof payload.properties?.content_page_type === "string"
      ? payload.properties.content_page_type
      : undefined);
  const queryClusterId =
    payload.query_cluster_id ??
    (typeof payload.properties?.content_cluster === "string"
      ? payload.properties.content_cluster
      : undefined);
  const primaryQuery =
    payload.primary_query ??
    (typeof payload.properties?.content_primary_query === "string"
      ? payload.properties.content_primary_query
      : undefined);

  return {
    exchangeSlug,
    locale,
    pageType,
    queryClusterId,
    primaryQuery,
    landingPageKey:
      payload.landing_page_key ??
      ([locale, exchangeSlug, pageType].filter(Boolean).join(":") || undefined),
    ctaTargetType: payload.cta_target_type,
    sessionId: payload.session_id,
    visitorId: payload.visitor_id,
  };
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = sanitizeClickPayload(body);
  if (!payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const requestHeaders = await headers();
  const attribution = deriveAttribution(payload);
  console.info(
    "[cryptorebate.click]",
    JSON.stringify({
      ...payload,
      attribution,
      request_meta: {
        host: requestHeaders.get("host"),
        user_agent: sanitizeString(requestHeaders.get("user-agent"), 256),
        country: sanitizeString(requestHeaders.get("x-vercel-ip-country"), 8),
      },
    })
  );

  if (
    process.env.VERCEL !== "1" &&
    attribution.exchangeSlug &&
    attribution.locale &&
    attribution.pageType &&
    attribution.queryClusterId
  ) {
    try {
      const exchange = getExchangeBySlug(attribution.exchangeSlug);
      if (!exchange) {
        throw new Error(`Unknown exchange slug: ${attribution.exchangeSlug}`);
      }
      await appendClicksToDisk([
        {
          exchangeSlug: exchange.slug,
          locale: attribution.locale,
          pageType: attribution.pageType,
          pageUrl: payload.page_url,
          queryClusterId: attribution.queryClusterId,
          clickedAt: payload.timestamp,
          source: "client",
          dataSource: "real",
          targetUrl: payload.target_url,
          sessionId: attribution.sessionId,
          visitorId: attribution.visitorId,
          primaryQuery: attribution.primaryQuery,
          utmSource: payload.utm_source,
          utmMedium: payload.utm_medium,
          utmCampaign: payload.utm_campaign,
          utmContent: payload.utm_content,
          utmTerm: payload.utm_term,
          referrer: payload.referrer,
        },
      ]);
    } catch (error) {
      console.warn(
        "[cryptorebate.click.persist_failed]",
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  return NextResponse.json({ ok: true }, { status: 202 });
}
