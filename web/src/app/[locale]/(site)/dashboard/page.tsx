import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { fetchMe } from "@/lib/api";
import { formatWalletBalance } from "@/lib/format";

type Props = { params: Promise<{ locale: string }> };

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");

  let me;
  try {
    me = await fetchMe();
  } catch {
    return (
      <p className="text-[var(--muted)]">
        {t("sessionExpired")}{" "}
        <Link href="/login" className="text-brand-600">
          {t("signIn")}
        </Link>
      </p>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">
        {me.name ? t("welcomeName", { name: me.name }) : t("welcome")}
      </h1>
      <p className="text-[var(--muted)] mt-1" dir="ltr">
        {me.email}
      </p>
      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        {me.wallets.map((w) => (
          <div
            key={w.id || w.currency}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
          >
            <p className="text-sm text-[var(--muted)]">
              {t("balance", { currency: w.currency })}
            </p>
            <p className="text-2xl font-bold mt-1">
              {formatWalletBalance(w.balance, w.currency, locale)}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex gap-4">
        <Link
          href="/dashboard/wallet"
          className="rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-medium"
        >
          {t("topUpWallet")}
        </Link>
        <Link
          href="/dashboard/plans"
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium"
        >
          {t("buyAPlan")}
        </Link>
      </div>
    </div>
  );
}
