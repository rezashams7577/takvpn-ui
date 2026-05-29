"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  createOrder,
  fetchPlans,
  isInsufficientBalance,
  mapApiError,
  type Plan,
} from "@/lib/api";
import { formatIrr, formatUsdt } from "@/lib/format";
import { formatTrafficGb } from "@/lib/plan-format";
import { PLANS_SELL_ENABLED } from "@/lib/plans-sell";
import { PlansSellGate } from "@/components/PlansSellGate";
import { toast } from "@/components/toast";

export default function DashboardPlansPage() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("dashboard");
  const tPlans = useTranslations("plans");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currency, setCurrency] = useState<"USDT" | "IRR">("USDT");
  const [loading, setLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchPlans(locale).then(setPlans).catch(() => setPlans([]));
  }, [locale]);

  async function buy(planId: number) {
    if (!PLANS_SELL_ENABLED) return;
    setLoading(planId);
    try {
      const res = await createOrder(planId, currency);
      toast.success(t("orderCreated", { orderId: res.order_id, status: res.status }), {
        duration: 5000,
        action: {
          label: t("viewMyVpns"),
          onClick: () => router.push("/dashboard/vpn"),
        },
      });
    } catch (e) {
      if (isInsufficientBalance(e)) {
        toast.error(t("insufficientBalance"), {
          action: {
            label: t("topUpWallet"),
            onClick: () => router.push("/dashboard/wallet"),
          },
        });
      } else {
        toast.error(mapApiError(t, e));
      }
    } finally {
      setLoading(null);
    }
  }

  const planTable = (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
      <table className="w-full min-w-[40rem] text-sm text-start">
        <thead className="bg-[var(--card)] border-b border-[var(--border)]">
          <tr>
            <th className="px-4 py-3 font-semibold">{tPlans("planColumn")}</th>
            <th className="px-4 py-3 font-semibold">{tPlans("duration")}</th>
            <th className="px-4 py-3 font-semibold">{tPlans("traffic")}</th>
            <th className="px-4 py-3 font-semibold">{tPlans("devices")}</th>
            <th className="px-4 py-3 font-semibold">
              {currency === "USDT" ? tPlans("priceUsdt") : tPlans("priceToman")}
            </th>
            <th className="px-4 py-3 font-semibold" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {plans.map((p) => (
            <tr key={p.id} className="hover:bg-brand-50/50 dark:hover:bg-brand-900/10">
              <td className="px-4 py-3 font-medium">{p.name}</td>
              <td className="px-4 py-3 text-[var(--muted)]">
                {p.duration_days != null
                  ? tPlans("durationDays", { days: p.duration_days })
                  : tPlans("durationUnlimited")}
              </td>
              <td className="px-4 py-3 text-[var(--muted)]">
                {p.traffic_gb ? formatTrafficGb(p.traffic_gb, locale) : "—"}
              </td>
              <td className="px-4 py-3 text-[var(--muted)]">{tPlans("devicesUnlimited")}</td>
              <td className="px-4 py-3 font-semibold text-brand-600 whitespace-nowrap">
                {currency === "USDT"
                  ? `${formatUsdt(p.price_usdt)} USDT`
                  : `${formatIrr(p.price_irr, locale)} ${tPlans("toman")}`}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => buy(p.id)}
                  disabled={!PLANS_SELL_ENABLED || loading === p.id}
                  className="rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!PLANS_SELL_ENABLED
                    ? tPlans("buyUnavailable")
                    : loading === p.id
                      ? t("processing")
                      : t("buyNow")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("buyPlanTitle")}</h1>
      {!PLANS_SELL_ENABLED && (
        <div
          className="mt-4 rounded-xl border border-amber-500/50 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/50 dark:text-amber-100"
          role="status"
        >
          <p className="font-semibold">{tPlans("sellSoonTitle")}</p>
          <p className="mt-1 text-amber-800 dark:text-amber-200">{tPlans("sellSoonMessage")}</p>
        </div>
      )}
      <div className={`mt-4 flex gap-2 ${!PLANS_SELL_ENABLED ? "opacity-50 pointer-events-none" : ""}`}>
        <button
          type="button"
          onClick={() => setCurrency("USDT")}
          disabled={!PLANS_SELL_ENABLED}
          className={`px-3 py-1 rounded-lg text-sm ${currency === "USDT" ? "bg-brand-600 text-white" : "border"}`}
        >
          {t("payUsdt")}
        </button>
        <button
          type="button"
          onClick={() => setCurrency("IRR")}
          disabled={!PLANS_SELL_ENABLED}
          className={`px-3 py-1 rounded-lg text-sm ${currency === "IRR" ? "bg-brand-600 text-white" : "border"}`}
        >
          {t("payToman")}
        </button>
      </div>
      <div className="mt-8">
        {PLANS_SELL_ENABLED ? planTable : <PlansSellGate>{planTable}</PlansSellGate>}
      </div>
    </div>
  );
}
