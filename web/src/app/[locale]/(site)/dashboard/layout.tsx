import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { fetchMe } from "@/lib/api";
import { isStaffRole } from "@/lib/admin-api";
import { PanelShell } from "@/components/layout/PanelShell";
import { adminAppUrl } from "@/lib/app-urls";
import { getSiteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DashboardLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");
  const siteConfig = await getSiteConfig();

  const nav = [
    { href: "/dashboard" as const, label: t("overview") },
    { href: "/dashboard/wallet" as const, label: t("wallet") },
    { href: "/dashboard/plans" as const, label: t("buyPlan") },
    { href: "/dashboard/vpn" as const, label: t("myVpns") },
    ...(siteConfig.ticketing_enabled
      ? [{ href: "/dashboard/support" as const, label: t("support") }]
      : []),
    { href: "/dashboard/settings" as const, label: t("account") },
  ];

  let showAdmin = false;
  try {
    const me = await fetchMe();
    showAdmin = isStaffRole(me.role);
  } catch {
    // layout children handle expired session
  }

  const sidebar = (
    <nav className="flex flex-col gap-1 text-sm font-medium">
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-lg px-3 py-2 hover:bg-brand-50 dark:hover:bg-brand-900/30"
        >
          {item.label}
        </Link>
      ))}
      {showAdmin && (
        <a
          href={adminAppUrl("/admin", locale)}
          className="rounded-lg px-3 py-2 text-brand-600 font-semibold hover:bg-brand-50 dark:hover:bg-brand-900/30"
        >
          {t("adminPanel")}
        </a>
      )}
    </nav>
  );

  return (
    <PanelShell
      menuOpenLabel={t("menuOpen")}
      menuCloseLabel={t("menuClose")}
      sidebar={sidebar}
    >
      {children}
    </PanelShell>
  );
}
