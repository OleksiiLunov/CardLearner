import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";

export function AppHeader({ userEmail }: { userEmail?: string }) {
  return (
    <header className="sticky top-4 z-20 rounded-[2rem] border border-white/60 bg-background/85 px-4 py-3 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link href="/lists" className="text-lg font-semibold tracking-tight text-foreground">
            CardLearner
          </Link>
          <p className="text-sm text-muted-foreground">
            {userEmail ? `Signed in as ${userEmail}` : "Minimal language learning MVP"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/study/setup"
            className="rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-foreground"
          >
            Study
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-foreground"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
