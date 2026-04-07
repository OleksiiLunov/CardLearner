import { AuthLayoutIntro } from "@/components/auth/auth-layout-intro";
import { requireGuest } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireGuest();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <AuthLayoutIntro />
      {children}
    </div>
  );
}
