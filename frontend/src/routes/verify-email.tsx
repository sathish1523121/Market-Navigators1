import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthCard } from "@/components/auth/AuthCard";
import { VerificationPending } from "@/components/auth/VerificationPending";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabase } from "@/services/auth/supabase-client";
import { toast } from "sonner";
import { CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [
      { title: "Verify Your Email — Compete IQ" },
      { name: "description", content: "Confirm your email address to unlock dashboard functionality." },
    ],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const { isEmailVerified, session } = useAuth();
  const [confirmed, setConfirmed] = useState(isEmailVerified);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    // Automatically detect verification tokens from Supabase redirect or URL hash
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    
    if (hash && hash.includes("access_token") && supabase) {
      setVerifying(true);
      supabase.auth.getSession().then(({ data, error }) => {
        if (!error && data.session) {
          setConfirmed(true);
          toast.success("Email verified successfully!", {
            description: "Your workspace is fully unlocked. Redirecting to dashboard...",
          });
          setTimeout(() => navigate({ to: "/app" }), 2000);
        }
        setVerifying(false);
      });
    } else if (params.get("token") || params.get("type") === "signup") {
      setConfirmed(true);
    }
  }, [navigate]);

  if (confirmed || (session && isEmailVerified)) {
    return (
      <AuthCard showBrandingPanel={false} badge="Verification Confirmed">
        <div className="text-center space-y-6 py-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-8 ring-emerald-500/10">
            <ShieldCheck className="h-10 w-10 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white font-serif">Email Verified!</h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
              Your email address has been successfully verified. You now have secure access to all workspace features and API monitoring tools.
            </p>
          </div>
          <Button
            onClick={() => navigate({ to: "/app" })}
            className="w-full h-12 rounded-2xl font-bold bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white shadow-xl flex items-center justify-center gap-2"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard showBrandingPanel={false} badge="Mandatory Verification">
      <VerificationPending />
    </AuthCard>
  );
}
