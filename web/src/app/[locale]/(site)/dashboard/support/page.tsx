"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  FormField,
  FormFile,
  FormMessage,
  FormSubmit,
} from "@/components/forms";
import { TicketingClosedNotice } from "@/components/TicketingClosedNotice";
import { useTicketingEnabled } from "@/components/SiteConfigProvider";
import {
  createTicket,
  listTickets,
  TicketApiError,
  type Ticket,
} from "@/lib/tickets";

function statusLabel(t: ReturnType<typeof useTranslations>, status: string) {
  if (status === "claimed") return t("statusClaimed");
  if (status === "closed") return t("statusClosed");
  return t("statusOpen");
}

function mapTicketError(t: ReturnType<typeof useTranslations>, err: unknown): string {
  if (err instanceof TicketApiError) {
    if (err.status === 401) return t("unauthorized");
    if (err.status === 429) return t("rateLimited");
    if (err.status >= 500) return t("unavailable");
    return err.message || t("failed");
  }
  if (err instanceof Error) return err.message;
  return t("failed");
}

export default function SupportListPage() {
  const ticketingEnabled = useTicketingEnabled();
  const t = useTranslations("support");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [listErr, setListErr] = useState("");
  const [formMsg, setFormMsg] = useState("");
  const [formErr, setFormErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setListErr("");
    return listTickets()
      .then(setTickets)
      .catch((e) => {
        if (e instanceof TicketApiError && e.status === 401) {
          setListErr(t("unauthorized"));
        } else {
          setListErr(t("listLoadFailed"));
        }
      })
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    if (!ticketingEnabled) return;
    load();
  }, [load, ticketingEnabled]);

  if (!ticketingEnabled) {
    return <TicketingClosedNotice />;
  }

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setFormErr("");
    setFormMsg("");
    const fd = new FormData(e.currentTarget);
    const subject = String(fd.get("subject") ?? "").trim();
    const body = String(fd.get("body") ?? "").trim();
    const file = fd.get("attachment");
    const hasFile = file instanceof File && file.size > 0;
    if (!subject) {
      setFormErr(t("subjectRequired"));
      setSubmitting(false);
      return;
    }
    if (!body && !hasFile) {
      setFormErr(t("messageRequired"));
      setSubmitting(false);
      return;
    }
    try {
      await createTicket(fd);
      setFormMsg(t("ticketCreated"));
      (e.target as HTMLFormElement).reset();
      await load();
    } catch (ex) {
      setFormErr(mapTicketError(t, ex));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-[var(--muted)] mt-1">{t("subtitle")}</p>
      </div>

      <form onSubmit={onCreate} className="admin-form max-w-xl space-y-4">
        <h2 className="text-lg font-semibold">{t("newTicket")}</h2>
        <p className="text-sm text-[var(--muted)]">{t("createHint")}</p>
        <FormField name="subject" label={t("subject")} required />
        <FormField name="body" label={t("message")} multiline />
        <FormFile name="attachment" label={t("attachment")} accept="image/*,.pdf" />
        {formMsg && <FormMessage variant="success">{formMsg}</FormMessage>}
        {formErr && <FormMessage variant="error">{formErr}</FormMessage>}
        <FormSubmit loading={submitting}>
          {submitting ? t("submitting") : t("submit")}
        </FormSubmit>
      </form>

      <section>
        <h2 className="text-lg font-semibold mb-3">{t("title")}</h2>
        {listErr && (
          <p className="text-sm text-red-600 mb-2">{listErr}</p>
        )}
        {loading ? (
          <p className="text-sm text-[var(--muted)]">…</p>
        ) : tickets.length === 0 && !listErr ? (
          <p className="text-sm text-[var(--muted)]">{t("noTickets")}</p>
        ) : (
          <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
            {tickets.map((tk) => (
              <li key={tk.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{tk.subject}</p>
                  <p className="text-xs text-[var(--muted)]">
                    #{tk.id} · {statusLabel(t, tk.status)}
                  </p>
                </div>
                <Link
                  href={`/dashboard/support/${tk.id}`}
                  className="text-sm text-brand-600 font-medium shrink-0"
                >
                  {t("view")}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
