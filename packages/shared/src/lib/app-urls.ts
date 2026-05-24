const DEFAULT_USER = "http://localhost:3000";
const DEFAULT_ADMIN = "http://localhost:3001";
const DEFAULT_LOCALE = "fa";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function stripLocalePrefix(path: string): string {
  if (path === "/en" || path.startsWith("/en/")) {
    return path.slice(3) || "/";
  }
  if (path === "/fa" || path.startsWith("/fa/")) {
    return path.slice(3) || "/";
  }
  return path;
}

function localePath(path: string, locale: string): string {
  const p = stripLocalePrefix(path.startsWith("/") ? path : `/${path}`);
  if (locale === DEFAULT_LOCALE) {
    return p;
  }
  return `/${locale}${p}`;
}

function absoluteUrl(base: string, path: string, locale: string): string {
  return `${stripTrailingSlash(base)}${localePath(path, locale)}`;
}

/** Customer-facing site (wallet, dashboard, marketing). */
export function userAppUrl(path: string, locale: string): string {
  const base =
    process.env.NEXT_PUBLIC_USER_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    DEFAULT_USER;
  return absoluteUrl(base, path, locale);
}

/** Staff admin panel (separate deploy / TLD). */
export function adminAppUrl(path: string, locale: string): string {
  const base = process.env.NEXT_PUBLIC_ADMIN_APP_URL || DEFAULT_ADMIN;
  return absoluteUrl(base, path, locale);
}

/** True when `next` targets the admin app origin (cross-domain login redirect). */
export function isAdminNextUrl(next: string | null | undefined): boolean {
  if (!next) return false;
  const adminBase = process.env.NEXT_PUBLIC_ADMIN_APP_URL || DEFAULT_ADMIN;
  try {
    const base = new URL(adminBase);
    const target = new URL(next, base);
    return target.origin === base.origin;
  } catch {
    return false;
  }
}
