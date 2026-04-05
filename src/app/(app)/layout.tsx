import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();

  return <AppShell userEmail={user?.email}>{children}</AppShell>;
}
