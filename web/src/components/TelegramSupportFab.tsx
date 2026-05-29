"use client";

import { useTranslations } from "next-intl";
import { telegramSupportUrl } from "@/lib/site";

function TelegramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="block h-6 w-6 shrink-0"
      aria-hidden
    >
      <path d="M20.665 3.717 2.935 10.554c-1.21.486-1.203 1.161-.222 1.462l4.659 1.454 10.705-6.736-6.48 8.013 8.13 2.36c.901.506 1.632.223 1.865-.79l3.388-16.5z" />
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
      className="telegram-fab fixed z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      style={{
        bottom: "max(1.5rem, env(safe-area-inset-bottom))",
        right: "max(1.5rem, env(safe-area-inset-right))",
      }}
      aria-label={t("telegramSupport")}
    >
      <TelegramIcon />
    </a>
  );
}
