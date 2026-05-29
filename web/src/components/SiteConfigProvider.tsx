"use client";

import { createContext, useContext } from "react";
import type { SiteSettings } from "@/lib/api";
import { DEFAULT_SITE_CONFIG } from "@/lib/site-config";

const SiteConfigContext = createContext<SiteSettings>(DEFAULT_SITE_CONFIG);

export function SiteConfigProvider({
  config,
  children,
}: {
  config: SiteSettings;
  children: React.ReactNode;
}) {
  return (
    <SiteConfigContext.Provider value={config}>{children}</SiteConfigContext.Provider>
  );
}

export function useSiteConfig(): SiteSettings {
  return useContext(SiteConfigContext);
}

export function usePlansSellEnabled(): boolean {
  return useSiteConfig().plans_sell_enabled;
}

export function useTicketingEnabled(): boolean {
  return useSiteConfig().ticketing_enabled;
}

export function useAuthLoginEnabled(): boolean {
  return useSiteConfig().auth_login_enabled;
}

export function useAuthRegisterEnabled(): boolean {
  return useSiteConfig().auth_register_enabled;
}
