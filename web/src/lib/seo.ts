import { routing } from "@/i18n/routing";

const base = () => process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/** Path without locale prefix, e.g. "/plans" or "" for home */
export function localeAlternates(path: string): { fa: string; en: string } {
  const normalized = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  const faPath = normalized || "/";
  const enPath = normalized ? `/en${normalized}` : "/en";
  return {
    fa: `${base()}${faPath}`,
    en: `${base()}${enPath}`,
  };
}

export function localePathForSitemap(locale: string, path: string): string {
  if (locale === routing.defaultLocale) {
    return path || "/";
  }
  return path ? `/en${path}` : "/en";
}
