import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { accessTokenExpired } from "@takvpn/shared/lib/auth-session";
import { adminAppUrl } from "@takvpn/shared/lib/app-urls";

const intlMiddleware = createMiddleware(routing);

function requestWithPathname(request: NextRequest): NextRequest {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  return new NextRequest(request.url, { headers });
}

function runIntl(request: NextRequest): NextResponse {
  return intlMiddleware(requestWithPathname(request));
}

function dashboardPath(pathname: string): string | null {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return pathname;
  }
  if (pathname === "/en/dashboard" || pathname.startsWith("/en/dashboard/")) {
    return pathname;
  }
  return null;
}

function adminPath(pathname: string): string | null {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return pathname;
  }
  if (pathname === "/en/admin" || pathname.startsWith("/en/admin/")) {
    return pathname;
  }
  return null;
}

function localeFromPath(pathname: string): string {
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return "en";
  }
  return routing.defaultLocale;
}

function loginPath(pathname: string): string {
  const locale = localeFromPath(pathname);
  const base = "/login";
  const login = locale === routing.defaultLocale ? base : `/${locale}${base}`;
  return `${login}?next=${encodeURIComponent(pathname)}`;
}

function clearAuthCookies(res: NextResponse) {
  for (const name of ["takvpn_access", "takvpn_refresh"]) {
    res.cookies.set(name, "", { path: "/", maxAge: 0 });
  }
  res.cookies.set("takvpn_refresh", "", { path: "/api/v1/auth", maxAge: 0 });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const access = request.cookies.get("takvpn_access")?.value;
  const accessValid = !!access && !accessTokenExpired(access);
  const locale = localeFromPath(pathname);

  if (pathname === "/fa" || pathname.startsWith("/fa/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/fa" ? "/" : pathname.slice(3) || "/";
    return NextResponse.redirect(url, 301);
  }

  const admin = adminPath(pathname);
  if (admin) {
    const target = adminAppUrl(admin, locale);
    return NextResponse.redirect(target);
  }

  const dash = dashboardPath(pathname);
  if (dash && !accessValid) {
    const login = new URL(loginPath(dash), request.url);
    const res = NextResponse.redirect(login);
    if (access) {
      clearAuthCookies(res);
    }
    return res;
  }

  return runIntl(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
