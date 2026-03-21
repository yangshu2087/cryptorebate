import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { CalculatorForm } from "@/components/calculator/calculator-form";
import { getLocaleAlternates, getLocalizedUrl, getOpenGraphLocale } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = t("calculatorTitle");
  const description = t("calculatorDescription");
  return {
    title,
    description,
    alternates: {
      canonical: getLocalizedUrl(locale, "/calculator"),
      languages: getLocaleAlternates("/calculator"),
    },
    openGraph: {
      title,
      description,
      url: getLocalizedUrl(locale, "/calculator"),
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

export default function CalculatorPage() {
  const t = useTranslations("calculator");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold md:text-4xl">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      <div className="mt-8">
        <CalculatorForm />
      </div>
    </div>
  );
}
