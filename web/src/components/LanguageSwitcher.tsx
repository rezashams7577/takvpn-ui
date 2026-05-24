import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pathnameFromHeaders } from "@/lib/pathname";

/** Server-rendered locale toggle (avoids usePathname hydration mismatches). */
export async function LanguageSwitcher() {
  const locale = await getLocale();
  const t = await getTranslations("nav");
  const h = await headers();
  const pathname = pathnameFromHeaders((name) => h.get(name));
  const targetLocale = locale === "fa" ? "en" : "fa";

  return (
    <Link
      href={pathname}
      locale={targetLocale}
      className="text-sm text-[var(--muted)] hover:text-brand-600"
    >
      {locale === "fa" ? t("english") : t("persian")}
    </Link>
  );
}
