export const ANALYTICS_CONSENT_STORAGE_KEY =
  "cryptorebate.analytics_consent";
export const ANALYTICS_CONSENT_COOKIE_KEY =
  "cryptorebate_analytics_consent";

export type AnalyticsConsentStatus = "granted" | "denied";

function canUseBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function readCookie(name: string) {
  if (!canUseBrowser()) return null;

  const cookies = document.cookie.split("; ");
  const match = cookies.find((entry) => entry.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

export function getAnalyticsConsent(): AnalyticsConsentStatus | null {
  if (!canUseBrowser()) return null;

  const stored = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
  if (stored === "granted" || stored === "denied") {
    return stored;
  }

  const cookieValue = readCookie(ANALYTICS_CONSENT_COOKIE_KEY);
  if (cookieValue === "granted" || cookieValue === "denied") {
    return cookieValue;
  }

  return null;
}

export function hasAnalyticsConsent() {
  return getAnalyticsConsent() === "granted";
}

export function setAnalyticsConsent(status: AnalyticsConsentStatus) {
  if (!canUseBrowser()) return;

  window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, status);
  document.cookie = `${ANALYTICS_CONSENT_COOKIE_KEY}=${encodeURIComponent(
    status
  )}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`;

  window.dispatchEvent(
    new CustomEvent("cryptorebate:analytics-consent", {
      detail: { status },
    })
  );
}
