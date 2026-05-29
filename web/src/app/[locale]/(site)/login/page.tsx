"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { FormField, FormMessage, FormSubmit } from "@/components/forms";
import { AuthClosedNotice } from "@/components/AuthClosedNotice";
import { tryRefreshSession } from "@takvpn/shared/lib/auth-session";
import { login } from "@/lib/api";
import { useAuthLoginEnabled, useAuthRegisterEnabled } from "@/components/SiteConfigProvider";
import { isStaffRole } from "@/lib/admin-api";
import { adminAppUrl, isAdminNextUrl } from "@/lib/app-urls";

export default function LoginPage() {
  const t = useTranslations("auth");
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-16">{t("loading")}</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const locale = useLocale();
  const search = useSearchParams();
  const authLoginEnabled = useAuthLoginEnabled();
  const authRegisterEnabled = useAuthRegisterEnabled();
  const t = useTranslations("auth");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    tryRefreshSession().then((ok) => {
      if (!ok) {
        setSessionChecked(true);
        return;
      }
      const next = search.get("next");
      if (next && isAdminNextUrl(next)) {
        const path = next.startsWith("http") ? new URL(next).pathname : next;
        window.location.href = adminAppUrl(path, locale);
        return;
      }
      router.replace((next as "/dashboard") || "/dashboard");
      router.refresh();
    });
  }, [router, search, locale]);

  if (!sessionChecked) {
    return <div className="max-w-md mx-auto px-4 py-16">{t("loading")}</div>;
  }

  if (!authLoginEnabled) {
    return <AuthClosedNotice />;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await login({
        email: fd.get("email") as string,
        password: fd.get("password") as string,
      });
      const next = search.get("next");
      if (next && isAdminNextUrl(next)) {
        const path = next.startsWith("http") ? new URL(next).pathname : next;
        window.location.href = adminAppUrl(path, locale);
        return;
      }
      if (next) {
        router.push(next);
      } else if (isStaffRole(res.role)) {
        window.location.href = adminAppUrl("/admin", locale);
        return;
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loginFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold">{t("signIn")}</h1>
      <form onSubmit={onSubmit} className="admin-form mt-8 max-w-md space-y-3" dir="ltr">
        <FormField label={t("email")} name="email" type="email" required />
        <FormField label={t("password")} name="password" type="password" required />
        <p className="text-sm text-end">
          <Link href="/forgot-password" className="text-brand-600">
            {t("forgotPassword")}
          </Link>
        </p>
        {error && <FormMessage variant="error">{error}</FormMessage>}
        <FormSubmit loading={loading} className="w-full">
          {loading ? t("signInLoading") : t("signIn")}
        </FormSubmit>
      </form>
      {authRegisterEnabled && (
        <p className="mt-4 text-sm text-center text-[var(--muted)]">
          {t("noAccount")}{" "}
          <Link href="/register" locale={locale} className="text-brand-600">
            {t("register")}
          </Link>
        </p>
      )}
    </div>
  );
}
