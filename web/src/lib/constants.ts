export const SITE_NAME = "CryptoRebate";
export const SITE_URL = "https://cryptorebate.app";
export const SITE_DESCRIPTION_ZH = "全球加密货币交易所返佣平台 — 通过 CryptoRebate 注册交易所，享受最高手续费返佣，省钱从这里开始。";
export const SITE_DESCRIPTION_EN = "Global crypto exchange rebate platform — Register through CryptoRebate to get the highest trading fee rebates and save on every trade.";

export const LOCALES = ["zh", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "zh";

export const NAV_ITEMS = [
  { href: "/exchanges", labelKey: "nav.exchanges" },
  { href: "/calculator", labelKey: "nav.calculator" },
  { href: "/about", labelKey: "nav.about" },
] as const;
