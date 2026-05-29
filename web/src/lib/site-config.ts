import { cache } from "react";
import { fetchSiteSettings, type SiteSettings } from "@/lib/api";

export const DEFAULT_SITE_CONFIG: SiteSettings = {
  plans_sell_enabled: false,
  ticketing_enabled: true,
  auth_login_enabled: true,
  auth_register_enabled: false,
};

export const getSiteConfig = cache(async (): Promise<SiteSettings> => {
  try {
    return await fetchSiteSettings();
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
});
