export const SITE_NAME = "CryptoRebate";
export const SITE_URL = "https://cryptorebate.app";
export const SITE_TAGLINE_ZH = "先拿到更好的返佣，再注册交易所";
export const SITE_TAGLINE_EN = "Get a better rebate before you join an exchange";
export const SITE_DESCRIPTION_ZH = "聚合交易所返佣活动、邀请码与费率信息，帮你在注册前更快找到更划算的方案，少走弯路，长期交易更省。";
export const SITE_DESCRIPTION_EN = "We aggregate rebate offers, invite codes, and fee information across exchanges, helping you find a more rewarding signup option before registration and save more over time.";

export const LOCALES = ["en", "zh", "zh-tw", "ja", "ko", "ru", "es", "pt", "vi", "th", "hi"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  zh: "简体中文",
  "zh-tw": "繁體中文",
  ja: "日本語",
  ko: "한국어",
  ru: "Русский",
  es: "Español",
  pt: "Português",
  vi: "Tiếng Việt",
  th: "ไทย",
  hi: "हिन्दी",
};

export const LOCALE_LANGUAGE_TAGS: Record<Locale, string> = {
  en: "en-US",
  zh: "zh-CN",
  "zh-tw": "zh-TW",
  ja: "ja-JP",
  ko: "ko-KR",
  ru: "ru-RU",
  es: "es-ES",
  pt: "pt-PT",
  vi: "vi-VN",
  th: "th-TH",
  hi: "hi-IN",
};

export const NAV_ITEMS = [
  { href: "/exchanges", labelKey: "nav.exchanges" },
  { href: "/calculator", labelKey: "nav.calculator" },
  { href: "/about", labelKey: "nav.about" },
] as const;
