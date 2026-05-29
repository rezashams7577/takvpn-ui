/** Public support line (Telegram, email, etc.). Set NEXT_PUBLIC_SUPPORT_CONTACT in env. */
export const supportContact =
  process.env.NEXT_PUBLIC_SUPPORT_CONTACT?.trim() ?? "@takvpnsupportt";

export const telegramChannelUrl =
  process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL?.trim() ??
  "https://t.me/takvpnofficial";

export const telegramSupportUrl =
  process.env.NEXT_PUBLIC_TELEGRAM_SUPPORT_URL?.trim() ??
  "https://t.me/takvpnsupportt";

export function supportContactOrFallback(fallback: string): string {
  return supportContact || fallback;
}
