"use client";

import { useLocale } from "next-intl";
import { Toaster } from "sonner";

export { toast } from "sonner";

export function ToastProvider() {
  const locale = useLocale();
  const isRtl = locale === "fa";

  return (
    <Toaster
      position="top-center"
      dir={isRtl ? "rtl" : "ltr"}
      richColors
      closeButton
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] shadow-lg",
          title: "text-sm font-medium",
          description: "text-sm text-[var(--muted)]",
          actionButton:
            "bg-brand-600 text-white text-xs font-medium px-3 py-1.5 rounded-md",
          cancelButton:
            "bg-[var(--border)] text-[var(--foreground)] text-xs font-medium px-3 py-1.5 rounded-md",
          closeButton:
            "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)]",
        },
      }}
    />
  );
}
