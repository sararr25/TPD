// Native Qloo ordinal scale. Do not invent a fifth band from four source values.
export const PRICE_LEVELS = [1, 2, 3, 4] as const;
export function priceSymbols(value: number | null | undefined): string {
  return Number.isInteger(value) && value! >= 1 && value! <= 4 ? "€".repeat(value!) : "Price unknown";
}
export function priceLabel(value: number | null | undefined): string {
  return Number.isInteger(value) && value! >= 1 && value! <= 4 ? `Indicative price level ${value} of 4` : "Price unknown";
}

export function priceComparison(value: number | null | undefined, reference: number | null | undefined): string {
  if (!PRICE_LEVELS.some(n => n === value) || !PRICE_LEVELS.some(n => n === reference)) return "Price comparison unavailable.";
  const relation = value! > reference! ? "Higher" : value! < reference! ? "Lower" : "Same";
  return `${relation} price tier · ${priceSymbols(value)} vs ${priceSymbols(reference)} at your starting place. Indicative tiers, not live prices.`;
}
