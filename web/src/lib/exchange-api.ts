import { exchanges } from "@/data/exchanges";
import type { Exchange } from "@/types/exchange";

function parsePercent(percent: string) {
  return Number.parseFloat(percent.replace("%", ""));
}

export function serializeExchange(exchange: Exchange) {
  return {
    ...exchange,
    spotRebatePercent: parsePercent(exchange.spotRebate),
    futuresRebatePercent: parsePercent(exchange.futuresRebate),
  };
}

export function getSerializedExchanges() {
  return [...exchanges]
    .sort((a, b) => a.order - b.order)
    .map(serializeExchange);
}

export function getSerializedExchangeBySlug(slug: string) {
  return getSerializedExchanges().find((exchange) => exchange.slug === slug);
}
