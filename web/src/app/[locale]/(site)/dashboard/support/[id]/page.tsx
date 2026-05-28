"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  FormField,
  FormFile,
  FormMessage,
  FormSubmit,
} from "@/components/forms";
import { createTicketSocket } from "@/lib/ticket-socket";
import {
  closeTicket,
  getTicket,
  sendTicketMessage,
  ticketAttachmentUrl,
  type Ticket,
  type TicketMessage,
} from "@/lib/tickets";

export default function SupportThreadPage() {
  const t = useTranslations("support");
  const params = useParams();
  const ticketId = Number(params.id);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof createTicketSocket> | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getTicket(ticketId);
      setTicket(data.ticket);
      setMessages(data.messages);
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("failed"));
    }
  }, [ticketId, t]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!ticketId) return;
    const sock = createTicketSocket({
      onOpen: () => {
        setConnected(true);
        setConnectionFailed(false);
        sock.subscribe(ticketId);
      },
      onClose: () => setConnected(false),
      onError: () => setConnectionFailed(true),
      onConnectionFailed: () => setConnectionFailed(true),
      onEvent: (ev) => {
        if (ev.type === "ticket.message" && ev.ticket.id === ticketId) {
          setTicket(ev.ticket);
          setMessages((prev) => {
            if (prev.some((m) => m.id === ev.message.id)) return prev;
            return [...prev, ev.message];
          });
        }
        if (
          (ev.type === "ticket.claimed" || ev.type === "ticket.unclaimed" || ev.type === "ticket.closed") &&
          ev.ticket.id === ticketId
        ) {
          setTicket(ev.ticket);
        }
      },
    });
    socketRef.current = sock;
    return () => sock.close();
  }, [ticketId]);

  async function onReply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ticket || ticket.status === "closed") return;
    setSubmitting(true);
    setErr("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await sendTicketMessage(ticketId, fd);
      setTicket(res.ticket);
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.message.id)) return prev;
        return [...prev, res.message];
      });
      (e.target as HTMLFormElement).reset();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : t("failed"));
    } finally {
      setSubmitting(false);
    }
  }

  async function onClose() {
    try {
      const tk = await closeTicket(ticketId);
      setTicket(tk);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : t("failed"));
    }
  }

  if (!ticket) {
    return <p className="text-sm text-[var(--muted)]">{err || "…"}</p>;
  }

  const agentName =
    ticket.claimed_by_name || ticket.claimed_by_email || "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/support" className="text-sm text-brand-600">
            {t("backToList")}
          </Link>
          <h1 className="text-2xl font-bold mt-2">{ticket.subject}</h1>
          <p className="text-xs text-[var(--muted)]">
            #{ticket.id} ·{" "}
            <span
              className={
                connected
                  ? "text-green-600"
                  : connectionFailed
                    ? "text-red-600"
                    : "text-amber-600"
              }
            >
              {connected
                ? t("connected")
                : connectionFailed
                  ? t("wsConnectionFailed")
                  : t("disconnected")}
            </span>
          </p>
        </div>
        {ticket.status !== "closed" && (
          <button
            type="button"
            onClick={onClose}
            className="text-sm rounded-lg border border-[var(--border)] px-3 py-2"
          >
            {t("closeTicket")}
          </button>
        )}
      </div>

      {ticket.status === "open" && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm">
          {t("waitingForAgent")}
        </div>
      )}
      {ticket.status === "claimed" && (
        <div className="rounded-lg bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 px-4 py-3 text-sm">
          {agentName
            ? t("agentAssigned", { name: agentName })
            : t("agentAssignedGeneric")}
        </div>
      )}
      {ticket.status === "closed" && (
        <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)]">
          {t("closedHint")}
        </div>
      )}

      <div className="space-y-3 max-h-[28rem] overflow-y-auto rounded-xl border border-[var(--border)] p-4 bg-[var(--card)]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`text-sm rounded-lg px-3 py-2 max-w-[85%] ${
              m.sender_role === "customer"
                ? "ml-auto bg-brand-600 text-white"
                : "mr-auto bg-[var(--border)]"
            }`}
          >
            {m.body && <p className="whitespace-pre-wrap">{m.body}</p>}
            {m.has_attachment && (
              <a
                href={ticketAttachmentUrl(ticketId, m.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-xs mt-1 block"
              >
                {m.attachment_name || "Attachment"}
              </a>
            )}
            <p className="text-[10px] opacity-70 mt-1">
              {new Date(m.created_at).toLocaleString()}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onReply} className="admin-form max-w-xl space-y-3">
        <FormField name="body" label={t("message")} multiline />
        <FormFile name="attachment" label={t("attachment")} accept="image/*,.pdf" />
        {err && <FormMessage variant="error">{err}</FormMessage>}
        <FormSubmit loading={submitting}>
          {submitting ? t("submitting") : t("reply")}
        </FormSubmit>
      </form>
    </div>
  );
}
