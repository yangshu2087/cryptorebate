import { headers } from "next/headers";
import { NextResponse } from "next/server";

type ClickPayload = {
  event: string;
  timestamp: string;
  page_url: string;
  referrer: string;
  target_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  properties?: Record<string, string | number | boolean | null>;
};

function sanitizeString(value: unknown, maxLength = 1024) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function sanitizeProperties(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const sanitized: NonNullable<ClickPayload["properties"]> = {};

  for (const [key, entry] of Object.entries(value)) {
    if (entry === null) {
      sanitized[key] = null;
      continue;
    }

    if (
      typeof entry === "string" ||
      typeof entry === "number" ||
      typeof entry === "boolean"
    ) {
      sanitized[key] = typeof entry === "string" ? entry.slice(0, 512) : entry;
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

function sanitizeClickPayload(body: unknown): ClickPayload | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  const event = sanitizeString((body as Record<string, unknown>).event, 120);
  const timestamp = sanitizeString(
    (body as Record<string, unknown>).timestamp,
    64
  );
  const pageUrl = sanitizeString(
    (body as Record<string, unknown>).page_url,
    2048
  );
  const referrer =
    sanitizeString((body as Record<string, unknown>).referrer, 2048) ?? "";

  if (!event || !timestamp || !pageUrl) {
    return null;
  }

  return {
    event,
    timestamp,
    page_url: pageUrl,
    referrer,
    target_url: sanitizeString(
      (body as Record<string, unknown>).target_url,
      2048
    ),
    utm_source: sanitizeString((body as Record<string, unknown>).utm_source, 256),
    utm_medium: sanitizeString((body as Record<string, unknown>).utm_medium, 256),
    utm_campaign: sanitizeString(
      (body as Record<string, unknown>).utm_campaign,
      256
    ),
    utm_content: sanitizeString(
      (body as Record<string, unknown>).utm_content,
      256
    ),
    utm_term: sanitizeString((body as Record<string, unknown>).utm_term, 256),
    properties: sanitizeProperties((body as Record<string, unknown>).properties),
  };
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = sanitizeClickPayload(body);
  if (!payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const requestHeaders = await headers();
  console.info(
    "[cryptorebate.click]",
    JSON.stringify({
      ...payload,
      request_meta: {
        host: requestHeaders.get("host"),
        user_agent: sanitizeString(requestHeaders.get("user-agent"), 256),
        country: sanitizeString(requestHeaders.get("x-vercel-ip-country"), 8),
      },
    })
  );

  return NextResponse.json({ ok: true }, { status: 202 });
}
