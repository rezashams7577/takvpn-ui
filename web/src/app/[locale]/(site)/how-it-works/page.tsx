import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HOW_IT_WORKS_STEPS } from "@/lib/faq-keys";
import { localeAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "howItWorks" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { languages: localeAlternates("/how-it-works") },
  };
}

export default async function HowItWorksPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("howItWorks");

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-slate dark:prose-invert">
      <h1>{t("title")}</h1>
      <p className="lead">{t("intro")}</p>
      <ol className="list-decimal ps-6 space-y-6 not-prose">
        {HOW_IT_WORKS_STEPS.map((step) => (
          <li key={step} className="text-[var(--fg)]">
            <p className="font-semibold text-lg m-0">{t(`${step}Title`)}</p>
            <p className="mt-1 text-[var(--muted)] m-0">{t(`${step}Body`)}</p>
          </li>
        ))}
      </ol>
      <p className="mt-8 text-[var(--muted)]">{t("outro")}</p>
    </div>
  );
}
