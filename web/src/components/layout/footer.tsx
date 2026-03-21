import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { exchanges } from "@/data/exchanges";
import { SITE_NAME } from "@/lib/constants";

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();
  const footerExchanges = [...exchanges].sort((a, b) => a.order - b.order);
  const brandTagline = t("metadata.siteTagline");

  return (
    <footer className="border-t border-border/50 bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid items-stretch gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-background/70 p-5 shadow-sm backdrop-blur-sm">
            <div>
              <Image
                src="/images/brand/cryptorebate-wordmark.svg"
                alt={`${SITE_NAME} logo`}
                width={220}
                height={44}
                className="h-11 w-auto dark:hidden"
              />
              <Image
                src="/images/brand/cryptorebate-wordmark-dark.svg"
                alt={`${SITE_NAME} logo`}
                width={220}
                height={44}
                className="hidden h-11 w-auto dark:block"
              />
              <div className="mt-2 text-xs font-medium text-muted-foreground">{brandTagline}</div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {t("metadata.siteDescription")}
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/70 p-5 shadow-sm backdrop-blur-sm">
            <h3 className="text-sm font-semibold tracking-tight">{t("nav.exchanges")}</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {footerExchanges.map((exchange) => (
                <li key={exchange.slug}>
                  <Link
                    href={`/exchanges/${exchange.slug}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {exchange.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/70 p-5 shadow-sm backdrop-blur-sm">
            <h3 className="text-sm font-semibold tracking-tight">{t("common.learnMore")}</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/calculator" className="hover:text-foreground transition-colors">{t("nav.calculator")}</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">{t("nav.about")}</Link></li>
              <li><Link href="/disclosure" className="hover:text-foreground transition-colors">{t("nav.disclosure")}</Link></li>
              <li><Link href="/legal" className="hover:text-foreground transition-colors">{t("nav.legal")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/40 pt-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("common.disclaimer")}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("common.copyright", { year: String(year) })}
          </p>
        </div>
      </div>
    </footer>
  );
}
