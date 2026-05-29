"use client";

import { useTranslations } from "next-intl";
import { telegramSupportUrl } from "@/lib/site";

function TelegramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-7 w-7"
      aria-hidden
    >
      <path d="M9.78 15.28 9.5 19.5c.55 0 .79-.24 1.08-.52l2.6-2.49 5.39 3.95c.99.55 1.7.26 1.96-.92l3.54-16.6h.01c.32-1.48-.54-2.06-1.52-1.7L2.3 9.78c-1.45.57-1.43 1.39-.26 1.76l5.26 1.64 12.2-7.69c.57-.35 1.09-.16.66.19" />
    </svg>
  );
}

export function TelegramSupportFab() {
  const t = useTranslations("footer");

  return (
    <a
      href={telegramSupportUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="telegram-fab fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      style={{
        bottom: "max(1.5rem, env(safe-area-inset-bottom))",
        insetInlineEnd: "max(1.5rem, env(safe-area-inset-end))",
      }}
      aria-label={t("telegramSupport")}
    >
      <TelegramIcon />
    </a>
  );
}
