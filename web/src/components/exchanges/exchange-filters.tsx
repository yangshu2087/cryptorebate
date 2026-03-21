"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { exchanges as allExchanges } from "@/data/exchanges";
import { parseRebate } from "@/lib/rebate";
import { ExchangeCard } from "./exchange-card";

type SortKey = "rebate" | "fees" | "popularity";

const SORT_OPTIONS: SortKey[] = ["popularity", "rebate", "fees"];

export function ExchangeFilters() {
  const t = useTranslations("exchanges");
  const [sort, setSort] = useState<SortKey>("popularity");

  const sortLabels: Record<SortKey, string> = {
    popularity: t("sortByPopularity"),
    rebate: t("sortByRebate"),
    fees: t("sortByFees"),
  };

  const sorted = [...allExchanges].sort((a, b) => {
    switch (sort) {
      case "rebate":
        return parseRebate(b.spotRebate).max - parseRebate(a.spotRebate).max;
      case "fees":
        return a.fees.spotTaker - b.fees.spotTaker;
      case "popularity":
      default:
        return a.order - b.order;
    }
  });

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        {SORT_OPTIONS.map((key) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              sort === key
                ? "bg-brand text-white"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {sortLabels[key]}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sorted.map((exchange) => (
          <ExchangeCard key={exchange.slug} exchange={exchange} />
        ))}
      </div>
    </div>
  );
}
