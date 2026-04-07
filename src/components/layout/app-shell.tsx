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
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24">
      <AppHeader userEmail={userEmail} />
      <main className="flex-1 pt-5 pb-5">{children}</main>
      <MobileNav />
    </div>
  );
}
