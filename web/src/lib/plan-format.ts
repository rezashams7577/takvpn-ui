export function formatTrafficGb(gb: string, locale: string): string {
  const n = Number(gb);
  if (n >= 1000) {
    return locale === "en" ? "1 TB" : "۱ ترابایت";
  }
  if (locale === "en") {
    return `${n} GB`;
  }
  return `${n.toLocaleString("fa-IR")} گیگابایت`;
}
