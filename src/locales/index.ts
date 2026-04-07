import en from "@/locales/en.json";
import uk from "@/locales/uk.json";

export type TranslationSchema = typeof en;

export const translations = {
  en,
  uk,
} as const satisfies Record<string, TranslationSchema>;

export const availableLocales = Object.keys(translations) as Array<keyof typeof translations>;

export type Locale = (typeof availableLocales)[number];
