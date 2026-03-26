import { buildRssXml, getFeedItems } from "@/lib/automation/discovery";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  const items = await getFeedItems(40);
  return new Response(buildRssXml(items), {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, s-maxage=1800, stale-while-revalidate=21600",
    },
  });
}
