import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { CalculatorForm } from "@/components/calculator/calculator-form";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("calculatorTitle"),
    description: t("calculatorDescription"),
    alternates: {
      canonical: `https://cryptorebate.app/${locale}/calculator`,
      languages: { zh: "/zh/calculator", en: "/en/calculator" },
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
