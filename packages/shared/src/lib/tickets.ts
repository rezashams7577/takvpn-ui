import { tryRefreshSession } from "./auth-session";
import { cookieHeaderForApi } from "./server-cookies";

const API_BASE =
  typeof window === "undefined"
    ? process.env.API_INTERNAL_URL || "http://127.0.0.1:8080"
    : "";

export type TicketStatus = "open" | "claimed" | "closed";

export type Ticket = {
  id: number;
  customer_id: number;
  customer_email?: string;
  customer_name?: string;
  subject: string;
  status: TicketStatus;
  claimed_by?: number;
  claimed_by_email?: string;
  claimed_by_name?: string;
  claimed_at?: string;
  last_message_at: string;
  created_at: string;
};

export type TicketMessage = {
  id: number;
  ticket_id: number;
  sender_id: number;
  sender_role: "customer" | "staff";
  sender_email?: string;
  sender_name?: string;
  body?: string;
  has_attachment?: boolean;
  attachment_name?: string;
  attachment_mime?: string;
  created_at: string;
};

export type TicketDetail = {
  ticket: Ticket;
  messages: TicketMessage[];
};

export class TicketApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function ticketFetchOnce(
  path: string,
  init: RequestInit | undefined,
  cookieHeader?: string
): Promise<Response> {
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  };
  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }
  return fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });
}

async function ticketFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  let cookieHeader = await cookieHeaderForApi();
  let res = await ticketFetchOnce(path, init, cookieHeader);

  if (res.status === 401 && cookieHeader && typeof window === "undefined") {
    const refreshRes = await ticketFetchOnce(
      "/api/v1/auth/refresh",
      { method: "POST" },
      cookieHeader
    );
    if (refreshRes.ok) {
      const setCookies =
        typeof refreshRes.headers.getSetCookie === "function"
          ? refreshRes.headers.getSetCookie()
          : [];
      if (setCookies.length > 0) {
        cookieHeader = setCookies.map((c) => c.split(";")[0]).join("; ");
      }
      res = await ticketFetchOnce(path, init, cookieHeader);
    }
  }

  if (res.status === 401 && typeof window !== "undefined") {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      res = await ticketFetchOnce(path, init);
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    const msg = (err as { error?: string }).error || res.statusText || "Request failed";
    throw new TicketApiError(res.status, msg);
  }
  return res.json() as Promise<T>;
}

export function ticketAttachmentUrl(ticketId: number, messageId: number, admin = false) {
  const base = admin
    ? `/api/v1/admin/tickets/${ticketId}/messages/${messageId}/attachment`
    : `/api/v1/tickets/${ticketId}/messages/${messageId}/attachment`;
  return base;
}

export async function listTickets() {
  return ticketFetch<Ticket[]>("/api/v1/tickets");
}

export async function getTicket(id: number) {
  return ticketFetch<TicketDetail>(`/api/v1/tickets/${id}`);
}

export async function createTicket(form: FormData) {
  return ticketFetch<{ ticket: Ticket; message: TicketMessage }>("/api/v1/tickets", {
    method: "POST",
    body: form,
  });
}

export async function sendTicketMessage(ticketId: number, form: FormData) {
  return ticketFetch<{ ticket: Ticket; message: TicketMessage }>(
    `/api/v1/tickets/${ticketId}/messages`,
    { method: "POST", body: form }
  );
}

export async function closeTicket(ticketId: number) {
  return ticketFetch<Ticket>(`/api/v1/tickets/${ticketId}/close`, { method: "POST" });
}

export async function adminListTickets(status = "open") {
  return ticketFetch<Ticket[]>(`/api/v1/admin/tickets?status=${encodeURIComponent(status)}`);
}

export async function adminGetTicket(id: number) {
  return ticketFetch<TicketDetail>(`/api/v1/admin/tickets/${id}`);
}

export async function adminClaimTicket(ticketId: number) {
  return ticketFetch<Ticket>(`/api/v1/admin/tickets/${ticketId}/claim`, {
    method: "POST",
  });
}

export async function adminSendTicketMessage(ticketId: number, form: FormData) {
  return ticketFetch<{ ticket: Ticket; message: TicketMessage }>(
    `/api/v1/admin/tickets/${ticketId}/messages`,
    { method: "POST", body: form }
  );
}

export async function adminCloseTicket(ticketId: number) {
  return ticketFetch<Ticket>(`/api/v1/admin/tickets/${ticketId}/close`, { method: "POST" });
}
