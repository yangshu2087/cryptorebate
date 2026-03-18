import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white text-sm font-bold">
                CR
              </div>
              <span className="text-lg font-bold">CryptoRebate</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {t("metadata.siteDescription")}
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">{t("nav.exchanges")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/exchanges/binance" className="hover:text-foreground transition-colors">Binance</Link></li>
              <li><Link href="/exchanges/okx" className="hover:text-foreground transition-colors">OKX</Link></li>
              <li><Link href="/exchanges/bybit" className="hover:text-foreground transition-colors">Bybit</Link></li>
              <li><Link href="/exchanges/bitget" className="hover:text-foreground transition-colors">Bitget</Link></li>
              <li><Link href="/exchanges/gate" className="hover:text-foreground transition-colors">Gate.io</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">{t("common.learnMore")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/calculator" className="hover:text-foreground transition-colors">{t("nav.calculator")}</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">{t("nav.about")}</Link></li>
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
