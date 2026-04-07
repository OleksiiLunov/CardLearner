"use client";

import { useContext } from "react";

import { I18nContext } from "@/i18n/I18nProvider";
import { availableLocales, type Locale } from "@/locales";

export function useTranslation(): {
  t: (key: string) => string;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  availableLocales: readonly Locale[];
} {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider.");
  }

  return {
    t: context.t,
    locale: context.locale,
    setLocale: context.setLocale,
    availableLocales,
  };
}
