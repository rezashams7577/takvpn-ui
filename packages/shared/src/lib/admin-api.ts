import { cookieHeaderForApi } from "./server-cookies";

const API_BASE =
  typeof window === "undefined"
    ? process.env.API_INTERNAL_URL || "http://127.0.0.1:8080"
    : "";

export type StaffRole = "customer" | "support" | "admin" | "super_admin";

export function isStaffRole(role: string): boolean {
  return role === "support" || role === "admin" || role === "super_admin";
}

export type AdminStats = {
  total_customers: number;
  pending_zarinpal: number;
  orders_today: number;
  active_vpn_services: number;
};

export type AdminPlan = {
  id: number;
  slug: string;
  name: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  duration_days: number | null;
  traffic_gb?: string;
  interface_id: number;
  price_usdt?: string;
  price_irr?: string;
  is_active: boolean;
  sort_order: number;
};

export type CustomerListItem = {
  id: number;
  email: string;
  name?: string;
  locale: string;
  status: string;
  role: StaffRole;
  created_at: string;
};

export type AdminOrder = {
  id: number;
  customer_id: number;
  customer_email: string;
  plan_id: number;
  plan_name: string;
  status: string;
  currency: string;
  amount: string;
  created_at: string;
};

export type WalletTransaction = {
  id: number;
  customer_id: number;
  customer_email?: string;
  type: string;
  amount: string;
  currency: string;
  note?: string;
  created_at: string;
};

export type PaymentItem = {
  id: number;
  customer_id: number;
  customer_email?: string;
  provider: string;
  external_id?: string;
  status: string;
  amount: string;
  currency: string;
  created_at: string;
};

export type USDTDeposit = {
  id: number;
  customer_id: number;
  customer_email?: string;
  network: string;
  credit_amount: string;
  pay_amount: string;
  deposit_address: string;
  status: string;
  tx_hash?: string;
  confirmations: number;
  admin_note?: string;
  expires_at: string;
  paid_at?: string;
  created_at: string;
};

export type VPNServiceAdmin = {
  id: number;
  customer_id: number;
  customer_email?: string;
  order_id: number;
  status: string;
  comment?: string;
  public_key?: string;
  expires_at?: string;
  created_at: string;
};

export type AdminOrderDetail = {
  order: AdminOrder;
  vpn_service: VPNServiceAdmin | null;
};

export type AuditLogEntry = {
  id: number;
  customer_id?: number;
  action: string;
  entity_type?: string;
  entity_id?: number;
  ip_address?: string;
  created_at: string;
};

export function asArray<T>(data: T[] | null | undefined): T[] {
  return Array.isArray(data) ? data : [];
}

async function adminFetch<T>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  };
  if (init?.json) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(init.json);
  }
  const cookieHeader = await cookieHeaderForApi();
  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });
  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined") {
      const loginPath = window.location.pathname.startsWith("/en/")
        ? "/en/admin/login"
        : "/admin/login";
      window.location.href = loginPath;
    }
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || "Request failed");
  }
  return res.json() as Promise<T>;
}

export const adminStats = () => adminFetch<AdminStats>("/api/v1/admin/stats");
export const adminListPlans = async () =>
  asArray(await adminFetch<AdminPlan[] | null>("/api/v1/admin/plans"));
export const adminGetPlan = (id: number) => adminFetch<AdminPlan>(`/api/v1/admin/plans/${id}`);
export const adminCreatePlan = (data: Record<string, unknown>) =>
  adminFetch("/api/v1/admin/plans", { method: "POST", json: data });
export const adminUpdatePlan = (id: number, data: Record<string, unknown>) =>
  adminFetch(`/api/v1/admin/plans/${id}`, { method: "PUT", json: data });

export const adminListCustomers = async (q = "", page = 1) => {
  const r = await adminFetch<{ items: CustomerListItem[] | null; total: number }>(
    `/api/v1/admin/customers?q=${encodeURIComponent(q)}&page=${page}`
  );
  return { items: asArray(r.items), total: r.total };
};
export const adminGetCustomer = (id: number) =>
  adminFetch<Record<string, unknown>>(`/api/v1/admin/customers/${id}`);
