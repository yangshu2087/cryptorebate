import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, Shield, BarChart3, Globe, RefreshCw } from "lucide-react";
import { exchanges } from "@/data/exchanges";
import { ExchangeCard } from "@/components/exchanges/exchange-card";
import { SavingsEstimator } from "@/components/home/savings-estimator";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("homeTitle"),
    description: t("siteDescription"),
    alternates: {
      canonical: `https://cryptorebate.app/${locale}`,
      languages: { zh: "/zh", en: "/en" },
    },
    openGraph: {
      title: t("homeTitle"),
      description: t("siteDescription"),
      siteName: "CryptoRebate",
      locale: locale === "zh" ? "zh_CN" : "en_US",
    },
  };
}

export default function HomePage() {
  const t = useTranslations("home");

  const whyItems = [
    { icon: Shield, titleKey: "why1Title" as const, descKey: "why1Desc" as const },
    { icon: BarChart3, titleKey: "why2Title" as const, descKey: "why2Desc" as const },
    { icon: Globe, titleKey: "why3Title" as const, descKey: "why3Desc" as const },
    { icon: RefreshCw, titleKey: "why4Title" as const, descKey: "why4Desc" as const },
  ];

  const faqItems = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
    { q: t("faq4Q"), a: t("faq4A") },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="py-20 text-center md:py-28">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          {t("heroTitle")}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          {t("heroSubtitle")}
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/exchanges">
            <Button size="lg" className="gap-2 bg-brand text-white hover:bg-brand-dark text-base px-6">
              {t("ctaBrowse")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/calculator">
            <Button size="lg" variant="outline" className="text-base px-6">
              {t("ctaCalculator")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Savings Estimator */}
      <section className="pb-16">
        <SavingsEstimator />
      </section>

      {/* Featured Exchanges */}
      <section className="pb-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">{t("featuredTitle")}</h2>
          <p className="mt-2 text-muted-foreground">{t("featuredSubtitle")}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exchanges
            .sort((a, b) => a.order - b.order)
            .map((exchange) => (
              <ExchangeCard key={exchange.slug} exchange={exchange} />
            ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="pb-16">
        <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">
          {t("whyTitle")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {whyItems.map((item) => (
            <Card key={item.titleKey}>
              <CardContent className="p-5">
                <item.icon className="h-8 w-8 text-brand" />
                <h3 className="mt-3 font-semibold">{t(item.titleKey)}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {t(item.descKey)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-20">
        <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">
          {t("faqTitle")}
        </h2>
        <div className="mx-auto max-w-3xl">
          <Accordion>
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
