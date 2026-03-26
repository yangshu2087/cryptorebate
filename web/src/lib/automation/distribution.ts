import type { DistributionChannel, DistributionJob, DistributionJobPayload, DistributionJobStatus } from "./types";

type TelegramConfig = {
  enabled: boolean;
  botToken?: string;
  chatId?: string;
};

type XConfig = {
  enabled: boolean;
  accessToken?: string;
  apiBaseUrl: string;
};

function parseBoolean(value: string | undefined, fallback = false) {
  if (value == null) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function getDistributionConfigs() {
  const telegramBotToken = process.env.AUTOMATION_TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.AUTOMATION_TELEGRAM_CHAT_ID;
  const xEnabled = parseBoolean(process.env.AUTOMATION_X_ENABLED, true);
  const xAccessToken = process.env.AUTOMATION_X_ACCESS_TOKEN;

  return {
    telegram: {
      enabled: Boolean(telegramBotToken && telegramChatId),
      botToken: telegramBotToken,
      chatId: telegramChatId,
    } satisfies TelegramConfig,
    x: {
      enabled: xEnabled && Boolean(xAccessToken),
      accessToken: xAccessToken,
      apiBaseUrl: process.env.AUTOMATION_X_API_BASE_URL ?? "https://api.x.com",
    } satisfies XConfig,
  };
}

export function getQueuedStatusForChannel(channel: DistributionChannel): DistributionJobStatus {
  const configs = getDistributionConfigs();
  if (channel === "telegram") {
    return configs.telegram.enabled ? "queued" : "pending";
  }
  return configs.x.enabled ? "queued" : "pending";
}

function trimText(input: string, max: number) {
  if (input.length <= max) return input;
  return `${input.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function buildHashtags(payload: DistributionJobPayload) {
  const tags = new Set<string>(["#CryptoRebate"]);
  if (payload.exchangeSlug) {
    tags.add(`#${payload.exchangeSlug.replace(/[^a-z0-9]/gi, "")}`);
  }
  if (payload.pageType) {
    const compact = payload.pageType.replace(/[^a-z0-9]/gi, "");
    if (compact) tags.add(`#${compact}`);
  }
  for (const tag of payload.tags ?? []) {
    const compact = tag.replace(/[^a-z0-9]/gi, "");
    if (compact) tags.add(`#${compact}`);
  }
  return Array.from(tags);
}

export function buildTelegramDistributionMessage(payload: DistributionJobPayload) {
  const lines = [
    payload.title.trim(),
    payload.summary.trim(),
    payload.url.trim(),
  ].filter(Boolean);
  return lines.join("\n");
}

export function buildXDistributionMessage(payload: DistributionJobPayload) {
  const url = payload.url.trim();
  const hashtags = buildHashtags(payload).join(" ");
  const reservedForUrl = url ? url.length + 1 : 0;
  const reservedForTags = hashtags ? hashtags.length + 1 : 0;
  const maxBody = Math.max(40, 280 - reservedForUrl - reservedForTags);
  const headline = trimText(payload.title.trim(), Math.min(110, maxBody));
  const remaining = maxBody - headline.length - 1;
  const summary =
    remaining > 32 ? trimText(payload.summary.trim(), remaining) : "";
  return [headline, summary, url, hashtags].filter(Boolean).join("\n");
}

async function publishTelegram(job: DistributionJob) {
  const { telegram } = getDistributionConfigs();
  if (!telegram.enabled || !telegram.botToken || !telegram.chatId) {
    return {
      ok: false,
      status: "pending" as const,
      error: "Telegram 未配置 bot token / chat id",
    };
  }

  const response = await fetch(
    `https://api.telegram.org/bot${telegram.botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: telegram.chatId,
        text: buildTelegramDistributionMessage(job.payload),
        disable_web_page_preview: false,
      }),
    }
  );

  if (!response.ok) {
    return {
      ok: false,
      status: "failed" as const,
      error: trimText(await response.text(), 400),
    };
  }

  return { ok: true, status: "published" as const, error: null };
}

async function publishX(job: DistributionJob) {
  const { x } = getDistributionConfigs();
  if (!x.enabled || !x.accessToken) {
    return {
      ok: false,
      status: "pending" as const,
      error: "X 未配置 user access token",
    };
  }

  const response = await fetch(`${x.apiBaseUrl.replace(/\/$/, "")}/2/tweets`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${x.accessToken}`,
    },
    body: JSON.stringify({
      text: buildXDistributionMessage(job.payload),
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      status: "failed" as const,
      error: trimText(await response.text(), 400),
    };
  }

  return { ok: true, status: "published" as const, error: null };
}

export async function publishDistributionJob(job: DistributionJob) {
  if (job.channel === "telegram") {
    return publishTelegram(job);
  }
  return publishX(job);
}
