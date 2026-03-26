import {
  buildSitemapXml,
  getBrandSitemapEntries,
} from "@/lib/automation/discovery";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  const entries = await getBrandSitemapEntries();
  return new Response(buildSitemapXml(entries), {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
