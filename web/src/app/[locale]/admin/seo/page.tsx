import type { Metadata } from "next";
import { SeoConsole } from "@/components/admin/seo-console";
import { SITE_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: `SEO Automation Console | ${SITE_NAME}`,
  description: "Internal operator dashboard for SEO and GEO automation.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function SeoAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    view?: string;
    exchange?: string;
    dataLocale?: string;
    pageType?: string;
  }>;
}) {
  const { locale } = await params;
  const filters = await searchParams;

  return (
    <SeoConsole
      locale={locale}
      view={filters.view}
      exchange={filters.exchange}
      dataLocale={filters.dataLocale}
      pageType={filters.pageType}
    />
  );
}
