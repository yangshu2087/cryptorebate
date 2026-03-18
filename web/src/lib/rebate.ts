/**
 * Parse rebate string like "20%", "33%", "20-45%" into a numeric value.
 * For ranges, returns { min, max, display }.
 */
export function parseRebate(rebateStr: string): {
  min: number;
  max: number;
  display: number;
} {
  const cleaned = rebateStr.replace(/%/g, "").trim();
  if (cleaned.includes("-")) {
    const [minStr, maxStr] = cleaned.split("-");
    const min = parseFloat(minStr) / 100;
    const max = parseFloat(maxStr) / 100;
    return { min, max, display: min }; // conservative: show minimum
  }
  const val = parseFloat(cleaned) / 100;
  return { min: val, max: val, display: val };
}

/**
 * Calculate monthly fee and rebate savings for a given exchange.
 */
export function calculateSavings(
  monthlyVolume: number,
  makerFee: number,
  takerFee: number,
  rebateStr: string
) {
  const avgFee = (makerFee + takerFee) / 2;
  const rebate = parseRebate(rebateStr);
  const monthlyFee = monthlyVolume * avgFee;
  const monthlyRebateMin = monthlyFee * rebate.min;
  const monthlyRebateMax = monthlyFee * rebate.max;

  return {
    monthlyFee,
    monthlyRebateMin,
    monthlyRebateMax,
    yearlyMin: monthlyRebateMin * 12,
    yearlyMax: monthlyRebateMax * 12,
    isRange: rebate.min !== rebate.max,
  };
}
