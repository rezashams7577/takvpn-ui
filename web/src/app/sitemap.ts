import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { localePathForSitemap } from "@/lib/seo";

const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const staticPaths = ["", "/plans", "/how-it-works", "/faq", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${base}${localePathForSitemap(locale, path)}`,
      changeFrequency: path === "" || path === "/plans" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : path === "/plans" ? 0.9 : 0.6,
    }))
  );
}
