import { describe, expect, it } from "vitest";
import {
  getSerializedExchangeBySlug,
  getSerializedExchanges,
} from "./exchange-api";

describe("exchange api helpers", () => {
  it("returns exchanges in display order", () => {
    const data = getSerializedExchanges();
    expect(data).toHaveLength(7);
    expect(data.map((exchange) => exchange.order)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("enriches a single exchange with numeric rebate fields", () => {
    const binance = getSerializedExchangeBySlug("binance");
    expect(binance).toBeDefined();
    expect(binance?.spotRebatePercent).toBe(20);
    expect(binance?.futuresRebatePercent).toBe(20);
  });
});
