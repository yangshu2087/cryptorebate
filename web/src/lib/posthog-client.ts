"use client";

import posthog from "posthog-js";
import { hasAnalyticsConsent } from "./analytics-consent";

type AnalyticsPrimitive = string | number | boolean | null;
export type AnalyticsProperties = Record<
  string,
  AnalyticsPrimitive | undefined
>;

let isInitialized = false;

function canUseBrowser() {
  return typeof window !== "undefined";
}

function getPostHogToken() {
  return process.env.NEXT_PUBLIC_POSTHOG_TOKEN;
}

export function initPostHog() {
  const posthogToken = getPostHogToken();

  if (
    !canUseBrowser() ||
    isInitialized ||
    !posthogToken ||
    !hasAnalyticsConsent()
  ) {
    return false;
  }

  posthog.init(posthogToken, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    defaults: "2026-01-30",
    person_profiles: "identified_only",
  });
  isInitialized = true;

  return true;
}

function isPostHogEnabled() {
  return canUseBrowser() && Boolean(getPostHogToken()) && hasAnalyticsConsent();
}

function sanitizeProperties(properties?: AnalyticsProperties) {
  if (!properties) return undefined;

  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined)
  );
}

export function captureAnalyticsEvent(
  event: string,
  properties?: AnalyticsProperties
) {
  if (!isPostHogEnabled()) return;
  initPostHog();
  if (!isInitialized) return;
  posthog.capture(event, sanitizeProperties(properties));
}
