"use client";

import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { useTranslation } from "@/i18n/useTranslation";
import { translations, type Locale } from "@/locales";

export function AppHeader({ userEmail }: { userEmail?: string }) {
  const { t, locale, setLocale, availableLocales } = useTranslation();

  return (
    <header className="border-b border-border/80 bg-background">
      <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link href="/lists" className="text-lg font-semibold tracking-tight text-foreground">
            {t("common.appName")}
          </Link>
          <p className="mt-1 max-w-full text-sm leading-5 text-muted-foreground break-words sm:truncate">
            {userEmail ? `${t("common.signedInAs")} ${userEmail}` : t("lists.overviewDescription")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <label className="flex min-h-10 min-w-0 items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm text-foreground">
            <span className="shrink-0 font-medium text-muted-foreground">{t("settings.language")}</span>
            <select
              value={locale}
              onChange={(event) => setLocale(event.target.value as Locale)}
              aria-label={t("settings.language")}
              className="min-w-0 bg-transparent font-medium outline-none"
            >
              {availableLocales.map((availableLocale) => (
                <option key={availableLocale} value={availableLocale}>
                  {translations[availableLocale].meta.nativeLabel}
                </option>
              ))}
            </select>
          </label>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground"
            >
              {t("auth.signOut")}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
