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
  properties?: AnalyticsProperties;
};

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
