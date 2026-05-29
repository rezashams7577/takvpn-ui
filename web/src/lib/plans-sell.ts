/** @deprecated Use usePlansSellEnabled() from SiteConfigProvider instead. */
export const PLANS_SELL_ENABLED =
  process.env.NEXT_PUBLIC_PLANS_SELL_ENABLED === "true" ||
  process.env.NEXT_PUBLIC_PLANS_SELL_ENABLED === "1";
