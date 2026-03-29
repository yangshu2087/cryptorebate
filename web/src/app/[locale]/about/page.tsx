import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { getLocalizedUrl, getOpenGraphLocale } from "@/lib/i18n";
import { getPageAlternates } from "@/lib/metadata";

import { ArrowRight, UserPlus, TrendingUp, Wallet, DollarSign, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = t("aboutTitle");
  const description = t("aboutDescription");
  return {
    title,
    description,
    alternates: {
      canonical: getLocalizedUrl(locale, "/about"),
      languages: getPageAlternates("/about"),
    },
    openGraph: {
      title,
      description,
      url: getLocalizedUrl(locale, "/about"),
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

export default function AboutPage() {
  const t = useTranslations("about");
  const tc = useTranslations("common");

  const steps = [
    { icon: UserPlus, text: t("step1") },
    { icon: TrendingUp, text: t("step2") },
    { icon: Wallet, text: t("step3") },
    { icon: DollarSign, text: t("step4") },
  ];

  const faqItems = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold md:text-4xl">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>

      {/* What is rebate */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">{t("whatTitle")}</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          {t("whatDesc")}
        </p>
      </section>

      {/* How it works */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">{t("howTitle")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {steps.map((step, i) => (
            <Card key={i}>
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-white text-sm font-bold">
                  {i + 1}
                </div>
                <div className="flex items-start gap-2 pt-0.5">
                  <step.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <p className="text-sm">{step.text}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Does it cost extra */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">{t("costTitle")}</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          {t("costDesc")}
        </p>
      </section>

      {/* CTA */}
      <div className="mt-8 flex gap-3">
        <Link href="/exchanges" className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors">
          {tc("getStarted")}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/calculator" className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
          {tc("learnMore")}
        </Link>
      </div>

      <Separator className="my-10" />

      {/* Risk Disclosure */}
      <section>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-cta" />
          <h2 className="text-xl font-bold">{t("riskTitle")}</h2>
        </div>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {t("riskDesc")}
        </p>
      </section>

      <Separator className="my-10" />

      {/* FAQ */}
      <section>
        <h2 className="text-xl font-bold">{t("faqTitle")}</h2>
        <Accordion className="mt-4">
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
      </section>
    </div>
  );
}
