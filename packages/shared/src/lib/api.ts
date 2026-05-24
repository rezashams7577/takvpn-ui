import { tryRefreshSession } from "./auth-session";
import { ApiError } from "./api-errors";
import { cookieHeaderForApi } from "./server-cookies";

export { ApiError, isApiError, isInsufficientBalance, mapApiError } from "./api-errors";

const API_BASE =
  typeof window === "undefined"
    ? process.env.API_INTERNAL_URL || "http://127.0.0.1:8080"
    : "";

export type Plan = {
  id: number;
  slug: string;
  name: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  duration_days: number;
  traffic_gb?: string;
  price_usdt: string;
  price_irr: string;
  is_active: boolean;
};

export type ExchangeRate = {
  usdt_irr: string;
  effective_at: string;
};

export type Wallet = {
  id: number;
  currency: string;
  balance: string;
};

/** Legacy API responses used PascalCase before Wallet gained json tags. */
type WalletRaw = Partial<Wallet> & {
  ID?: number;
  Currency?: string;
  Balance?: string;
};

function normalizeWallet(w: WalletRaw): Wallet {
  return {
    id: w.id ?? w.ID ?? 0,
    currency: w.currency ?? w.Currency ?? "",
    balance: w.balance ?? w.Balance ?? "0",
  };
}

export type Me = {
  id: number;
  email: string;
  name?: string;
  locale: string;
  role: string;
  wallets: Wallet[];
};

export type VPNService = {
  id: number;
  order_id: number;
  omig_peer_id?: number;
  public_key?: string;
  comment?: string;
  expires_at?: string;
  status: string;
};

/** Legacy API responses used PascalCase and sql.Null* shapes before VPNServiceListItem. */
type VPNServiceRaw = Partial<VPNService> & {
  ID?: number;
  OrderID?: number;
  OmigPeerID?: number | { Int64?: number; Valid?: boolean };
  PublicKey?: string | { String?: string; Valid?: boolean };
  Comment?: string | { String?: string; Valid?: boolean };
  ExpiresAt?: string | { Time?: string; Valid?: boolean };
  Status?: string;
};

function nullString(v: string | { String?: string; Valid?: boolean } | undefined): string | undefined {
  if (v == null) return undefined;
  if (typeof v === "string") return v || undefined;
  return v.Valid ? v.String : undefined;
}

function nullInt(v: number | { Int64?: number; Valid?: boolean } | undefined): number | undefined {
  if (v == null) return undefined;
  if (typeof v === "number") return v || undefined;
  return v.Valid ? v.Int64 : undefined;
}

function nullTime(v: string | { Time?: string; Valid?: boolean } | undefined): string | undefined {
  if (v == null) return undefined;
  if (typeof v === "string") return v || undefined;
  return v.Valid ? v.Time : undefined;
}

export function normalizeVPN(v: VPNServiceRaw): VPNService {
  return {
    id: v.id ?? v.ID ?? 0,
    order_id: v.order_id ?? v.OrderID ?? 0,
    omig_peer_id: v.omig_peer_id ?? nullInt(v.OmigPeerID),
    public_key: v.public_key ?? nullString(v.PublicKey),
    comment: v.comment ?? nullString(v.Comment),
    expires_at: v.expires_at ?? nullTime(v.ExpiresAt),
    status: v.status ?? v.Status ?? "",
  };
}

async function apiFetch(
  path: string,
  init: RequestInit & { json?: unknown },
  cookieHeader?: string
): Promise<Response> {
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  };
  const { json, ...rest } = init;
  if (json) {
    headers["Content-Type"] = "application/json";
    rest.body = JSON.stringify(json);
  }
  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }
  return fetch(`${API_BASE}${path}`, {
    ...rest,
    credentials: "include",
    headers,
  });
}

async function api<T>(
  path: string,
  init?: RequestInit & { json?: unknown }
): Promise<T> {
  const baseInit = init ?? {};
  let cookieHeader = await cookieHeaderForApi();
  let res = await apiFetch(path, baseInit, cookieHeader);

  if (res.status === 401 && cookieHeader && typeof window === "undefined") {
    const refreshRes = await apiFetch("/api/v1/auth/refresh", { method: "POST" }, cookieHeader);
    if (refreshRes.ok) {
      const setCookies =
        typeof refreshRes.headers.getSetCookie === "function"
          ? refreshRes.headers.getSetCookie()
          : [];
      if (setCookies.length > 0) {
        cookieHeader = setCookies.map((c) => c.split(";")[0]).join("; ");
      }
      res = await apiFetch(path, baseInit, cookieHeader);
    }
  }

  if (res.status === 401 && typeof window !== "undefined") {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      res = await apiFetch(path, baseInit);
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    const code = (err as { error?: string }).error || "Request failed";
    throw new ApiError(res.status, code);
  }
  return res.json() as Promise<T>;
}

