/** Decode JWT exp without verifying signature (middleware / client UX only). */
export function accessTokenExpired(token: string | undefined): boolean {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(b64)) as { exp?: number };
    if (typeof payload.exp !== "number") return false;
    return payload.exp * 1000 < Date.now() - 5000;
  } catch {
    return true;
  }
}

/** Browser: attempt silent refresh using httpOnly refresh cookie. */
export async function tryRefreshSession(apiBase = ""): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const res = await fetch(`${apiBase}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  return res.ok;
}
