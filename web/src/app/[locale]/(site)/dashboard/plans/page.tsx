"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  createOrder,
  fetchPaymentMethods,
  fetchPlans,
  isInsufficientBalance,
  mapApiError,
  type PaymentMethods,
  type Plan,
} from "@/lib/api";
import { formatIrr, formatUsdt } from "@/lib/format";
import { formatTrafficGb } from "@/lib/plan-format";
import { usePlansSellEnabled } from "@/components/SiteConfigProvider";
import { PlansSellGate } from "@/components/PlansSellGate";
import { toast } from "@/components/toast";

export default function DashboardPlansPage() {
  const locale = useLocale();
  const router = useRouter();
  const plansSellEnabled = usePlansSellEnabled();
  const t = useTranslations("dashboard");
  const tPlans = useTranslations("plans");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [payment, setPayment] = useState<PaymentMethods | null>(null);
  const [currency, setCurrency] = useState<"USDT" | "IRR">("USDT");
  const [loading, setLoading] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([fetchPlans(locale), fetchPaymentMethods()])
      .then(([p, pm]) => {
        setPlans(p);
        setPayment(pm);
        if (pm.usdt_enabled && !pm.toman_enabled) {
          setCurrency("USDT");
        } else if (!pm.usdt_enabled && pm.toman_enabled) {
          setCurrency("IRR");
        }
      })
      .catch(() => {
        setPlans([]);
        setPayment(null);
      });
  }, [locale]);

  const showUsdt = payment?.usdt_enabled !== false;
  const showToman = payment?.toman_enabled !== false;
  const showCurrencyToggle = showUsdt && showToman;
  const paymentsAvailable = showUsdt || showToman;

  async function buy(planId: number) {
    if (!plansSellEnabled || !paymentsAvailable) return;
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

  function formatPrice(p: Plan) {
    if (currency === "USDT" && p.price_usdt != null) {
      return `${formatUsdt(p.price_usdt)} USDT`;
    }
    if (currency === "IRR" && p.price_irr != null) {
      return `${formatIrr(p.price_irr, locale)} ${tPlans("toman")}`;
    }
    return "—";
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
                {p.traffic_gb
                  ? formatTrafficGb(p.traffic_gb, locale)
                  : tPlans("trafficUnlimited")}
              </td>
              <td className="px-4 py-3 text-[var(--muted)]">
                {tPlans("devicesCount", { count: p.max_devices ?? 1 })}
              </td>
              <td className="px-4 py-3 font-semibold text-brand-600 whitespace-nowrap">
                {formatPrice(p)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => buy(p.id)}
                  disabled={!plansSellEnabled || !paymentsAvailable || loading === p.id}
                  className="rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!plansSellEnabled
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
      {!paymentsAvailable && payment !== null && (
        <p className="mt-4 text-sm text-amber-700 dark:text-amber-300" role="alert">
          {t("paymentsDisabled")}
        </p>
      )}
      {!plansSellEnabled && (
        <div
          className="mt-4 rounded-xl border border-amber-500/50 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/50 dark:text-amber-100"
          role="status"
        >
          <p className="font-semibold">{tPlans("sellSoonTitle")}</p>
          <p className="mt-1 text-amber-800 dark:text-amber-200">{tPlans("sellSoonMessage")}</p>
        </div>
      )}
      {showCurrencyToggle && (
        <div className={`mt-4 flex gap-2 ${!plansSellEnabled ? "opacity-50 pointer-events-none" : ""}`}>
          <button
            type="button"
            onClick={() => setCurrency("USDT")}
            disabled={!plansSellEnabled}
            className={`px-3 py-1 rounded-lg text-sm ${currency === "USDT" ? "bg-brand-600 text-white" : "border"}`}
          >
            {t("payUsdt")}
          </button>
          <button
            type="button"
            onClick={() => setCurrency("IRR")}
            disabled={!plansSellEnabled}
            className={`px-3 py-1 rounded-lg text-sm ${currency === "IRR" ? "bg-brand-600 text-white" : "border"}`}
          >
            {t("payToman")}
          </button>
        </div>
      )}
      <div className="mt-8">
        {plansSellEnabled ? planTable : <PlansSellGate>{planTable}</PlansSellGate>}
      </div>
    </div>
  );
}
