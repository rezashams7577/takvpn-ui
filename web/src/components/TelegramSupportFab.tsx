"use client";

import { useTranslations } from "next-intl";
import { telegramSupportUrl } from "@/lib/site";

function TelegramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="currentColor"
      className="block h-[1.625rem] w-[1.625rem] shrink-0"
      aria-hidden
    >
      <path d="M41.402 13.012 36.492 37.26c-.406 1.758-1.422 2.191-2.878 1.366l-7.794-4.926-4.307 4.142c-.473.473-.869.869-1.783.869l.646-9.158 15.96-14.413c.69-.613-.151-.952-1.074-.378L8.64 25.222l-8.928-2.775c-1.943-.61-1.942-1.465.417-2.165L38.359 6.793c1.605-.697 3.01.387 2.493 2.483z" />
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
