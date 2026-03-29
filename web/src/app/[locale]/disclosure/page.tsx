import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { getLocalizedUrl, getOpenGraphLocale } from "@/lib/i18n";
import { getPageAlternates } from "@/lib/metadata";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = t("disclosureTitle");
  const description = t("disclosureDescription");
  return {
    title,
    description,
    alternates: {
      canonical: getLocalizedUrl(locale, "/disclosure"),
      languages: getPageAlternates("/disclosure"),
    },
    openGraph: {
      title,
      description,
      url: getLocalizedUrl(locale, "/disclosure"),
      locale: getOpenGraphLocale(locale),
      images: [
        {
          url: `/${locale}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      title,
      description,
      images: [`/${locale}/twitter-image`],
    },
  };
}

export default function DisclosurePage() {
  const t = useTranslations("disclosure");
  const tc = useTranslations("common");

  const partners = [
    t("partner1"),
    t("partner2"),
    t("partner3"),
    t("partner4"),
    t("partner5"),
    t("partner6"),
    t("partner7"),
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold md:text-4xl">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>

      <Separator className="my-8" />

      {/* How We Earn */}
      <section>
        <h2 className="text-xl font-bold">{t("howWeEarnTitle")}</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          {t("howWeEarnDesc")}
        </p>
      </section>

      {/* No Cost */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">{t("noCostTitle")}</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          {t("noCostDesc")}
        </p>
      </section>

      {/* Partners */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">{t("partnersTitle")}</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          {t("partnersDesc")}
        </p>
        <ul className="mt-4 space-y-2">
          {partners.map((partner, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              {partner}
            </li>
          ))}
        </ul>
      </section>

      {/* Commitment */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">{t("commitmentTitle")}</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          {t("commitmentDesc")}
        </p>
      </section>

      <Separator className="my-10" />

      {/* Questions */}
      <section>
        <h2 className="text-xl font-bold">{t("questionsTitle")}</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          {t("questionsDesc")}
        </p>
      </section>

      {/* CTA */}
      <div className="mt-8">
        <Link
          href="/exchanges"
          className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
        >
          {tc("getStarted")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
