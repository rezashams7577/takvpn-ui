/** Trim trailing zeroes from decimal amounts (e.g. 5.00000000 → 5). */
export function formatDecimal(
  amount: string | number,
  maxDecimals = 8
): string {
  const n = Number(amount);
  if (Number.isNaN(n)) return String(amount);
  return n.toFixed(maxDecimals).replace(/\.?0+$/, "") || "0";
}

/** Trim trailing zeroes from USDT amounts (e.g. 5.00000000 → 5). */
export function formatUsdt(amount: string | number): string {
  return formatDecimal(amount, 8);
}

export function formatIrr(amount: string | number, locale: string): string {
  return Number(amount).toLocaleString(locale === "en" ? "en-US" : "fa-IR");
}

export function formatWalletBalance(
  balance: string | number,
  currency: string,
  locale: string
): string {
  if (currency === "IRR") return formatIrr(balance, locale);
  return formatDecimal(balance, 8);
}

export function formatExchangeRate(rate: string | number): string {
  return formatDecimal(rate, 4);
}
