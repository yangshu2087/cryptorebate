import type { AutomationState, ExternalPartnerSyncState } from "./types";

export type DataReality = "真实" | "估算" | "模拟" | "未接通";

export type DataRealitySummary = {
  metrics: {
    signals: DataReality;
    opportunities: DataReality;
    publishedPages: DataReality;
    projectedRevenue: DataReality;
    alerts: DataReality;
  };
  modules: {
    realtimeApi: DataReality;
    exchangeBoard: DataReality;
    partnerSources: DataReality;
    opportunities: DataReality;
    pageRoi: DataReality;
    queryRoi: DataReality;
    alerts: DataReality;
    pages: DataReality;
    runs: DataReality;
  };
  gsc: DataReality;
  partners: DataReality;
  partnerByExchange: Array<{
    exchangeSlug: string;
    reality: DataReality;
  }>;
  flags: {
    hasRealGscSignals: boolean;
    hasRealPartnerData: boolean;
    configuredPartnerCount: number;
  };
  legend: Record<DataReality, string>;
};

const LEGEND: Record<DataReality, string> = {
  真实: "线上接口 / 已接入源",
  估算: "模型推算",
  模拟: "seed / synthetic",
  未接通: "尚未配置真实源",
};

function getPartnerReality(source: ExternalPartnerSyncState): DataReality {
  if (!source.configured) return "未接通";
  if (source.status === "success" && source.commissionsWritten + source.conversionsWritten > 0) {
    return "真实";
  }
  return source.status === "failed" ? "未接通" : "估算";
}

export function getAutomationDataReality(state: AutomationState): DataRealitySummary {
  const hasRealGscSignals =
    state.externalSources.gsc.status === "success" &&
    (state.externalSources.gsc.signalsWritten ?? 0) > 0;
  const hasRealPartnerData =
    state.attribution.realConversions > 0 ||
    state.attribution.realCommissions > 0 ||
    state.externalSources.partners.some(
      (item) => item.status === "success" && item.commissionsWritten + item.conversionsWritten > 0
    );
  const configuredPartnerCount = state.externalSources.partners.filter((item) => item.configured).length;
  const realCoverage = state.attribution.realCoverageRate;

  const signals: DataReality = hasRealGscSignals ? "真实" : state.externalSources.gsc.configured ? "估算" : "模拟";
  const opportunities: DataReality =
    hasRealPartnerData || hasRealGscSignals ? "估算" : "模拟";
  const publishedPages: DataReality = "真实";
  const projectedRevenue: DataReality = hasRealPartnerData ? "估算" : "模拟";
  const alerts: DataReality = configuredPartnerCount > 0 || state.externalSources.gsc.configured ? "估算" : "模拟";
  const partners: DataReality =
    configuredPartnerCount === 0 ? "未接通" : hasRealPartnerData ? "真实" : "估算";
  const exchangeBoard: DataReality =
    hasRealPartnerData ? (realCoverage >= 0.8 ? "真实" : "估算") : "模拟";
  const pageRoi: DataReality =
    hasRealPartnerData ? (realCoverage >= 0.8 ? "真实" : "估算") : "模拟";
  const queryRoi: DataReality =
    hasRealPartnerData ? (realCoverage >= 0.8 ? "真实" : "估算") : "模拟";

  return {
    metrics: {
      signals,
      opportunities,
      publishedPages,
      projectedRevenue,
      alerts,
    },
    modules: {
      realtimeApi: "真实",
      exchangeBoard,
      partnerSources: partners,
      opportunities,
      pageRoi,
      queryRoi,
      alerts,
      pages: publishedPages,
      runs: "真实",
    },
    gsc: hasRealGscSignals ? "真实" : state.externalSources.gsc.configured ? "估算" : "未接通",
    partners,
    partnerByExchange: state.externalSources.partners.map((item) => ({
      exchangeSlug: item.exchangeSlug,
      reality: getPartnerReality(item),
    })),
    flags: {
      hasRealGscSignals,
      hasRealPartnerData,
      configuredPartnerCount,
    },
    legend: LEGEND,
  };
}
