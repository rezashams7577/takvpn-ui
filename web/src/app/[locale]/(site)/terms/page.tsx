import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TERMS_SECTION_KEYS } from "@/lib/faq-keys";
import { localeAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return {
    title: t("termsMeta"),
    description: t("termsDescription"),
    alternates: { languages: localeAlternates("/terms") },
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-slate dark:prose-invert">
      <h1>{t("termsTitle")}</h1>
      {TERMS_SECTION_KEYS.map((s) => {
        const n = s.slice(1);
        return (
          <section key={s} className="not-prose mt-8">
            <h2 className="text-xl font-semibold">{t(`termsS${n}Title`)}</h2>
            <p className="mt-2 text-[var(--muted)]">{t(`termsS${n}Body`)}</p>
          </section>
        );
      })}
    </div>
  );
}