function localeQuery(locale: string) {
  return `locale=${encodeURIComponent(locale)}`;
}

export const fetchPlans = (locale = "fa") =>
  api<Plan[]>(`/api/v1/plans?${localeQuery(locale)}`);

export const fetchPlan = (slug: string, locale = "fa") =>
  api<Plan>(`/api/v1/plans/${slug}?${localeQuery(locale)}`);

export const fetchExchangeRate = () =>
  api<ExchangeRate>("/api/v1/exchange-rate");

export const fetchMe = async () => {
  const me = await api<Omit<Me, "wallets"> & { wallets?: WalletRaw[] | null }>(
    "/api/v1/me"
  );
  return {
    ...me,
    wallets: (me.wallets ?? []).map(normalizeWallet),
  } satisfies Me;
};

export const fetchVPN = async () => {
  const list = await api<(VPNService | VPNServiceRaw)[] | null>("/api/v1/vpn");
  return (list ?? []).map((v) => normalizeVPN(v));
};

export type AuthResponse = {
  customer_id: number;
  email: string;
  role: string;
};

export async function register(data: {
  email: string;
  password: string;
  name?: string;
  locale?: string;
}) {
  return api<AuthResponse>("/api/v1/auth/register", { method: "POST", json: data });
}

export async function login(data: { email: string; password: string }) {
  return api<AuthResponse>("/api/v1/auth/login", { method: "POST", json: data });
}

export async function logout() {
  return api("/api/v1/auth/logout", { method: "POST" });
}

export async function logoutAll() {
  return api("/api/v1/auth/logout-all", { method: "POST" });
}

export async function changePassword(current_password: string, new_password: string) {
  return api<{ status?: string }>("/api/v1/auth/change-password", {
    method: "POST",
    json: { current_password, new_password },
  });
}

export async function updateProfile(data: { name?: string; locale?: string }) {
  const me = await api<Omit<Me, "wallets"> & { wallets?: WalletRaw[] | null }>(
    "/api/v1/me",
    { method: "PATCH", json: data }
  );
  return {
    ...me,
    wallets: (me.wallets ?? []).map(normalizeWallet),
  } satisfies Me;
}

export async function forgotPassword(email: string) {
  return api<{ message: string }>("/api/v1/auth/forgot-password", {
    method: "POST",
    json: { email },
  });
}

export async function resetPassword(token: string, new_password: string) {
  return api<{ status: string }>("/api/v1/auth/reset-password", {
    method: "POST",
    json: { token, new_password },
  });
}

export async function createOrder(planId: number, currency: string) {
  return api<{ order_id: number; status: string }>("/api/v1/orders", {
    method: "POST",
    json: { plan_id: planId, currency },
  });
}

export type UsdtDeposit = {
  id: number;
  network: "trc20" | "erc20";
  deposit_address: string;
  pay_amount: string;
  credit_amount: string;
  status: string;
  confirmations?: number;
  tx_hash?: string;
  expires_at: string;
  paid_at?: string;
  created_at?: string;
};

export async function createUsdtDeposit(amount: number, network: "trc20" | "erc20") {
  return api<UsdtDeposit>("/api/v1/wallet/deposit/usdt", {
    method: "POST",
    json: { amount, network },
  });
}

export async function getUsdtDeposit(id: number) {
  return api<UsdtDeposit>(`/api/v1/wallet/deposit/usdt/${id}`);
}

export async function listUsdtDeposits() {
  return api<UsdtDeposit[]>("/api/v1/wallet/deposits/usdt");
}

export type ZarinpalDepositStart = {
  payment_id: number;
  payment_url: string;
};

export async function createZarinpalDeposit(amount: number) {
  return api<ZarinpalDepositStart>("/api/v1/wallet/deposit/zarinpal", {
    method: "POST",
    json: { amount },
  });
}

export type ZarinpalDepositStatus = {
  id: number;
  status: string;
  amount: string;
  currency: string;
  provider: string;
  payment_url?: string;
  authority?: string;
};

export async function getZarinpalDeposit(id: number) {
  return api<ZarinpalDepositStatus>(`/api/v1/wallet/deposit/zarinpal/${id}`);
}

export function vpnDownloadUrl(id: number, token?: string) {
  const q = token ? `?token=${encodeURIComponent(token)}` : "";
  return `/api/v1/vpn/${id}/download${q}`;
}
