"use client";

import type { Ticket, TicketMessage } from "./tickets";

export type TicketSocketEvent =
  | { type: "ticket.created"; ticket: Ticket; message?: TicketMessage }
  | { type: "ticket.claimed"; ticket: Ticket }
  | { type: "ticket.claim_failed"; ticket?: { id: number } }
  | { type: "ticket.unclaimed"; ticket: Ticket }
  | { type: "ticket.message"; ticket: Ticket; message: TicketMessage }
  | { type: "ticket.closed"; ticket: Ticket }
  | { type: "pong" }
  | { type: "error"; error: string };

/** WebSocket base URL (no path). Uses same origin in the browser so auth cookies reach the API via Next rewrites. */
export function wsBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${window.location.host}`;
  }
  return "ws://127.0.0.1:8080";
}

export function ticketWsUrl(): string {
  return `${wsBaseUrl()}/api/v1/ws`;
}

type Handlers = {
  onEvent: (ev: TicketSocketEvent) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: () => void;
  /** Called after several consecutive failed connection attempts (still retries in background). */
  onConnectionFailed?: () => void;
};

export type TicketSocketHandle = {
  subscribe: (ticketId: number) => boolean;
  unsubscribe: (ticketId: number) => boolean;
  claim: (ticketId: number) => boolean;
  isOpen: () => boolean;
  close: () => void;
};

const MAX_FAILURES_BEFORE_FAILED = 3;

export function createTicketSocket(handlers: Handlers): TicketSocketHandle {
  let ws: WebSocket | null = null;
  let closed = false;
  let retryMs = 1000;
  let failCount = 0;
  let pingTimer: ReturnType<typeof setInterval> | null = null;

  function connect() {
    if (closed || typeof window === "undefined") return;
    ws = new WebSocket(ticketWsUrl());
    ws.onopen = () => {
      failCount = 0;
      retryMs = 1000;
      handlers.onOpen?.();
      pingTimer = setInterval(() => {
        send({ type: "ping" });
      }, 45000);
    };
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data as string) as TicketSocketEvent;
        handlers.onEvent(data);
      } catch {
        /* ignore */
      }
    };
    ws.onclose = () => {
      if (pingTimer) clearInterval(pingTimer);
      pingTimer = null;
      handlers.onClose?.();
      if (!closed) {
        failCount += 1;
        if (failCount >= MAX_FAILURES_BEFORE_FAILED) {
          handlers.onConnectionFailed?.();
        }
        setTimeout(connect, retryMs);
        retryMs = Math.min(retryMs * 2, 30000);
      }
    };
    ws.onerror = () => {
      handlers.onError?.();
      ws?.close();
    };
  }

  function send(payload: object): boolean {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }

  connect();

  return {
    isOpen() {
      return ws?.readyState === WebSocket.OPEN;
    },
    subscribe(ticketId: number) {
      return send({ type: "subscribe", ticket_id: ticketId });
    },
    unsubscribe(ticketId: number) {
      return send({ type: "unsubscribe", ticket_id: ticketId });
    },
    claim(ticketId: number) {
      return send({ type: "claim", ticket_id: ticketId });
    },
    close() {
      closed = true;
      if (pingTimer) clearInterval(pingTimer);
      ws?.close();
    },
  };
}
