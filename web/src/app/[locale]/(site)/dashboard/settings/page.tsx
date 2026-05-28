"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { FormField, FormMessage, FormSelect, FormSubmit } from "@/components/forms";
import {
  PanelActionRow,
  PanelPageHeader,
  PanelSection,
} from "@/components/layout";
import { isApiError } from "@takvpn/shared/lib/api-errors";
import {
  changePassword,
  fetchMe,
  logout,
  logoutAll,
  updateProfile,
  type Me,
} from "@/lib/api";

function accountError(t: (key: string) => string, err: unknown): string {
  if (isApiError(err)) {
    if (err.code === "current password incorrect") {
      return t("currentPasswordIncorrect");
    }
    return err.code || t("genericError");
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return t("genericError");
}

export default function AccountSettingsPage() {
  const t = useTranslations("account");
  const router = useRouter();
  const locale = useLocale();
  const [me, setMe] = useState<Me | null>(null);
  const [loadErr, setLoadErr] = useState(false);
  const [name, setName] = useState("");
  const [profileLocale, setProfileLocale] = useState("fa");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);

  const syncProfileFromMe = useCallback((user: Me) => {
    setName(user.name ?? "");
    setProfileLocale(user.locale === "en" ? "en" : "fa");
  }, []);

  const clearPasswordFields = useCallback(() => {
    setCurrentPassword("");
    setNewPassword("");
  }, []);

  const loadMe = useCallback(async () => {
    try {
      const user = await fetchMe();
      setMe(user);
      syncProfileFromMe(user);
      setLoadErr(false);
    } catch {
      setLoadErr(true);
    }
  }, [syncProfileFromMe]);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  async function onProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg("");
    setProfileErr("");
    try {
      const updated = await updateProfile({ name, locale: profileLocale });
      setMe(updated);
      syncProfileFromMe(updated);
      setProfileMsg(t("profileUpdated"));
      if (profileLocale !== locale) {
        router.replace("/dashboard/settings", { locale: profileLocale as "fa" | "en" });
        router.refresh();
      }
    } catch (err) {
      setProfileErr(accountError(t, err));
    } finally {
      setProfileLoading(false);
    }
  }

  async function onPasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwLoading(true);
    setPwMsg("");
    setPwErr("");
    try {
      await changePassword(currentPassword, newPassword);
      setPwMsg(t("passwordUpdated"));
      clearPasswordFields();
    } catch (err) {
      setPwErr(accountError(t, err));
    } finally {
      setPwLoading(false);
    }
  }

  async function handleSignOut() {
    setLogoutLoading(true);
    try {
      await logout();
      router.push("/login");
      router.refresh();
    } catch {
      setLogoutLoading(false);
    }
  }

  async function handleSignOutEverywhere() {
    if (!window.confirm(t("signOutEverywhereConfirm"))) return;
    setLogoutAllLoading(true);
    try {
      await logoutAll();
      router.push("/login");
      router.refresh();
    } catch {
      setLogoutAllLoading(false);
    }
  }

  if (loadErr) {
    return (
      <p className="text-[var(--muted)]">
        {t("sessionExpired")}{" "}
        <Link href="/login" className="text-brand-600">
          {t("signIn")}
        </Link>
      </p>
    );
  }

  if (!me) {
    return <p className="text-[var(--muted)]">{t("loading")}</p>;
  }

  return (
    <div className="max-w-2xl w-full space-y-6">
      <PanelPageHeader title={t("title")} description={t("pageDescription")} />

      <PanelSection
        title={t("accountSection")}
        description={t("accountSectionDesc")}
      >
        <form onSubmit={onProfileSubmit} className="admin-form space-y-3">
          <div className="admin-field">
            <span className="admin-field-label">{t("email")}</span>
            <p className="text-sm text-[var(--muted)]" dir="ltr">
              {me.email}
            </p>
            <p className="text-xs text-[var(--muted)] mt-1">{t("emailReadOnly")}</p>
          </div>
          <FormField
            label={t("displayName")}
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <FormSelect
            label={t("language")}
            name="locale"
            value={profileLocale}
            onChange={(e) => setProfileLocale(e.target.value)}
            options={[
              { value: "fa", label: t("languageFa") },
              { value: "en", label: t("languageEn") },
            ]}
          />
          {profileMsg && <FormMessage variant="success">{profileMsg}</FormMessage>}
          {profileErr && <FormMessage variant="error">{profileErr}</FormMessage>}
          <FormSubmit loading={profileLoading}>{t("saveProfile")}</FormSubmit>
        </form>
      </PanelSection>

      <PanelSection
        title={t("securitySection")}
        description={t("securitySectionDesc")}
      >
        <h3 className="font-medium text-sm mb-3">{t("changePasswordTitle")}</h3>
        <form onSubmit={onPasswordSubmit} className="admin-form admin-form--ltr-inputs space-y-3">
          <FormField
            label={t("currentPassword")}
            name="current"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <FormField
            label={t("newPassword")}
            name="new"
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {pwMsg && <FormMessage variant="success">{pwMsg}</FormMessage>}
          {pwErr && <FormMessage variant="error">{pwErr}</FormMessage>}
          <FormSubmit loading={pwLoading}>{t("updatePassword")}</FormSubmit>
        </form>
        <p className="mt-4 text-sm">
          <Link href="/forgot-password" className="text-brand-600">
            {t("forgotPasswordLink")}
          </Link>
        </p>
      </PanelSection>

      <PanelSection
        title={t("sessionsSection")}
        description={t("sessionsSectionDesc")}
        variant="danger"
      >
        <div className="-mt-4">
          <PanelActionRow
            title={t("signOut")}
            description={t("signOutHint")}
            action={
              <button
                type="button"
                onClick={handleSignOut}
                disabled={logoutLoading}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-brand-50 dark:hover:bg-brand-900/30 disabled:opacity-50"
              >
                {t("signOut")}
              </button>
            }
          />
          <PanelActionRow
            title={t("signOutEverywhere")}
            description={t("signOutEverywhereHint")}
            variant="danger"
            action={
              <button
                type="button"
                onClick={handleSignOutEverywhere}
                disabled={logoutAllLoading}
                className="rounded-lg border border-red-300 text-red-700 dark:text-red-400 px-4 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
              >
                {t("signOutEverywhere")}
              </button>
            }
          />
        </div>
      </PanelSection>

      <PanelSection title={t("helpSection")} description={t("helpSectionDesc")}>
        <Link
          href="/dashboard/support"
          className="inline-flex rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30"
        >
          {t("contactSupport")}
        </Link>
      </PanelSection>
    </div>
  );
}
