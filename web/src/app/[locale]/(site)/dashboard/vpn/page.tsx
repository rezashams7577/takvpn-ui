"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { fetchVPN, retryVpnProvision, vpnDownloadUrl, type VPNService } from "@/lib/api";
import { toast } from "@/components/toast";

function vpnStatusLabel(status: string, t: ReturnType<typeof useTranslations<"dashboard">>) {
  switch (status) {
    case "active":
      return t("vpnStatusActive");
    case "provisioning":
      return t("vpnStatusProvisioning");
    case "failed":
      return t("vpnStatusFailed");
    default:
      return status;
  }
}

export default function VPNPage() {
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const [list, setList] = useState<VPNService[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetchVPN()
        .then((items) => {
          if (!cancelled) setList(items);
        })
        .catch(() => {
          if (!cancelled) setList([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    load();
    const interval = setInterval(load, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  async function handleRetry(vpnId: number) {
    setRetryingId(vpnId);
    try {
      await retryVpnProvision(vpnId);
      toast.success(t("vpnRetryStarted"));
      const items = await fetchVPN();
      setList(items);
    } catch {
      toast.error(t("vpnRetryFailed"));
    } finally {
      setRetryingId(null);
    }
  }

  const dateLocale = locale === "fa" ? "fa-IR" : "en-US";

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("myVpnsTitle")}</h1>
      <p className="text-sm text-[var(--muted)] mt-1">{t("myVpnsHint")}</p>
      <ul className="mt-8 space-y-4">
        {loading && <li className="text-[var(--muted)]">{t("processing")}</li>}
        {!loading && list.length === 0 && (
          <li className="text-[var(--muted)]">{t("noVpns")}</li>
        )}
        {list.map((v, index) => (
          <li
            key={v.id || v.order_id || index}
            className="rounded-xl border border-[var(--border)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <p className="font-medium">
                {v.comment || t("vpnLabel", { id: v.id })}
              </p>
              <p className="text-sm text-[var(--muted)]">
                {t("status")}:{" "}
                <span className="font-medium">{vpnStatusLabel(v.status, t)}</span>
                {v.expires_at &&
                  ` · ${t("expires")} ${new Date(v.expires_at).toLocaleDateString(dateLocale)}`}
              </p>
              {v.status === "failed" && (
                <p className="text-sm text-[var(--muted)] mt-2">{t("vpnProvisionFailedHint")}</p>
              )}
              {v.public_key && (
                <a
                  href={`https://chart.pqhost.eu/${v.public_key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-600 mt-1 inline-block"
                >
                  {t("viewChart")}
                </a>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              {v.status === "failed" && v.id > 0 && (
                <button
                  type="button"
                  disabled={retryingId === v.id}
                  onClick={() => handleRetry(v.id)}
                  className="rounded-lg border border-brand-600 text-brand-600 px-4 py-2 text-sm font-medium text-center disabled:opacity-50"
                >
                  {retryingId === v.id ? t("processing") : t("vpnRetryProvision")}
                </button>
              )}
              {v.status === "active" && v.id > 0 && (
                <a
                  href={vpnDownloadUrl(v.id)}
                  className="rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-medium text-center"
                >
                  {t("downloadPackage")}
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
