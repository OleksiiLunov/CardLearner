import type { Metadata } from "next";

import { I18nProvider } from "@/i18n/I18nProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "CardLearner",
  description: "CardLearner helps you build vocabulary lists and review them with focused study sessions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background font-sans text-foreground antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
