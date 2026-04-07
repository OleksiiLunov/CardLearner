import type { Metadata } from "next";

import { DEFAULT_APP_METADATA } from "@/config/app";
import { getServerLocale } from "@/i18n/get-server-locale";
import { I18nProvider } from "@/i18n/I18nProvider";

import "./globals.css";

export const metadata: Metadata = DEFAULT_APP_METADATA;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <html lang={locale}>
      <body className="bg-background font-sans text-foreground antialiased">
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
