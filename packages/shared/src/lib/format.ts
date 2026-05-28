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

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Convert Persian/Arabic numerals to ASCII digits and strip separators. */
export function normalizeDigits(value: string): string {
  let s = value;
  for (let i = 0; i < 10; i++) {
    s = s.replaceAll(PERSIAN_DIGITS[i]!, String(i));
    s = s.replaceAll(ARABIC_DIGITS[i]!, String(i));
  }
  return s.replace(/\D/g, "");
}

export function formatIrr(amount: string | number, locale: string): string {
  const digits = normalizeDigits(String(amount));
  if (!digits) return "";
  return Number(digits).toLocaleString(locale === "en" ? "en-US" : "fa-IR");
}

/** Strip locale separators and parse a formatted IRR amount. */
export function parseIrr(value: string): number {
  const digits = normalizeDigits(value);
  if (!digits) return NaN;
  return parseInt(digits, 10);
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
