"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exchanges } from "@/data/exchanges";
import { Crown } from "lucide-react";

type TradeType = "spot" | "futures";

export function CalculatorForm() {
  const t = useTranslations("calculator");
  const [volume, setVolume] = useState(50000);
  const [tradeType, setTradeType] = useState<TradeType>("spot");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/,/g, "")) || 0;
    setVolume(Math.min(val, 5000000));
  };

  const results = exchanges
    .map((ex) => {
      const maker =
        tradeType === "spot" ? ex.fees.spotMaker : ex.fees.futuresMaker;
      const taker =
        tradeType === "spot" ? ex.fees.spotTaker : ex.fees.futuresTaker;
      const avgFee = (maker + taker) / 2;
      const rebateStr =
        tradeType === "spot" ? ex.spotRebate : ex.futuresRebate;
      const rebatePercent = parseInt(rebateStr) / 100;

      const monthlyFee = volume * avgFee;
      const monthlyRebate = monthlyFee * rebatePercent;
      const yearlySavings = monthlyRebate * 12;

      return {
        exchange: ex,
        monthlyFee,
        monthlyRebate,
        yearlySavings,
        rebateStr,
      };
    })
    .sort((a, b) => b.yearlySavings - a.yearlySavings);

  const best = results[0];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <label className="text-sm font-medium">{t("tradeType")}</label>
            <Tabs
              value={tradeType}
              onValueChange={(v) => setTradeType(v as TradeType)}
              className="mt-2"
            >
              <TabsList>
                <TabsTrigger value="spot">{t("spot")}</TabsTrigger>
                <TabsTrigger value="futures">{t("futures")}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div>
            <label className="text-sm font-medium">{t("monthlyVolume")}</label>
            <div className="mt-2 flex items-center gap-4">
              <Slider
                value={[volume]}
                onValueChange={(v) => setVolume(Array.isArray(v) ? v[0] : v)}
                max={2000000}
                min={1000}
                step={1000}
                className="flex-1"
              />
              <div className="relative w-36">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  type="text"
                  value={volume.toLocaleString()}
                  onChange={handleInputChange}
                  className="pl-7 text-right"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">{t("results")}</h2>
        {volume > 0 ? (
          <div className="space-y-3">
            {results.map((r, i) => (
              <Card
                key={r.exchange.slug}
                className={
                  i === 0
                    ? "border-brand/30 bg-brand/5"
                    : ""
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">{r.exchange.name}</span>
                      {i === 0 && (
                        <Badge className="gap-1 bg-cta text-black">
                          <Crown className="h-3 w-3" />
                          {t("recommended")}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {r.rebateStr}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground">
                        {t("monthlyFee")}
                      </span>
                      <p className="font-medium">
                        ${r.monthlyFee.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">
                        {t("monthlyRebate")}
                      </span>
                      <p className="font-medium text-green-500">
                        -${r.monthlyRebate.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">
                        {t("yearlySavings")}
                      </span>
                      <p className="text-lg font-bold text-brand">
                        ${r.yearlySavings.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">{t("noVolume")}</p>
        )}
      </div>
    </div>
  );
}
