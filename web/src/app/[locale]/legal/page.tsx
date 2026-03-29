import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { getLocalizedUrl, getOpenGraphLocale } from "@/lib/i18n";
import { getPageAlternates } from "@/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = t("legalTitle");
  const description = t("legalDescription");
  return {
    title,
    description,
    alternates: {
      canonical: getLocalizedUrl(locale, "/legal"),
      languages: getPageAlternates("/legal"),
    },
    openGraph: {
      title,
      description,
      url: getLocalizedUrl(locale, "/legal"),
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

export default function LegalPage() {
  const t = useTranslations("legal");

  const dataItems = [t("dataItem1"), t("dataItem2"), t("dataItem3")];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold md:text-4xl">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>

      <Separator className="my-8" />

      {/* Privacy Policy */}
      <section>
        <h2 className="text-2xl font-bold">{t("privacyTitle")}</h2>

        <div className="mt-6">
          <h3 className="text-lg font-semibold">{t("dataCollectionTitle")}</h3>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            {t("dataCollectionDesc")}
          </p>
          <ul className="mt-3 space-y-2">
            {dataItems.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold">{t("referralLinksTitle")}</h3>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            {t("referralLinksDesc")}
          </p>
        </div>
      </section>

      <Separator className="my-10" />

      {/* Terms of Use */}
      <section>
        <h2 className="text-2xl font-bold">{t("termsTitle")}</h2>

        <div className="mt-6">
          <h3 className="text-lg font-semibold">{t("noAdviceTitle")}</h3>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            {t("noAdviceDesc")}
          </p>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold">{t("accuracyTitle")}</h3>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            {t("accuracyDesc")}
          </p>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold">{t("liabilityTitle")}</h3>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            {t("liabilityDesc")}
          </p>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold">{t("changesTitle")}</h3>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            {t("changesDesc")}
          </p>
        </div>
      </section>
    </div>
  );
}
