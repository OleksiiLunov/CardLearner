"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { AuthActionState } from "@/app/actions/auth";
import { useTranslation } from "@/i18n/useTranslation";

type AuthFormProps = {
  mode: "login" | "signup";
  action: (
    state: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  next?: string;
  initialMessageKey?: string;
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

export function AuthForm({ mode, action, next, initialMessageKey }: AuthFormProps) {
  const { t } = useTranslation();
  const [state, formAction] = useActionState(action, initialState);
  const isLogin = mode === "login";
  const alternatePath = isLogin ? "/signup" : "/login";
  const alternateHref = next ? `${alternatePath}?next=${encodeURIComponent(next)}` : alternatePath;

  return (
    <section className="space-y-6 rounded-[2rem] border border-border bg-card/90 p-6 shadow-sm backdrop-blur">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">
          {isLogin ? t("auth.loginBadge") : t("auth.signupBadge")}
        </span>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            {isLogin ? t("auth.loginTitle") : t("auth.signupTitle")}
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            {isLogin
              ? t("auth.loginDescription")
              : t("auth.signupDescription")}
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next ?? "/lists"} />

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            {t("auth.email")}
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
            {t("auth.password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            className="w-full rounded-[1.25rem] border border-border bg-background px-4 py-3 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground focus:border-primary"
            placeholder={t("auth.passwordPlaceholder")}
          />
        </div>

        {state.error ? (
          <p className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {t("auth.genericError")}
          </p>
        ) : state.errorKey ? (
          <p className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {t(state.errorKey)}
          </p>
        ) : null}

        {!state.error && !state.errorKey && (state.successKey || initialMessageKey) ? (
          <p className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {t(state.successKey ?? initialMessageKey!)}
          </p>
        ) : null}

        <SubmitButton
          label={isLogin ? t("auth.logIn") : t("auth.createAccount")}
          pendingLabel={isLogin ? t("auth.loggingIn") : t("auth.creatingAccount")}
        />
      </form>

      <p className="text-sm text-muted-foreground">
        {isLogin ? t("auth.needAccount") : t("auth.alreadyHaveAccount")}{" "}
        <Link
          href={alternateHref}
          className="font-semibold text-foreground"
        >
          {isLogin ? t("auth.signUp") : t("auth.logIn")}
        </Link>
      </p>
    </section>
  );
}
