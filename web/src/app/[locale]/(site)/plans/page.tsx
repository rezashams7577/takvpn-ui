import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { fetchPlans } from "@/lib/api";
import { PlanTable } from "@/components/PlanTable";
import { localeAlternates } from "@/lib/seo";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "plans" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { languages: localeAlternates("/plans") },
  };
}

export default async function PlansPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("plans");

  let plans: Awaited<ReturnType<typeof fetchPlans>> = [];
  let failed = false;
  try {
    plans = await fetchPlans(locale);
  } catch {
    failed = true;
    plans = [];
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-[var(--muted)]">{t("subtitle")}</p>
      <p className="mt-4 text-sm text-[var(--muted)]">{t("trustLine")}</p>
      <div className="mt-10">
        {failed ? (
          <p className="text-[var(--muted)]">{t("emptyError")}</p>
        ) : plans.length === 0 ? (
          <p className="text-[var(--muted)]">{t("empty")}</p>
        ) : (
          <PlanTable plans={plans} locale={locale} />
        )}
      </div>
    </div>
  );
}
