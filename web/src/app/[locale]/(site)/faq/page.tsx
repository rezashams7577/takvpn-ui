import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FAQ_KEYS } from "@/lib/faq-keys";
import { localeAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { languages: localeAlternates("/faq") },
  };
}

export default async function FAQPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");

  const faqs = FAQ_KEYS.map(({ q, a }) => ({ q: t(q), a: t(a) }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-slate dark:prose-invert">
      <h1>{t("title")}</h1>
      <dl className="mt-8 space-y-8 not-prose">
        {faqs.map((f) => (
          <div key={f.q}>
            <dt className="font-semibold text-lg">{f.q}</dt>
            <dd className="mt-2 text-[var(--muted)]">{f.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
