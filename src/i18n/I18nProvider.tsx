"use client";

import { createContext, useEffect, useRef, useState } from "react";

import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE_NAME, LOCALE_STORAGE_KEY } from "@/i18n/locale";
import { type Locale, type TranslationSchema, translations } from "@/locales";

type Primitive = string | number | boolean | null;

type NestedTranslationKey<T> = {
  [K in keyof T & string]: T[K] extends Primitive
    ? K
    : T[K] extends Record<string, unknown>
      ? `${K}.${NestedTranslationKey<T[K]>}`
      : K;
}[keyof T & string];

export type TranslationKey = NestedTranslationKey<TranslationSchema>;

export type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey | string) => string;
};

export const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function getTranslationValue(locale: Locale, key: string): string {
  const result = key
    .split(".")
    .reduce<unknown>((current, segment) => {
      if (current && typeof current === "object" && segment in current) {
        return (current as Record<string, unknown>)[segment];
      }

      return undefined;
    }, translations[locale]);

  return typeof result === "string" ? result : key;
}

function getCookieLocale() {
  const cookieValue = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${LOCALE_COOKIE_NAME}=`))
    ?.split("=")[1];

  if (!cookieValue) {
    return undefined;
  }

  const decodedValue = decodeURIComponent(cookieValue);
  return isLocale(decodedValue) ? decodedValue : undefined;
}

function getStoredLocale() {
  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return storedLocale && isLocale(storedLocale) ? storedLocale : undefined;
}

function persistLocale(locale: Locale) {
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)}; Path=/; Max-Age=31536000; SameSite=Lax`;
  document.documentElement.lang = locale;
}

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const hasReconciled = useRef(false);

  useEffect(() => {
    if (hasReconciled.current) {
      return;
    }

    hasReconciled.current = true;

    const resolvedLocale =
      getCookieLocale() ?? getStoredLocale() ?? initialLocale ?? DEFAULT_LOCALE;

    if (resolvedLocale !== locale) {
      setLocaleState(resolvedLocale);
      return;
    }

    persistLocale(resolvedLocale);
  }, [initialLocale, locale]);

  useEffect(() => {
    persistLocale(locale);
  }, [locale]);

  const setLocale = (nextLocale: Locale) => {
    if (nextLocale !== locale) {
      setLocaleState(nextLocale);
    }
  };

  const t = (key: TranslationKey | string) => getTranslationValue(locale, key);

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}
