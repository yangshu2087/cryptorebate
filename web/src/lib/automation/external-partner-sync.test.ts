import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { utils, write } from "xlsx";
import { normalisePartnerPayload, syncPartnerSource } from "./external-partner-sync";
import type { PartnerSyncConfig } from "./external-config";

function createBaseConfig(overrides: Partial<PartnerSyncConfig> = {}): PartnerSyncConfig {
  return {
    exchangeSlug: "binance",
    enabled: true,
    provider: "generic",
    url: "https://partner.example.com/report.csv",
    format: "csv",
    mode: "combined",
    method: "GET",
    authType: "none",
    authHeaderName: "X-API-Key",
    token: undefined,
    apiKey: undefined,
    apiSecret: undefined,
    apiPassphrase: undefined,
    brokerType: undefined,
    reportKind: undefined,
    windowDays: 30,
    requestBody: undefined,
    fallbackAttribution: {
      locale: "en",
      pageType: "official-site",
    },
    ...overrides,
  };
}

function createWorkbookBuffer(rows: Record<string, unknown>[]) {
  const workbook = utils.book_new();
  const worksheet = utils.json_to_sheet(rows);
  utils.book_append_sheet(workbook, worksheet, "report");
  return write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

describe("external-partner-sync", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

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

  it("applies fallback attribution when partner rows lack locale and page type", () => {
    const csv = [
      "recorded_at,commission_usd",
      "2026-03-26T00:00:00.000Z,44.7",
    ].join("\n");

    const result = normalisePartnerPayload("okx", csv, "csv", {
      fallbackAttribution: {
        locale: "ja",
        pageType: "official-site",
      },
    });

    expect(result.conversions).toHaveLength(0);
    expect(result.commissions).toHaveLength(1);
    expect(result.commissions[0]?.queryClusterId).toBe("cluster-ja-okx-official-site");
    expect(result.commissions[0]?.source).toBe("csv");
  });

  it("signs Gate APIv4 partner requests and parses CSV payloads", async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(
        ["recorded_at,commission_usd", "2026-03-26T00:00:00.000Z,19.25"].join("\n"),
        {
          status: 200,
          headers: { "content-type": "text/csv" },
        }
      )
    );

    const result = await syncPartnerSource(
      createBaseConfig({
        exchangeSlug: "gate",
        provider: "gate-api4",
        url: "https://api.gateio.ws/api/v4/broker/rebate_history?status=settled",
        apiKey: "gate-key",
        apiSecret: "gate-secret",
      })
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [requestUrl, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(requestUrl)).toContain("api.gateio.ws/api/v4/broker/rebate_history?status=settled");
    expect(init?.headers).toMatchObject({
      KEY: "gate-key",
    });
    expect(String((init?.headers as Record<string, string>).SIGN)).not.toHaveLength(0);
    expect(result.report.provider).toBe("gate-api4");
    expect(result.report.status).toBe("success");
    expect(result.commissions[0]?.queryClusterId).toBe("cluster-en-gate-official-site");
  });

  it("uses OKX broker report flow and parses downloaded spreadsheets", async () => {
    const fetchMock = vi.mocked(global.fetch);
    const workbookBuffer = createWorkbookBuffer([
      {
        ts: "1711411200000",
        brokerRebate: "88.12",
      },
    ]);

    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: "0", data: [{ result: "true", ts: "1711411200000" }] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: "0",
            data: [
              {
                fileHref: "https://downloads.okx.example/rebate-report.xlsx",
                state: "finished",
                ts: "1711411200000",
              },
            ],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(new Uint8Array(workbookBuffer), {
          status: 200,
          headers: {
            "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        })
      );

    const result = await syncPartnerSource(
      createBaseConfig({
        exchangeSlug: "okx",
        provider: "okx-broker",
        format: "json",
        apiKey: "okx-key",
        apiSecret: "okx-secret",
        apiPassphrase: "okx-passphrase",
        reportKind: "fd",
        fallbackAttribution: {
          locale: "en",
          pageType: "referral-code",
        },
      })
    );

    expect(fetchMock).toHaveBeenCalledTimes(3);
    const [, firstInit] = fetchMock.mock.calls[0] ?? [];
    expect(firstInit?.method).toBe("POST");
    expect(firstInit?.headers).toMatchObject({
      "OK-ACCESS-KEY": "okx-key",
      "OK-ACCESS-PASSPHRASE": "okx-passphrase",
    });
    expect(result.report.provider).toBe("okx-broker");
    expect(result.report.status).toBe("success");
    expect(result.commissions).toHaveLength(1);
    expect(result.commissions[0]?.commissionUsd).toBe(88.12);
    expect(result.commissions[0]?.queryClusterId).toBe("cluster-en-okx-referral-code");
  });
});
