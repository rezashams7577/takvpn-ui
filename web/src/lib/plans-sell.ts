/** When true, customers can buy plans from wallet balance. Set NEXT_PUBLIC_PLANS_SELL_ENABLED=true */
export const PLANS_SELL_ENABLED =
  process.env.NEXT_PUBLIC_PLANS_SELL_ENABLED === "true" ||
  process.env.NEXT_PUBLIC_PLANS_SELL_ENABLED === "1";
