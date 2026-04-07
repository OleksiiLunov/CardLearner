"use client";

import { createContext, useEffect, useState } from "react";

import { availableLocales, type Locale, type TranslationSchema, translations } from "@/locales";

const LOCALE_STORAGE_KEY = "locale";
const DEFAULT_LOCALE: Locale = "en";

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

function isLocale(value: string): value is Locale {
  return (availableLocales as readonly string[]).includes(value);
}

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

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);

    if (storedLocale && isLocale(storedLocale)) {
      setLocaleState(storedLocale);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
  };

  const t = (key: TranslationKey | string) => getTranslationValue(locale, key);

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}
