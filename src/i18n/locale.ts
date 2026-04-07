import { availableLocales, type Locale } from "@/locales";

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE_NAME = "locale";
export const LOCALE_STORAGE_KEY = "locale";

export function isLocale(value: string): value is Locale {
  return (availableLocales as readonly string[]).includes(value);
}