export const adminPatchCustomer = (id: number, data: Record<string, unknown>) =>
  adminFetch(`/api/v1/admin/customers/${id}`, { method: "PATCH", json: data });
export const adminResetPassword = (id: number, new_password: string) =>
  adminFetch(`/api/v1/admin/customers/${id}/reset-password`, {
    method: "POST",
    json: { new_password },
  });
export const adminCreateStaff = (data: Record<string, unknown>) =>
  adminFetch("/api/v1/admin/customers", { method: "POST", json: data });
export const adminSetRole = (id: number, role: string) =>
  adminFetch(`/api/v1/admin/customers/${id}/role`, { method: "PATCH", json: { role } });

export const adminListOrders = async () =>
  asArray(await adminFetch<AdminOrder[] | null>("/api/v1/admin/orders"));
export const adminGetOrder = (id: number) =>
  adminFetch<AdminOrderDetail>(`/api/v1/admin/orders/${id}`);
export const adminListWalletTxns = async (customerId?: number) =>
  asArray(
    await adminFetch<WalletTransaction[] | null>(
      `/api/v1/admin/wallet-transactions${customerId ? `?customer_id=${customerId}` : ""}`
    )
  );
export const adminListPayments = async (customerId?: number) =>
  asArray(
    await adminFetch<PaymentItem[] | null>(
      `/api/v1/admin/payments${customerId ? `?customer_id=${customerId}` : ""}`
    )
  );
export const adminWalletAdjust = (data: {
  customer_id: number;
  currency: string;
  amount: string;
  direction?: "credit" | "debit";
  note: string;
}) => adminFetch("/api/v1/admin/wallet/adjustment", { method: "POST", json: data });

export const adminListUSDT = async (status = "pending") =>
  asArray(
    await adminFetch<USDTDeposit[] | null>(
      `/api/v1/admin/usdt-deposits${status ? `?status=${status}` : ""}`
    )
  );
export const adminApproveUSdt = (id: number, tx_hash: string, note: string) =>
  adminFetch(`/api/v1/admin/usdt-deposits/${id}/approve`, {
    method: "POST",
    json: { tx_hash, note },
  });
export const adminRejectUSDT = (id: number, note: string) =>
  adminFetch(`/api/v1/admin/usdt-deposits/${id}/reject`, { method: "POST", json: { note } });
export type PaymentSettings = {
  trc20_deposit_address: string;
  erc20_deposit_address: string;
  usdt_enabled: boolean;
  toman_enabled: boolean;
  effective: { trc20: string; erc20: string };
  env_fallback: { trc20: string; erc20: string };
  updated_at?: string;
};

export const adminGetPaymentSettings = () =>
  adminFetch<PaymentSettings>("/api/v1/admin/payment-settings");

export const adminUpdatePaymentSettings = (data: {
  trc20_deposit_address: string;
  erc20_deposit_address: string;
  usdt_enabled?: boolean;
  toman_enabled?: boolean;
}) =>
  adminFetch<PaymentSettings>("/api/v1/admin/payment-settings", {
    method: "PUT",
    json: data,
  });

export const adminListVPN = async (status = "") =>
  asArray(
    await adminFetch<VPNServiceAdmin[] | null>(
      `/api/v1/admin/vpn-services${status ? `?status=${status}` : ""}`
    )
  );
export const adminGetVPN = (id: number) =>
  adminFetch<VPNServiceAdmin>(`/api/v1/admin/vpn-services/${id}`);
export const adminReprovisionVPN = (id: number) =>
  adminFetch(`/api/v1/admin/vpn-services/${id}/reprovision`, { method: "POST" });

export const adminListAudit = async (
  page = 1,
  action = "",
  opts?: { entity_id?: number; entity_type?: string }
) => {
  const params = new URLSearchParams({ page: String(page), action });
  if (opts?.entity_id) params.set("entity_id", String(opts.entity_id));
  if (opts?.entity_type) params.set("entity_type", opts.entity_type);
  const r = await adminFetch<{ items: AuditLogEntry[] | null; total: number }>(
    `/api/v1/admin/audit-logs?${params.toString()}`
  );
  return { items: asArray(r.items), total: r.total };
};

export { changePassword } from "./api";
