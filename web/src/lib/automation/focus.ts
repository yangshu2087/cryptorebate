import type { Exchange } from "@/types/exchange";

export const FOCUS_EXCHANGE_SLUGS = ["binance", "kucoin", "okx"] as const;
export const FOCUS_LOCALES = ["en", "hi", "th"] as const;
export const FOCUS_PAGE_TYPES = [
  "official-site",
  "referral-code",
  "signup-kyc",
  "fees-rebate",
] as const;
export const HOLD_PAGE_TYPES = [
  "login",
  "proof-of-reserves",
  "new-listings",
  "trading-bot",
  "copy-trading",
  "deposit-withdrawal",
  "verification-troubleshooting",
] as const;

export type OpportunityFocusLane = "focus" | "background" | "hold";

type FocusInput = {
  locale: string;
  exchangeSlug: Exchange["slug"];
  pageType: string;
  score?: number;
};

export function isFocusLocale(locale: string) {
  return FOCUS_LOCALES.includes(locale as (typeof FOCUS_LOCALES)[number]);
}

export function isFocusExchangeSlug(exchangeSlug: string) {
  return FOCUS_EXCHANGE_SLUGS.includes(
    exchangeSlug as (typeof FOCUS_EXCHANGE_SLUGS)[number]
  );
}

export function isFocusPageType(pageType: string) {
  return FOCUS_PAGE_TYPES.includes(pageType as (typeof FOCUS_PAGE_TYPES)[number]);
}

export function isHoldPageType(pageType: string) {
  return HOLD_PAGE_TYPES.includes(pageType as (typeof HOLD_PAGE_TYPES)[number]);
}

export function getOpportunityFocusLane({
  locale,
  exchangeSlug,
  pageType,
}: FocusInput): OpportunityFocusLane {
  if (isHoldPageType(pageType)) {
    return "hold";
  }

  if (
    isFocusLocale(locale) &&
    isFocusExchangeSlug(exchangeSlug) &&
    isFocusPageType(pageType)
  ) {
    return "focus";
  }

  return "background";
}

export function getDiscoveryPriority(input: FocusInput) {
  const lane = getOpportunityFocusLane(input);
  const laneBoost =
    lane === "focus" ? 20_000 : lane === "background" ? 8_000 : -8_000;
  const pageTypeBoost = isFocusPageType(input.pageType) ? 1_200 : 0;
  const scoreBoost = Math.round((input.score ?? 0) * 2);
  return laneBoost + pageTypeBoost + scoreBoost;
}
