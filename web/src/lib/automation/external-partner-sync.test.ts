import { describe, expect, it } from "vitest";
import { normalisePartnerPayload } from "./external-partner-sync";

describe("external-partner-sync", () => {
  it("normalises a JSON payload into conversion and commission events", () => {
    const result = normalisePartnerPayload(
      "binance",
      {
        conversions: [
          {
            locale: "en",
            pageType: "referral-code",
            registeredAt: "2026-03-26T00:00:00.000Z",
            status: "registered",
          },
        ],
        commissions: [
          {
            locale: "en",
            pageType: "referral-code",
            recordedAt: "2026-03-26T00:00:00.000Z",
            commissionUsd: 128.5,
          },
        ],
      },
      "json"
    );

    expect(result.conversions).toHaveLength(1);
    expect(result.commissions).toHaveLength(1);
    expect(result.conversions[0]?.queryClusterId).toBe("cluster-en-binance-referral-code");
    expect(result.commissions[0]?.queryClusterId).toBe("cluster-en-binance-referral-code");
  });

  it("normalises CSV rows into commission events", () => {
    const csv = [
      "locale,page_type,recorded_at,commission_usd",
      "ja,official-site,2026-03-26T00:00:00.000Z,44.7",
    ].join("\n");

    const result = normalisePartnerPayload("okx", csv, "csv");

    expect(result.conversions).toHaveLength(0);
    expect(result.commissions).toHaveLength(1);
    expect(result.commissions[0]?.queryClusterId).toBe("cluster-ja-okx-official-site");
    expect(result.commissions[0]?.source).toBe("csv");
  });
});
