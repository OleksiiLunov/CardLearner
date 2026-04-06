import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";

export function AppHeader({ userEmail }: { userEmail?: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link href="/lists" className="text-lg font-semibold tracking-tight text-foreground">
            CardLearner
          </Link>
          <p className="mt-1 text-sm leading-5 text-muted-foreground break-words sm:truncate">
            {userEmail ? `Signed in as ${userEmail}` : "Minimal language learning MVP"}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/study/setup"
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground"
          >
            Study
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
