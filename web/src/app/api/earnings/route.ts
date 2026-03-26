import { NextResponse } from "next/server";
import { getAutomationState } from "@/lib/automation/catalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const exchangeSlug = searchParams.get("exchange");
  const data = getAutomationState().earnings.filter((item) =>
    exchangeSlug ? item.exchangeSlug === exchangeSlug : true
  );

  return NextResponse.json(
    {
      data,
      meta: {
        count: data.length,
        generatedAt: getAutomationState().generatedAt,
      },
    },
    {
      headers: {
        "cache-control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    }
  );
}
