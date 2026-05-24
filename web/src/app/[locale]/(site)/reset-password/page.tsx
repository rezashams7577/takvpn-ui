"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FormField, FormMessage, FormSubmit } from "@/components/forms";
import { resetPassword } from "@/lib/api";
import { isApiError } from "@takvpn/shared/lib/api-errors";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-16">{t("loading")}</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const t = useTranslations("auth");
  const search = useSearchParams();
  const token = search.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      setErr(t("invalidResetToken"));
      return;
    }
    setLoading(true);
    setErr("");
    try {
      await resetPassword(token, password);
      setPassword("");
      setSuccess(true);
    } catch (ex) {
      setErr(
        isApiError(ex) && ex.code === "invalid or expired token"
          ? t("invalidResetToken")
          : isApiError(ex)
            ? ex.code
            : ex instanceof Error
              ? ex.message
              : t("loginFailed")
      );
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <p className="text-[var(--muted)]">{t("invalidResetToken")}</p>
        <p className="mt-4 text-sm">
          <Link href="/forgot-password" className="text-brand-600">
            {t("forgotPassword")}
          </Link>
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <FormMessage variant="success">{t("passwordResetSuccess")}</FormMessage>
        <p className="mt-4 text-sm">
          <Link href="/login" className="text-brand-600">
            {t("backToSignIn")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold">{t("resetPasswordTitle")}</h1>
      <p className="text-[var(--muted)] mt-2 text-sm">{t("resetPasswordHint")}</p>
      <form onSubmit={onSubmit} className="admin-form mt-8 space-y-3" dir="ltr">
        <FormField
          label={t("newPassword")}
          name="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {err && <FormMessage variant="error">{err}</FormMessage>}
        <FormSubmit loading={loading} className="w-full">
          {t("resetPassword")}
        </FormSubmit>
      </form>
      <p className="mt-4 text-sm text-center">
        <Link href="/login" className="text-brand-600">
          {t("backToSignIn")}
        </Link>
      </p>
    </div>
  );
}
