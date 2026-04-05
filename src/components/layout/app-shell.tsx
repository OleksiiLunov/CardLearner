import { AppHeader } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export function AppShell({
  userEmail,
  children,
}: Readonly<{
  userEmail?: string;
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-4">
      <AppHeader userEmail={userEmail} />
      <main className="flex-1 py-6">{children}</main>
      <MobileNav />
    </div>
  );
}
