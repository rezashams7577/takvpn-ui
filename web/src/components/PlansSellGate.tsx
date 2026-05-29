"use client";

import { useTranslations } from "next-intl";
import { usePlansSellEnabled } from "@/components/SiteConfigProvider";

export function PlansSellGate({ children }: { children: React.ReactNode }) {
  const t = useTranslations("plans");
  const plansSellEnabled = usePlansSellEnabled();

  if (plansSellEnabled) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-70">{children}</div>
      <div
        className="absolute inset-0 flex items-center justify-center p-4"
        role="status"
        aria-live="polite"
      >
        <div className="max-w-md rounded-xl border border-amber-500/50 bg-amber-50 px-6 py-4 text-center shadow-lg dark:bg-amber-950/90 dark:border-amber-500/40">
          <p className="font-semibold text-amber-900 dark:text-amber-100">{t("sellSoonTitle")}</p>
          <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">{t("sellSoonMessage")}</p>
        </div>
      </div>
    </div>
  );
}
