import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignupForm } from "@/components/auth/SignupForm";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Your Account — Compete IQ" },
      { name: "description", content: "Set up your verified competitive intelligence workspace." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  return (
    <AuthCard
      badge="Instant Onboarding"
    >
      <SignupForm />
    </AuthCard>
  );
}
