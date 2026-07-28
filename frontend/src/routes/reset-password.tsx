import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Compete IQ" },
      { name: "description", content: "Create a new password for your Compete IQ account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  return (
    <AuthCard showBrandingPanel={false} badge="Secure Password Update">
      <ResetPasswordForm />
    </AuthCard>
  );
}
