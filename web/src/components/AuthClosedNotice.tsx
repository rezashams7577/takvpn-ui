"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function AuthClosedNotice() {
  const t = useTranslations("auth");

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div
        className="rounded-xl border border-amber-500/50 bg-amber-50 px-6 py-8 text-center shadow-sm dark:bg-amber-950/50 dark:border-amber-500/40"
        role="status"
        aria-live="polite"
      >
        <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100">
          {t("authSoonTitle")}
        </h1>
        <p className="mt-4 text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
          {t("authSoonMessage")}
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg border border-[var(--border)] px-6 py-2 text-sm font-medium hover:bg-[var(--card)]"
        >
          {t("backToHome")}
        </Link>
      </div>
    </div>
  );
}
