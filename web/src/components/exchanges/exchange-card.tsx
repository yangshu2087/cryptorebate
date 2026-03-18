import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { Exchange } from "@/types/exchange";

export function ExchangeCard({ exchange }: { exchange: Exchange }) {
  const t = useTranslations();

  return (
    <Card className="group transition-all hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={exchange.logo}
              alt={exchange.name}
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <h3 className="font-semibold text-base">{exchange.name}</h3>
              <div className="mt-0.5 flex flex-wrap gap-1.5">
                {exchange.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {t(`tags.${tag}`)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">{t("exchanges.rebateRate")}</div>
            <div className="text-lg font-bold text-brand">{exchange.spotRebate}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-xs text-muted-foreground">{t("exchanges.spotFees")}</span>
            <p className="font-medium">
              {(exchange.fees.spotMaker * 100).toFixed(2)}% / {(exchange.fees.spotTaker * 100).toFixed(2)}%
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">{t("exchanges.futuresFees")}</span>
            <p className="font-medium">
              {(exchange.fees.futuresMaker * 100).toFixed(3)}% / {(exchange.fees.futuresTaker * 100).toFixed(3)}%
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Link href={`/exchanges/${exchange.slug}`} className="flex-1">
            <Button variant="outline" className="w-full gap-1.5 text-sm">
              {t("exchanges.viewDetails")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <a
            href={exchange.referralLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button className="w-full gap-1.5 bg-cta text-sm font-semibold text-black hover:bg-cta-hover">
              {t("exchanges.register")}
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
