import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteConfigProvider } from "@/components/SiteConfigProvider";
import { TelegramSupportFab } from "@/components/TelegramSupportFab";
import { getSiteConfig } from "@/lib/site-config";

export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const siteConfig = await getSiteConfig();

  return (
    <SiteConfigProvider config={siteConfig}>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <TelegramSupportFab />
    </SiteConfigProvider>
  );
}
