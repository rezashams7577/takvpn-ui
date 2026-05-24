import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { brandName } from "@/components/BrandLogo";
import { fetchPlans } from "@/lib/api";
import { PlanTable } from "@/components/PlanTable";
import { localeAlternates } from "@/lib/seo";
import { HOME_FEATURE_KEYS } from "@/lib/faq-keys";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { languages: localeAlternates("") },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  let plans: Awaited<ReturnType<typeof fetchPlans>> = [];
  let plansFailed = false;
  try {
    plans = await fetchPlans(locale);
  } catch {
    plansFailed = true;
    plans = [];
  }

  const features = HOME_FEATURE_KEYS.map((key) => ({
    title: t(`${key}Title`),
    body: t(`${key}Body`),
  }));

  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-transparent dark:from-brand-900/20 py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-[var(--muted)] whitespace-pre-line">{t("subtitle")}</p>
          <p className="mt-6 text-[var(--muted)] leading-relaxed">{t("intro")}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/plans"
              className="rounded-lg bg-brand-600 text-white px-8 py-3 font-semibold hover:bg-brand-700"
            >
              {t("viewPlans")}
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-lg border border-[var(--border)] px-8 py-3 font-semibold hover:bg-[var(--card)]"
            >
              {t("ctaSecondary")}
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-center mb-8">{t("featuresTitle")}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm"
            >
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 border-t border-[var(--border)]">
        <h2 className="text-xl font-bold text-center mb-8">{t("allPlans")}</h2>
        {plansFailed ? (
          <p className="text-center text-[var(--muted)]">{t("plansError")}</p>
        ) : plans.length === 0 ? (
          <p className="text-center text-[var(--muted)]">{t("plansEmpty")}</p>
        ) : (
          <PlanTable plans={plans} locale={locale} />
        )}
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: brandName,
            url: process.env.NEXT_PUBLIC_APP_URL || "https://takvpn.local",
            description: t("schemaDescription"),
          }),
        }}
      />
    </>
  );
}
