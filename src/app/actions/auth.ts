"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error?: string;
  success?: string;
  email?: string;
};

function getField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function validateCredentials(formData: FormData) {
  const email = getField(formData, "email");
  const password = getField(formData, "password");

  if (!email || !password) {
    return {
      email,
      password,
      error: "Email and password are required.",
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

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validated = validateCredentials(formData);

  if ("error" in validated) {
    return {
      error: validated.error,
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
      error: error.message,
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

  if ("error" in validated) {
    return {
      error: validated.error,
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
      error: error.message,
      email: validated.email,
    };
  }

  if (session) {
    revalidatePath("/", "layout");
    redirect("/lists");
  }

  return {
    success: "Account created. Check your email to confirm your address, then log in.",
    email: validated.email,
  };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
