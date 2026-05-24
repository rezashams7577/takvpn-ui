"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { formatUsdt, formatWalletBalance } from "@/lib/format";
import { FormField, FormSelect, FormSubmit } from "@/components/forms";
import { PanelSection } from "@/components/layout";
import {
  createUsdtDeposit,
  createZarinpalDeposit,
  fetchMe,
  getUsdtDeposit,
  mapApiError,
  type Me,
  type UsdtDeposit,
} from "@/lib/api";
import { toast } from "@/components/toast";

function explorerTxUrl(network: string, txHash: string) {
  if (network === "trc20") {
    return `https://tronscan.org/#/transaction/${txHash}`;
  }
  return `https://etherscan.io/tx/${txHash}`;
}

export default function WalletPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const t = useTranslations("dashboard");
  const [me, setMe] = useState<Me | null>(null);
  const [activeDeposit, setActiveDeposit] = useState<UsdtDeposit | null>(null);
  const [loading, setLoading] = useState(false);
  const zarinpalToastShown = useRef(false);

  const refreshDeposit = useCallback(async (id: number) => {
    try {
      const d = await getUsdtDeposit(id);
      setActiveDeposit(d);
      if (d.status === "paid") {
        const updated = await fetchMe();
        setMe(updated);
        toast.success(t("usdtDepositPaid"), { duration: 5000 });
      }
      return d;
    } catch {
      return null;
    }
  }, [t]);

  useEffect(() => {
    fetchMe().then(setMe).catch(() => setMe(null));
  }, []);

  useEffect(() => {
    const outcome = searchParams.get("zarinpal");
    if (!outcome || zarinpalToastShown.current) return;
    zarinpalToastShown.current = true;
    if (outcome === "success") {
      toast.success(t("zarinpalDepositSuccess"), { duration: 5000 });
      fetchMe().then(setMe).catch(() => {});
    } else if (outcome === "cancelled") {
      toast.error(t("zarinpalDepositCancelled"));
    } else {
      toast.error(t("zarinpalDepositFailed"));
    }
  }, [searchParams, t]);

  useEffect(() => {
    if (
      !activeDeposit ||
      activeDeposit.status === "paid" ||
      activeDeposit.status === "expired" ||
      activeDeposit.status === "cancelled"
    ) {
      return;
    }
    const id = activeDeposit.id;
    const timer = setInterval(() => {
      void refreshDeposit(id);
    }, 10000);
    return () => clearInterval(timer);
  }, [activeDeposit?.id, activeDeposit?.status, refreshDeposit]);

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("copied", { label }));
    } catch {
      toast.error(t("failed"));
    }
  }

  async function onUsdtSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const amount = parseFloat(String(fd.get("amount")));
    const network = String(fd.get("network")) as "trc20" | "erc20";
    try {
      const d = await createUsdtDeposit(amount, network);
      setActiveDeposit(d);
      toast.success(t("usdtDepositCreated"), { duration: 5000 });
    } catch (ex) {
      toast.error(mapApiError(t, ex));
    } finally {
      setLoading(false);
    }
  }

  async function onZarinpalSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const amount = parseInt(String(fd.get("amount")), 10);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error(t("failed"));
      setLoading(false);
      return;
    }
    try {
      const res = await createZarinpalDeposit(amount);
      window.location.href = res.payment_url;
    } catch (ex) {
      toast.error(mapApiError(t, ex));
      setLoading(false);
    }
  }

  const showUsdtForm =
    !activeDeposit ||
    activeDeposit.status === "paid" ||
    activeDeposit.status === "expired" ||
    activeDeposit.status === "cancelled";

  const networkLabel =
    activeDeposit?.network === "erc20"
      ? "ERC20 (Ethereum)"
      : activeDeposit?.network === "trc20"
        ? "TRC20 (Tron)"
        : "TRC20 (Tron)";

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("walletTitle")}</h1>
      {me && (
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          {me.wallets.map((w) => (
            <div
              key={w.id || w.currency}
              className="rounded-lg border border-[var(--border)] p-4"
            >
              <span className="text-sm text-[var(--muted)]">{w.currency}</span>
              <p className="text-xl font-bold">
                {formatWalletBalance(w.balance, w.currency, locale)}
              </p>
            </div>
          ))}
        </div>
      )}

      <PanelSection
        title={t("topUpUsdt")}
        description={t("usdtDepositHint")}
        className="mt-10"
      >
        {showUsdtForm ? (
          <form
            onSubmit={onUsdtSubmit}
            className="admin-form max-w-md space-y-3"
            dir="ltr"
          >
            <FormField
              label={t("usdtAmount")}
              name="amount"
              type="number"
              step="0.01"
              min="1"
              required
              defaultValue="10"
            />
            <FormSelect
              label={t("usdtNetwork")}
              name="network"
              defaultValue="trc20"
              options={[
                { value: "trc20", label: "TRC20 (Tron)" },
                { value: "erc20", label: "ERC20 (Ethereum)" },
              ]}
            />
            <FormSubmit loading={loading}>{t("createUsdtDeposit")}</FormSubmit>
          </form>
        ) : (
          activeDeposit && (
            <div className="mt-4 max-w-lg rounded-lg border border-[var(--border)] p-4 space-y-3">
              <p className="text-sm font-medium">
                {t("usdtDepositStatus", { status: activeDeposit.status })}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {t("usdtNetworkWarning", { network: networkLabel })}
              </p>
              <div>
                <span className="text-xs text-[var(--muted)]">{t("usdtPayAmount")}</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm font-mono">
                    {formatUsdt(activeDeposit.pay_amount)} USDT
                  </code>
                  <button
                    type="button"
                    onClick={() => copyText(activeDeposit.pay_amount, t("usdtPayAmount"))}
                    className="text-xs text-brand-600"
                  >
                    {t("copy")}
                  </button>
                </div>
              </div>
              <div>
                <span className="text-xs text-[var(--muted)]">{t("usdtDepositAddress")}</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs font-mono break-all">
                    {activeDeposit.deposit_address}
                  </code>
                  <button
                    type="button"
                    onClick={() =>
                      copyText(activeDeposit.deposit_address, t("usdtDepositAddress"))
                    }
                    className="text-xs text-brand-600 shrink-0"
                  >
                    {t("copy")}
                  </button>
                </div>
              </div>
              <p className="text-xs text-[var(--muted)]">
                {t("usdtCreditAmount", {
                  amount: formatUsdt(activeDeposit.credit_amount),
                })}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {t("usdtExpiresAt", {
                  time: new Date(activeDeposit.expires_at).toLocaleString(),
                })}
              </p>
              {activeDeposit.tx_hash && (
                <a
                  href={explorerTxUrl(activeDeposit.network, activeDeposit.tx_hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-600"
                  dir="ltr"
                >
                  {t("viewTransaction")}
                </a>
              )}
              <button
                type="button"
                onClick={() => setActiveDeposit(null)}
                className="text-xs text-[var(--muted)] underline"
              >
                {t("usdtNewDeposit")}
              </button>
            </div>
          )
        )}
      </PanelSection>

      <PanelSection
        title={t("tomanDeposit")}
        description={t("zarinpalDepositHint")}
        className="mt-6"
      >
        <form onSubmit={onZarinpalSubmit} className="admin-form max-w-md space-y-3">
          <FormField
            label={t("amountToman")}
            name="amount"
            type="number"
            step="1"
            min="10000"
            required
            placeholder={t("amountToman")}
          />
          <FormSubmit loading={loading}>{t("payWithZarinpal")}</FormSubmit>
        </form>
      </PanelSection>
    </div>
  );
}
