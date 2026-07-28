import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — Compete IQ" },
      { name: "description", content: "Recover access to your competitive intelligence account." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <AuthCard showBrandingPanel={false} badge="Account Recovery">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
