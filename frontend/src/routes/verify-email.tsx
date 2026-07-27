import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Radar, CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyEmailToken, resendVerificationEmail } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [
      { title: "Verify your email — Compete IQ" },
      {
        name: "description",
        content: "Click the link in your email to verify your Compete IQ account.",
      },
    ],
  }),
  component: VerifyEmailPage,
});

type VerifyState = "loading" | "success" | "error" | "no-token";

function VerifyEmailPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<VerifyState>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setState("no-token");
      return;
    }

    let cancelled = false;

    verifyEmailToken(token)
      .then(() => {
        if (!cancelled) {
          setState("success");
          // Redirect to the app after a short celebration delay
          setTimeout(() => navigate({ to: "/app" }), 2200);
        }
      })
      .catch((err: any) => {
        if (!cancelled) {
          setState("error");
          setErrorMsg(err?.message || "Verification failed. The link may have expired.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleResend = async () => {
    const email = resendEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setResending(true);
    try {
      const result = await resendVerificationEmail(email);
      toast.success("Verification email sent! Check your inbox.");
      if (result.verificationLink) {
        // Dev mode: show the link in the console and as a toast
        console.info("[DEV] Verification link:", result.verificationLink);
        toast.info(
          <span>
            Dev mode link:{" "}
            <a href={result.verificationLink} className="underline text-primary">
              click here
            </a>
          </span>,
          { duration: 15000 }
        );
      }
    } catch (err: any) {
      toast.error(err?.message || "Could not resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Background gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-10 flex items-center justify-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-elegant">
            <Radar className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">Compete IQ</span>
        </div>

        {/* ── Loading ── */}
        {state === "loading" && (
          <div className="space-y-5">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5">
              <Loader2 className="h-9 w-9 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Verifying your email…</h1>
            <p className="text-sm text-muted-foreground">
              Please wait while we confirm your email address.
            </p>
          </div>
        )}

        {/* ── Success ── */}
        {state === "success" && (
          <div className="space-y-5">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 ring-8 ring-green-500/5">
              <CheckCircle className="h-10 w-10 text-green-500 animate-[scale-in_0.3s_ease-out]" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Email verified!</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your account is now active. Taking you to your dashboard…
            </p>

            {/* Animated progress bar */}
            <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500"
                style={{ animation: "progress 2.2s linear forwards" }}
              />
            </div>

            <style>{`
              @keyframes progress {
                from { width: 0%; }
                to   { width: 100%; }
              }
              @keyframes scale-in {
                from { transform: scale(0.5); opacity: 0; }
                to   { transform: scale(1);   opacity: 1; }
              }
            `}</style>

            <Button className="w-full mt-2" onClick={() => navigate({ to: "/app" })}>
              Go to Dashboard
            </Button>
          </div>
        )}

        {/* ── Error ── */}
        {state === "error" && (
          <div className="space-y-5">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 ring-8 ring-destructive/5">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Verification failed</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{errorMsg}</p>

            {/* Resend form */}
            <div className="mt-6 rounded-xl border border-border bg-muted/40 p-5 text-left space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Request a new verification link</span>
              </div>
              <input
                id="resend-email"
                type="email"
                placeholder="Enter your email address"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleResend()}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button
                className="w-full"
                disabled={resending}
                onClick={handleResend}
              >
                {resending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </span>
                ) : (
                  "Resend verification email"
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              Already verified?{" "}
              <button
                type="button"
                onClick={() => navigate({ to: "/login" })}
                className="text-primary hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        )}

        {/* ── No token ── */}
        {state === "no-token" && (
          <div className="space-y-5">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 ring-8 ring-amber-500/5">
              <Mail className="h-10 w-10 text-amber-500" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Missing verification token
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This page requires a verification token from the link in your email.
              Please check your inbox and click the link there.
            </p>
            <Button className="w-full mt-4" onClick={() => navigate({ to: "/login" })}>
              Go to Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
