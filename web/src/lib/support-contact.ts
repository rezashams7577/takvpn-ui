import { getTranslations } from "next-intl/server";

/** Resolved public support line for copy ({contact} placeholders). */
export async function resolveSupportContact(): Promise<string> {
  const tSite = await getTranslations("site");
  const tHome = await getTranslations("home");
  const fromEnv = tSite("supportContact").trim();
  if (fromEnv) return fromEnv;
  return tHome("supportFallback");
}
