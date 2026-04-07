import { loginAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { getSafeAuthMessageKey } from "@/lib/auth/messages";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <AuthForm
      mode="login"
      action={loginAction}
      next={params.next}
      initialMessageKey={getSafeAuthMessageKey(params.message)}
    />
  );
}
