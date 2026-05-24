import { getRequestConfig } from "next-intl/server";
import { supportContact } from "@/lib/site";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as "fa" | "en")) {
    locale = routing.defaultLocale;
  }
  const messages = (await import(`../../messages/${locale}.json`)).default;
  return {
    locale,
    messages: {
      ...messages,
      site: { supportContact },
    },
  };
});
