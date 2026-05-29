import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatIrr, formatUsdt } from "@/lib/format";
import { formatTrafficGb } from "@/lib/plan-format";
import { PLANS_SELL_ENABLED } from "@/lib/plans-sell";
import type { Plan } from "@/lib/api";

export async function PlanTable({
  plans,
  locale,
}: {
  plans: Plan[];
  locale: string;
}) {
  const t = await getTranslations("plans");

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] max-h-[32rem] overflow-y-auto">
      <table className="w-full min-w-[36rem] text-sm text-start">
        <thead className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)]">
          <tr>
            <th className="px-4 py-3 font-semibold">{t("planColumn")}</th>
            <th className="px-4 py-3 font-semibold">{t("traffic")}</th>
            <th className="px-4 py-3 font-semibold">{t("duration")}</th>
            <th className="px-4 py-3 font-semibold">{t("devices")}</th>
            <th className="px-4 py-3 font-semibold">{t("priceUsdt")}</th>
            <th className="px-4 py-3 font-semibold">{t("priceToman")}</th>
            <th className="px-4 py-3 font-semibold" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {plans.map((p) => (
            <tr
              key={p.id}
              className="hover:bg-brand-50/50 dark:hover:bg-brand-900/10"
            >
              <td className="px-4 py-3 font-medium whitespace-nowrap">{p.name}</td>
              <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">
                {p.traffic_gb ? formatTrafficGb(p.traffic_gb, locale) : "—"}
              </td>
              <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">
                {p.duration_days != null
                  ? t("durationDays", { days: p.duration_days })
                  : t("durationUnlimited")}
              </td>
              <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">
                {t("devicesUnlimited")}
              </td>
              <td className="px-4 py-3 font-semibold text-brand-600 whitespace-nowrap">
                {formatUsdt(p.price_usdt)} USDT
              </td>
              <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">
                {formatIrr(p.price_irr, locale)} {t("toman")}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {PLANS_SELL_ENABLED ? (
                  <Link
                    href="/dashboard/plans"
                    className="inline-block rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700"
                  >
                    {t("buyPlan")}
                  </Link>
                ) : (
                  <span
                    className="inline-block rounded-lg bg-[var(--border)] text-[var(--muted)] px-4 py-2 text-sm font-medium cursor-not-allowed"
                    aria-disabled
                  >
                    {t("buyUnavailable")}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
