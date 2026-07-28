import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Compete IQ" },
      { name: "description", content: "Sign in to your secure competitive intelligence workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <AuthCard
      badge="Secure Workspace Access"
    >
      <LoginForm />
    </AuthCard>
  );
}
