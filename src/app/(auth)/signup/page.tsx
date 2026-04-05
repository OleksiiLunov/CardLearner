import { signupAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";

type SignupPageProps = {
  searchParams: Promise<{
    next?: string;
    message?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;

  return (
    <AuthForm
      mode="signup"
      action={signupAction}
      next={params.next}
      initialMessage={params.message}
    />
  );
}
