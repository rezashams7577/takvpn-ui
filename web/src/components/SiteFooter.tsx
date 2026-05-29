import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { telegramChannelUrl, telegramSupportUrl } from "@/lib/site";

const externalLinkClass =
  "hover:text-brand-600 underline-offset-2 hover:underline";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] mt-16 py-10 text-sm text-[var(--muted)]">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between gap-6">
        <p>{t("copyright", { year })}</p>
        <div className="flex flex-col sm:items-end gap-3">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a
              href={telegramChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={externalLinkClass}
            >
              {t("telegramChannel")}
            </a>
            <a
              href={telegramSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={externalLinkClass}
            >
              {t("telegramSupport")}
            </a>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy">{t("privacy")}</Link>
            <Link href="/terms">{t("terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
