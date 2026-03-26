import {
  buildSitemapXml,
  getFreshSitemapEntries,
} from "@/lib/automation/discovery";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  const entries = await getFreshSitemapEntries(7);
  return new Response(buildSitemapXml(entries), {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, s-maxage=1800, stale-while-revalidate=21600",
    },
  });
}
