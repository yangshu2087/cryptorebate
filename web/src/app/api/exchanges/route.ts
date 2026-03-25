import { NextResponse } from "next/server";
import {
  getSerializedExchangeBySlug,
  getSerializedExchanges,
} from "@/lib/exchange-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.toLowerCase();

  if (slug) {
    const exchange = getSerializedExchangeBySlug(slug);

    if (!exchange) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        data: exchange,
        meta: {
          source: "static",
          generatedAt: new Date().toISOString(),
        },
      },
      {
        headers: {
          "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  }

  const data = getSerializedExchanges();

  return NextResponse.json(
    {
      data,
      meta: {
        count: data.length,
        source: "static",
        generatedAt: new Date().toISOString(),
      },
    },
    {
      headers: {
        "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
