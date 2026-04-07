"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getSafeAuthMessageKey } from "@/lib/auth/messages";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error?: string;
  success?: string;
  errorKey?: string;
  successKey?: string;
  email?: string;
};

function getField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function validateCredentials(
  formData: FormData,
): { email: string; password: string } | { email: string; password: string; errorKey: string } {
  const email = getField(formData, "email");
  const password = getField(formData, "password");

  if (!email || !password) {
    return {
      email,
      password,
      errorKey: "auth.credentialsRequired",
    };
  }

  return { email, password };
}

function getSafeRedirectPath(nextValue: string) {
  if (!nextValue.startsWith("/")) {
    return "/lists";
  }

  if (nextValue.startsWith("//")) {
    return "/lists";
  }

  return nextValue;
}

function mapAuthErrorToKey(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("invalid login credentials") ||
    normalizedMessage.includes("invalid credentials") ||
    normalizedMessage.includes("email not found") ||
    normalizedMessage.includes("invalid email or password")
  ) {
    return "auth.invalidCredentials";
  }

  if (normalizedMessage.includes("email not confirmed") || normalizedMessage.includes("confirm your email")) {
    return "auth.emailNotConfirmed";
  }

  if (normalizedMessage.includes("user already registered") || normalizedMessage.includes("already registered")) {
    return "auth.userAlreadyRegistered";
  }

  if (
    normalizedMessage.includes("password should be at least") ||
    normalizedMessage.includes("password is too weak") ||
    normalizedMessage.includes("weak password")
  ) {
    return "auth.weakPassword";
  }

  if (
    normalizedMessage.includes("rate limit") ||
    normalizedMessage.includes("too many requests") ||
    normalizedMessage.includes("too many attempts")
  ) {
    return "auth.tooManyRequests";
  }

  if (normalizedMessage.includes("signups not allowed") || normalizedMessage.includes("signup is disabled")) {
    return "auth.signupDisabled";
  }

  return "auth.genericError";
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validated = validateCredentials(formData);

  if ("errorKey" in validated) {
    return {
      errorKey: validated.errorKey,
      email: validated.email,
    };
  }

  const next = getSafeRedirectPath(getField(formData, "next") || "/lists");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: validated.email,
    password: validated.password,
  });

  if (error) {
    return {
      errorKey: mapAuthErrorToKey(error.message),
      email: validated.email,
    };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signupAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validated = validateCredentials(formData);

  if ("errorKey" in validated) {
    return {
      errorKey: validated.errorKey,
      email: validated.email,
    };
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin");
  const emailRedirectTo = origin ? `${origin}/auth/callback` : undefined;

  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.signUp({
    email: validated.email,
    password: validated.password,
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    return {
      errorKey: mapAuthErrorToKey(error.message),
      email: validated.email,
    };
  }

  if (session) {
    revalidatePath("/", "layout");
    redirect("/lists");
  }

  return {
    successKey: getSafeAuthMessageKey("auth.accountCreated"),
    email: validated.email,
  };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
