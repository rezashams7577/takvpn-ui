/** Public support line (Telegram, email, etc.). Set NEXT_PUBLIC_SUPPORT_CONTACT in env. */
export const supportContact =
  process.env.NEXT_PUBLIC_SUPPORT_CONTACT?.trim() ?? "";

export function supportContactOrFallback(fallback: string): string {
  return supportContact || fallback;
}
