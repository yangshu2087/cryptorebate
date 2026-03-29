import { getExchangeBySlug } from "@/data/exchanges";
import type { UnifiedSeoEntry } from "./catalog";

export type SerpBlockModel = {
  domainCheck: {
    officialDomain: string;
    referralDomain: string;
    warning: string;
  };
  comparisonRows: Array<{
    exchangeSlug: string;
    exchangeName: string;
    spotRebate: string;
    spotFees: string;
    kyc: string;
  }>;
  signupSteps: string[];
  regionSummary: string;
  regionRestrictions: string[];
};

function toDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function formatPercent(value: number, decimals = 2) {
  return `${(value * 100).toFixed(decimals)}%`;
}

function formatKyc(value: string) {
  if (value === "required") return "Required";
  if (value === "optional") return "Optional";
  return "None";
}

export function buildSerpBlockModel(entry: UnifiedSeoEntry): SerpBlockModel {
  const exchange = getExchangeBySlug(entry.exchange.slug);
  if (!exchange) {
    throw new Error(`Missing exchange ${entry.exchange.slug}`);
  }

  const peers = entry.comparisonPeers
    .map((slug) => getExchangeBySlug(slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .slice(0, 2);

  const comparisonRows = [exchange, ...peers].map((item) => ({
    exchangeSlug: item.slug,
    exchangeName: item.name,
    spotRebate: item.spotRebate,
    spotFees: `${formatPercent(item.fees.spotMaker)} / ${formatPercent(item.fees.spotTaker)}`,
    kyc: formatKyc(item.kyc),
  }));

  const signupSteps = [
    `Verify the official ${exchange.name} domain before clicking any signup route.`,
    `Use the referral route and confirm the invite code ${exchange.referralCode} is visible.`,
    `Complete ${formatKyc(exchange.kyc).toLowerCase()} KYC and funding prerequisites for your region.`,
    exchange.rebateAutoActivate
      ? `Check that the rebate is auto-activated and settles ${exchange.rebateSettlement}.`
      : `Confirm the rebate needs manual activation before you start trading.`,
  ];

  const regionRestrictions = exchange.regionRestrictions;
  const regionSummary = regionRestrictions.length
    ? `${exchange.name} is restricted or partially limited in ${regionRestrictions
        .slice(0, 3)
        .join(", ")}.`
    : `${exchange.name} does not currently expose explicit regional restrictions in this dataset.`;

  return {
    domainCheck: {
      officialDomain: toDomain(exchange.referralLink).replace(/^partner\./, ""),
      referralDomain: toDomain(exchange.referralLink),
      warning: `Always compare the official domain and the referral landing domain before signup to avoid fake-site redirects.`,
    },
    comparisonRows,
    signupSteps,
    regionSummary,
    regionRestrictions,
  };
}
