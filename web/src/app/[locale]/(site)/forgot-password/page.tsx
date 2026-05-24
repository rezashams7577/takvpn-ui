"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FormField, FormMessage, FormSubmit } from "@/components/forms";
import { forgotPassword } from "@/lib/api";
import { isApiError } from "@takvpn/shared/lib/api-errors";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setErr("");
    try {
      const res = await forgotPassword(email);
      setMsg(res.message || t("resetEmailSent"));
      setEmail("");
    } catch (ex) {
      setErr(
        isApiError(ex) ? ex.code : ex instanceof Error ? ex.message : t("loginFailed")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold">{t("forgotPasswordTitle")}</h1>
      <p className="text-[var(--muted)] mt-2 text-sm">{t("forgotPasswordHint")}</p>
      <form onSubmit={onSubmit} className="admin-form mt-8 space-y-3" dir="ltr">
        <FormField
          label={t("email")}
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {msg && <FormMessage variant="success">{msg}</FormMessage>}
        {err && <FormMessage variant="error">{err}</FormMessage>}
        <FormSubmit loading={loading} className="w-full">
          {t("sendResetLink")}
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
