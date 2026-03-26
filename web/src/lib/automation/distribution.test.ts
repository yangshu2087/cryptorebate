import { afterEach, describe, expect, it } from "vitest";
import {
  buildTelegramDistributionMessage,
  buildXDistributionMessage,
  getQueuedStatusForChannel,
} from "./distribution";

describe("distribution queue helpers", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("marks telegram and x jobs as pending when credentials are absent", () => {
    delete process.env.AUTOMATION_TELEGRAM_BOT_TOKEN;
    delete process.env.AUTOMATION_TELEGRAM_CHAT_ID;
    delete process.env.AUTOMATION_X_ACCESS_TOKEN;
    process.env.AUTOMATION_X_ENABLED = "true";

    expect(getQueuedStatusForChannel("telegram")).toBe("pending");
    expect(getQueuedStatusForChannel("x")).toBe("pending");
  });

  it("marks jobs as queued when channel credentials exist", () => {
    process.env.AUTOMATION_TELEGRAM_BOT_TOKEN = "bot";
    process.env.AUTOMATION_TELEGRAM_CHAT_ID = "chat";
    process.env.AUTOMATION_X_ENABLED = "true";
    process.env.AUTOMATION_X_ACCESS_TOKEN = "token";

    expect(getQueuedStatusForChannel("telegram")).toBe("queued");
    expect(getQueuedStatusForChannel("x")).toBe("queued");
  });

  it("builds compact telegram and x distribution messages", () => {
    const payload = {
      title: "Binance referral code & fee rebate guide",
      summary:
        "Compare the official referral entrance, fee rebate rate, and signup steps before creating an account.",
      url: "https://cryptorebate.app/en/exchanges/binance/referral-code",
      exchangeSlug: "binance" as const,
      pageType: "referral-code",
      sourceLabel: "内链刷新推荐位",
      tags: ["internal-link-refresh", "top-opportunity"],
    };

    const telegramText = buildTelegramDistributionMessage(payload);
    const xText = buildXDistributionMessage(payload);

    expect(telegramText).toContain(payload.title);
    expect(telegramText).toContain(payload.sourceLabel);
    expect(telegramText).toContain(payload.url);
    expect(xText).toContain(payload.url);
    expect(xText.length).toBeLessThanOrEqual(280);
    expect(xText).toContain("#CryptoRebate");
    expect(xText).toContain("内链刷新推荐位");
  });
});
