import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] mt-16 py-10 text-sm text-[var(--muted)]">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between gap-4">
        <p>{t("copyright", { year })}</p>
        <div className="flex gap-6">
          <Link href="/privacy">{t("privacy")}</Link>
          <Link href="/terms">{t("terms")}</Link>
        </div>
      </div>
    </footer>
  );
}
