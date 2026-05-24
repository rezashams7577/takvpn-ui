import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { fetchMe } from "@/lib/api";
import { isStaffRole } from "@/lib/admin-api";
import { adminAppUrl } from "@/lib/app-urls";
import { isDashboardPath, pathnameFromHeaders } from "@/lib/pathname";
import { ThemeToggle } from "@/components/theme";
import { BrandLogo } from "./BrandLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";

export async function SiteHeader() {
  const t = await getTranslations("nav");
  const locale = await getLocale();
  const h = await headers();
  const pathname = pathnameFromHeaders((name) => h.get(name));
  const onDashboard = isDashboardPath(pathname);
  let showAdmin = false;
  try {
    const me = await fetchMe();
    showAdmin = isStaffRole(me.role);
  } catch {
    // not signed in
  }

  return (
    <header className="border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <BrandLogo />
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/plans" className="hover:text-brand-600">
            {t("plans")}
          </Link>
          <Link href="/how-it-works" className="hover:text-brand-600 hidden sm:inline">
            {t("howItWorks")}
          </Link>
          <Link href="/faq" className="hover:text-brand-600 hidden sm:inline">
            {t("faq")}
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
          {showAdmin && (
            <a
              href={adminAppUrl("/admin", locale)}
              className="rounded-lg border border-brand-600 text-brand-600 px-4 py-2 hover:bg-brand-50 dark:hover:bg-brand-900/30"
            >
              {t("admin")}
            </a>
          )}
          {!onDashboard && (
            <Link
              href="/dashboard"
              className="rounded-lg bg-brand-600 text-white px-4 py-2 hover:bg-brand-700"
            >
              {t("dashboard")}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
