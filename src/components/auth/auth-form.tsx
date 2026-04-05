"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { AuthActionState } from "@/app/actions/auth";

type AuthFormProps = {
  mode: "login" | "signup";
  action: (
    state: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  next?: string;
  initialMessage?: string;
};

const initialState: AuthActionState = {};

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export function AuthForm({ mode, action, next, initialMessage }: AuthFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const isLogin = mode === "login";
  const alternatePath = isLogin ? "/signup" : "/login";
  const alternateHref = next ? `${alternatePath}?next=${encodeURIComponent(next)}` : alternatePath;

  return (
    <section className="space-y-6 rounded-[2rem] border border-border bg-card/90 p-6 shadow-sm backdrop-blur">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">
          {isLogin ? "Login" : "Signup"}
        </span>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            {isLogin ? "Welcome back." : "Create your account."}
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            {isLogin
              ? "Sign in with your email and password to access your study workspace."
              : "Create an MVP account with email and password. Social auth and onboarding can be added later."}
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next ?? "/lists"} />

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.email ?? ""}
            className="w-full rounded-[1.25rem] border border-border bg-background px-4 py-3 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground focus:border-primary"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            className="w-full rounded-[1.25rem] border border-border bg-background px-4 py-3 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground focus:border-primary"
            placeholder="Enter your password"
          />
        </div>

        {state.error ? (
          <p className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}

        {!state.error && (state.success || initialMessage) ? (
          <p className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {state.success ?? initialMessage}
          </p>
        ) : null}

        <SubmitButton
          label={isLogin ? "Log in" : "Create account"}
          pendingLabel={isLogin ? "Logging in..." : "Creating account..."}
        />
      </form>

      <p className="text-sm text-muted-foreground">
        {isLogin ? "Need an account?" : "Already have an account?"}{" "}
        <Link
          href={alternateHref}
          className="font-semibold text-foreground"
        >
          {isLogin ? "Sign up" : "Log in"}
        </Link>
      </p>
    </section>
  );
}
