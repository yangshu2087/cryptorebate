import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, Shield, BarChart3, Globe, RefreshCw, Users, TrendingUp, Percent, Coins } from "lucide-react";
import { exchanges } from "@/data/exchanges";
import { ExchangeCard } from "@/components/exchanges/exchange-card";
import { SavingsEstimator } from "@/components/home/savings-estimator";
import { FAQJsonLd } from "@/components/seo/json-ld";
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
  const sortedExchanges = [...exchanges].sort((a, b) => a.order - b.order);

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
          <Link href="/exchanges" className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-2.5 text-base font-medium text-white hover:bg-brand-dark transition-colors">
            {t("ctaBrowse")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/calculator" className="inline-flex items-center rounded-md border px-6 py-2.5 text-base font-medium hover:bg-accent transition-colors">
            {t("ctaCalculator")}
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
          {sortedExchanges.map((exchange) => (
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

      {/* Exchange Comparison Table */}
      <section className="pb-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">{t("comparisonTitle")}</h2>
          <p className="mt-2 text-muted-foreground">{t("comparisonSubtitle")}</p>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">{t("comparisonExchange")}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">{t("comparisonSpotFee")}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">{t("comparisonFuturesFee")}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">{t("comparisonRebate")}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">{t("comparisonPairs")}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">{t("comparisonKYC")}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedExchanges.map((exchange) => (
                    <tr key={exchange.slug} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="whitespace-nowrap px-4 py-3 font-medium">{exchange.name}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {(exchange.fees.spotTaker * 100).toFixed(2)}%
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {(exchange.fees.futuresTaker * 100).toFixed(3)}%
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-brand">
                        {exchange.spotRebate}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {exchange.tradingPairs.toLocaleString()}+
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {exchange.kyc === "required" ? t("kycRequired") : t("kycOptional")}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <a
                          href={exchange.referralLink}
                          target="_blank"
                          rel="noopener noreferrer nofollow sponsored"
                          className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark transition-colors"
                        >
                          {t("comparisonAction")}
                          <ArrowRight className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Who Is This For — Persona Paths */}
      <section className="pb-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">{t("personaTitle")}</h2>
          <p className="mt-2 text-muted-foreground">{t("personaSubtitle")}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Beginners */}
          <Card>
            <CardContent className="p-5">
              <Users className="h-8 w-8 text-brand" />
              <h3 className="mt-3 font-semibold">{t("persona1Title")}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {t("persona1Desc")}
              </p>
              <p className="mt-3 text-sm font-medium">{t("persona1Recommend")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/exchanges/binance" className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
                  Binance <ArrowRight className="h-3 w-3" />
                </Link>
                <Link href="/exchanges/bitget" className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
                  Bitget <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Futures Traders */}
          <Card>
            <CardContent className="p-5">
              <TrendingUp className="h-8 w-8 text-brand" />
              <h3 className="mt-3 font-semibold">{t("persona2Title")}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {t("persona2Desc")}
              </p>
              <p className="mt-3 text-sm font-medium">{t("persona2Recommend")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/exchanges/bybit" className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
                  Bybit <ArrowRight className="h-3 w-3" />
                </Link>
                <Link href="/exchanges/okx" className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
                  OKX <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* High Rebate Seekers */}
          <Card>
            <CardContent className="p-5">
              <Percent className="h-8 w-8 text-brand" />
              <h3 className="mt-3 font-semibold">{t("persona3Title")}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {t("persona3Desc")}
              </p>
              <p className="mt-3 text-sm font-medium">{t("persona3Recommend")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/exchanges/gate" className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
                  Gate.io <ArrowRight className="h-3 w-3" />
                </Link>
                <Link href="/exchanges/bitget" className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
                  Bitget <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Altcoin Hunters */}
          <Card>
            <CardContent className="p-5">
              <Coins className="h-8 w-8 text-brand" />
              <h3 className="mt-3 font-semibold">{t("persona4Title")}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {t("persona4Desc")}
              </p>
              <p className="mt-3 text-sm font-medium">{t("persona4Recommend")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/exchanges/gate" className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
                  Gate.io <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
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

      <FAQJsonLd items={faqItems} />
    </div>
  );
}
