import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "CardLearner",
  description: "Mobile-first language learning MVP scaffold built with Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background font-sans text-foreground antialiased">{children}</body>
    </html>
  );
}
