"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { exchanges } from "@/data/exchanges";

export function SavingsEstimator() {
  const t = useTranslations("home");
  const [volume, setVolume] = useState(10000);

  const handleSliderChange = (value: number | readonly number[]) => {
    setVolume(Array.isArray(value) ? value[0] : value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/,/g, "")) || 0;
    setVolume(Math.min(val, 1000000));
  };

  const calculations = exchanges.map((ex) => {
    const avgFee = (ex.fees.spotMaker + ex.fees.spotTaker) / 2;
    const rebatePercent = parseInt(ex.spotRebate) / 100;
    const monthlyFee = volume * avgFee;
    const monthlyRebate = monthlyFee * rebatePercent;
    const yearlySavings = monthlyRebate * 12;
    return {
      name: ex.name,
      rebate: ex.spotRebate,
      yearlySavings,
    };
  });

  const bestSavings = Math.max(...calculations.map((c) => c.yearlySavings));

  return (
    <Card className="border-brand/20 bg-card">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold">{t("estimatorTitle")}</h3>

        <div className="mt-5">
          <label className="text-sm text-muted-foreground">
            {t("estimatorMonthlyVolume")}
          </label>
          <div className="mt-2 flex items-center gap-4">
            <Slider
              value={[volume]}
              onValueChange={handleSliderChange}
              max={500000}
              min={1000}
              step={1000}
              className="flex-1"
            />
            <div className="relative w-32">
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

        <div className="mt-5 space-y-2">
          <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground px-2">
            <span>{t("estimatorExchange")}</span>
            <span className="text-center">{t("estimatorRebate")}</span>
            <span className="text-right">{t("estimatorYearlySavings")}</span>
          </div>
          {calculations.map((calc) => (
            <div
              key={calc.name}
              className={`grid grid-cols-3 gap-2 items-center rounded-lg px-2 py-2 text-sm transition-colors ${
                calc.yearlySavings === bestSavings
                  ? "bg-brand/10 font-semibold"
                  : ""
              }`}
            >
              <span>{calc.name}</span>
              <span className="text-center text-brand">{calc.rebate}</span>
              <span className="text-right font-medium">
                ${calc.yearlySavings.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
