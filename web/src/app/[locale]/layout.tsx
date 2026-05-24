import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { brandName } from "@/components/BrandLogo";
import { localeAlternates } from "@/lib/seo";
import { ThemeProvider } from "@/components/theme";
import { ToastProvider } from "@/components/toast";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const { fa, en } = localeAlternates("");

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    title: {
      default: t("defaultTitle"),
      template: t("titleTemplate"),
    },
    description: t("defaultDescription"),
    openGraph: {
      type: "website",
      locale: locale === "fa" ? "fa_IR" : "en_US",
      siteName: brandName,
    },
    alternates: {
      languages: { fa, en },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "fa" | "en")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const isRtl = locale === "fa";
  const bodyFont = isRtl ? "font-sans" : "font-brand";

  return (
    <html lang={locale} dir={isRtl ? "rtl" : "ltr"} suppressHydrationWarning>
      <body
        className={`min-h-screen flex flex-col antialiased ${bodyFont}`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
            <ToastProvider />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
