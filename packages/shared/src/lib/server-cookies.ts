/** Forward browser auth cookies when calling the API from Server Components. */
export async function cookieHeaderForApi(): Promise<string | undefined> {
  if (typeof window !== "undefined") return undefined;
  const { cookies } = await import("next/headers");
  const store = await cookies();
  const parts = store.getAll().map((c) => `${c.name}=${c.value}`);
  return parts.length ? parts.join("; ") : undefined;
}
