"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { FormField, FormMessage, FormSubmit } from "@/components/forms";
import { register } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      await register({
        email: fd.get("email") as string,
        password: fd.get("password") as string,
        name: (fd.get("name") as string) || undefined,
        locale,
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("registerFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold">{t("createAccount")}</h1>
      <form onSubmit={onSubmit} className="admin-form mt-8 max-w-md space-y-3" dir="ltr">
        <FormField label={t("name")} name="name" type="text" />
        <FormField label={t("email")} name="email" type="email" required />
        <FormField
          label={t("passwordHint")}
          name="password"
          type="password"
          minLength={8}
          required
        />
        {error && <FormMessage variant="error">{error}</FormMessage>}
        <FormSubmit loading={loading} className="w-full">
          {loading ? t("registerLoading") : t("register")}
        </FormSubmit>
      </form>
      <p className="mt-4 text-sm text-center text-[var(--muted)]">
        {t("hasAccount")}{" "}
        <Link href="/login" locale={locale} className="text-brand-600">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}
