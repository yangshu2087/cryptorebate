"use client";

import { hasAnalyticsConsent } from "./analytics-consent";
import type { AnalyticsProperties } from "./posthog-client";

type ClickLogPayload = {
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
  properties?: AnalyticsProperties;
};

const VISITOR_ID_KEY = "cryptorebate_visitor_id";
const SESSION_ID_KEY = "cryptorebate_session_id";

function getStorageValue(key: string) {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage.getItem(key) ?? undefined;
  } catch {
    return undefined;
  }
}

function setStorageValue(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore storage failures
  }
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 12)}`;
}

function getOrCreateVisitorId() {
  const existing = getStorageValue(VISITOR_ID_KEY);
  if (existing) return existing;
  const created = createId("v");
  setStorageValue(VISITOR_ID_KEY, created);
  return created;
}

function getOrCreateSessionId() {
  const existing = getStorageValue(SESSION_ID_KEY);
  if (existing) return existing;
  const created = createId("s");
  setStorageValue(SESSION_ID_KEY, created);
  return created;
}

function sanitizeProperties(properties?: AnalyticsProperties) {
  if (!properties) return undefined;

  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined)
  ) as AnalyticsProperties;
}

function removeUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  ) as T;
}

function pickStringProperty(
  properties: AnalyticsProperties | undefined,
  keys: string[]
) {
  if (!properties) return undefined;
  for (const key of keys) {
    const value = properties[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return undefined;
}

export function buildClickLogPayload(
  event: string,
  properties?: AnalyticsProperties,
  options?: {
    currentUrl?: string;
    referrer?: string;
    targetUrl?: string;
    timestamp?: string;
  }
): ClickLogPayload {
  const fallbackCurrentUrl =
    typeof window !== "undefined" ? window.location.href : "";
  const fallbackReferrer =
    typeof document !== "undefined" ? document.referrer : "";
  const currentUrl = options?.currentUrl ?? fallbackCurrentUrl;
  const referrer = options?.referrer ?? fallbackReferrer;
  const current = currentUrl ? new URL(currentUrl) : null;
  const locale =
    pickStringProperty(properties, ["content_locale", "locale"]) ??
    current?.pathname.split("/").filter(Boolean)[0] ??
    undefined;
  const exchangeSlug = pickStringProperty(properties, [
    "content_exchange_slug",
    "exchange_slug",
    "exchange",
  ]);
  const pageType = pickStringProperty(properties, [
    "content_page_type",
    "page_type",
  ]);
  const queryClusterId = pickStringProperty(properties, [
    "content_cluster",
    "query_cluster_id",
  ]);
  const primaryQuery = pickStringProperty(properties, [
    "content_primary_query",
    "primary_query",
  ]);
  const landingPageKey =
    pickStringProperty(properties, ["landing_page_key"]) ??
    ([locale, exchangeSlug, pageType].filter(Boolean).join(":") || undefined);
  const ctaTargetType = pickStringProperty(properties, [
    "cta_target_type",
    "target_type",
  ]);

  return removeUndefined({
    event,
    timestamp: options?.timestamp ?? new Date().toISOString(),
    page_url: current?.toString() ?? currentUrl,
    referrer,
    target_url: options?.targetUrl,
    utm_source: current?.searchParams.get("utm_source") ?? undefined,
    utm_medium: current?.searchParams.get("utm_medium") ?? undefined,
    utm_campaign: current?.searchParams.get("utm_campaign") ?? undefined,
    utm_content: current?.searchParams.get("utm_content") ?? undefined,
    utm_term: current?.searchParams.get("utm_term") ?? undefined,
    locale,
    exchange_slug: exchangeSlug,
    page_type: pageType,
    query_cluster_id: queryClusterId,
    primary_query: primaryQuery,
    landing_page_key: landingPageKey,
    cta_target_type: ctaTargetType,
    session_id: getOrCreateSessionId(),
    visitor_id: getOrCreateVisitorId(),
    properties: sanitizeProperties(properties),
  });
}

export function queueClickLog(
  event: string,
  properties?: AnalyticsProperties,
  options?: {
    targetUrl?: string;
  }
) {
  if (!hasAnalyticsConsent() || typeof window === "undefined") return;

  const payload = buildClickLogPayload(event, properties, {
    targetUrl: options?.targetUrl,
  });
  const body = JSON.stringify(payload);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const queued = navigator.sendBeacon(
      "/api/clicks",
      new Blob([body], { type: "application/json" })
    );

    if (queued) return;
  }

  void fetch("/api/clicks", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
