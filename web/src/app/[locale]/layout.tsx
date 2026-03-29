import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnalyticsConsentBanner } from "@/components/analytics/analytics-consent-banner";
import { WebsiteJsonLd, OrganizationJsonLd } from "@/components/seo/json-ld";
import { getLanguageTag, getLocalizedUrl, getOpenGraphLocale } from "@/lib/i18n";
import { getSiteIconsMetadata } from "@/lib/metadata";
import {
  SITE_NAME,
  SITE_URL,
} from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s`,
  },
  description:
    "Compare exchange rebates, invite codes, fees, and KYC requirements before signup.",
  applicationName: SITE_NAME,
  keywords: [
    "crypto rebate",
    "exchange referral code",
    "trading fee rebate",
    "crypto exchange comparison",
    "Binance referral",
    "Bybit rebate",
    "OKX referral code",
  ],
  icons: getSiteIconsMetadata(),
  verification: {
    google: "ybX7Q1e18lnsXk9Y8CDG6NGcVw18YU7g878nJtKv1fE",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const siteDescription = t("metadata.siteDescription");
  const siteTagline = t("metadata.siteTagline");
  const socialImage = `/${locale}/opengraph-image`;

  return {
    ...baseMetadata,
    description: siteDescription,
    openGraph: {
      type: "website",
      locale: getOpenGraphLocale(locale),
      url: getLocalizedUrl(locale),
      siteName: SITE_NAME,
      title: t("metadata.homeTitle"),
      description: siteDescription,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — ${siteTagline}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("metadata.homeTitle"),
      description: siteDescription,
      images: [socialImage],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const messages = await getMessages();
  const siteDescription = t("metadata.siteDescription");
  const siteTagline = t("metadata.siteTagline");

  return (
    <html lang={getLanguageTag(locale)} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <WebsiteJsonLd locale={locale} description={siteDescription} />
        <OrganizationJsonLd
          locale={locale}
          description={siteDescription}
          tagline={siteTagline}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <AnalyticsConsentBanner />
              <Footer />
            </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
