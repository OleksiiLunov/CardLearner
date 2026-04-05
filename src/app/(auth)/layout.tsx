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
      <div className="mb-8 space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          CardLearner
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance">
          Minimal auth foundation for the MVP.
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Supabase Auth is connected for email and password flows. Lists, study logic, and the rest
          of the product can build on top of this session layer.
        </p>
      </div>
      {children}
    </div>
  );
}
