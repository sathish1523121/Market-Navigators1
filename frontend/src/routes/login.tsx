import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Radar, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginWithCredentials, resendVerificationEmail } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Compete IQ" },
      { name: "description", content: "Sign in to your Compete IQ workspace." },
      { property: "og:title", content: "Sign in — Compete IQ" },
      { property: "og:description", content: "Sign in to your Compete IQ workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUserNotFound(false);

    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both your email and password.");
      return;
    }

    setLoading(true);

    try {
      await loginWithCredentials(email.trim(), password);
      toast.success("Signed in successfully!");
      navigate({ to: "/app" });
    } catch (err: any) {
      const msg: string = err?.message || "Sign in failed. Please check your credentials.";
      const isUnverified = msg.toLowerCase().includes("verify your email");
      const isNotFound = msg.toLowerCase().includes("no account found") || msg.toLowerCase().includes("not found");

      if (isNotFound) {
        setUserNotFound(true);
        toast.error(`No account found for ${email.trim()}. Please create an account.`, {
          action: {
            label: "Create account",
            onClick: () => navigate({ to: `/signup?email=${encodeURIComponent(email.trim())}&mode=otp` as any }),
          },
          duration: 8000,
        });
      } else if (isUnverified) {
        const currentEmail = email.trim();
        toast.error("Please verify your email before signing in.", {
          description: "Check your inbox for the verification link.",
          action: {
            label: "Resend email",
            onClick: async () => {
              try {
                await resendVerificationEmail(currentEmail);
                toast.success("Verification email sent! Check your inbox.");
              } catch {
                toast.error("Could not resend. Please try again.");
              }
            },
          },
          duration: 10000,
        });
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-12 bg-background font-sans selection:bg-primary/20 selection:text-primary">
      {/* Left interactive form panel */}
      <div className="flex flex-col justify-between px-6 py-10 lg:col-span-7 xl:col-span-6 lg:px-16 xl:px-24">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5 group transition-opacity hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
              <Radar className="h-5 w-5 animate-pulse" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">Compete IQ</span>
          </Link>
        </div>

        <div className="my-auto w-full max-w-md mx-auto py-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2 border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Secure Portal Login</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access real-time market intelligence.
            </p>
          </div>

          {userNotFound && (
            <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4.5 text-left transition-all duration-300 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                <span>Account not found for <span className="underline">{email}</span></span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                We couldn't find an active workspace. Create your account instantly with our fast OTP verification.
              </p>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="mt-3.5 w-full text-xs h-9 shadow-md transition-transform active:scale-[0.98]"
                onClick={() => navigate({ to: `/signup?email=${encodeURIComponent(email)}&mode=otp` as any })}
              >
                <span>Create Account with OTP</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" /> Email Address
              </Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 px-3.5 rounded-xl border-border/80 bg-muted/30 text-sm placeholder:text-muted-foreground/60 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-primary" /> Password
                </Label>
                <Link
                  to="/login"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pl-3.5 pr-10 rounded-xl border-border/80 bg-muted/30 text-sm placeholder:text-muted-foreground/60 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 active:scale-[0.99] transition-all duration-200 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Verifying credentials...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account yet?{" "}
              <Link
                to="/signup"
                className="font-semibold text-primary hover:underline inline-flex items-center gap-1 transition-colors hover:text-primary/90"
              >
                Create one now <ArrowRight className="h-3 w-3 inline" />
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center lg:text-left text-xs text-muted-foreground/80 py-2">
          &copy; {new Date().getFullYear()} Compete IQ. Real-time market intelligence.
        </div>
      </div>

      {/* Right hero branding panel (Simple, premium contrast) */}
      <div className="relative hidden lg:flex lg:col-span-5 xl:col-span-6 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-12 xl:p-16 border-l border-border/30">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-3 text-sm font-semibold tracking-wide uppercase text-indigo-300/80">
          <Zap className="h-4 w-4 text-indigo-400 animate-bounce" /> Enterprise-grade security
        </div>

        <div className="relative z-10 my-auto space-y-8 max-w-xl">
          <blockquote className="space-y-6">
            <div className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-white font-serif">
              "Compete IQ detected three essential market shifts before our competitors even realized. Our workspace runs on it every day."
            </div>
            <footer className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-lg text-white shadow-inner">
                PS
              </div>
              <div>
                <div className="font-bold text-white text-base">Priya S.</div>
                <div className="text-xs font-medium text-indigo-200/75">VP of Brand & Market Strategy, NutraCraft</div>
              </div>
            </footer>
          </blockquote>

          <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4 text-xs font-medium text-indigo-200/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" /> Supabase Authenticated
            </div>
            <div className="flex items-center gap-2">
              <Radar className="h-4 w-4 text-indigo-400 flex-shrink-0" /> AI Insights & Claims Engine
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs font-medium text-indigo-300/60 pt-6 border-t border-white/5">
          <span>Encrypted with 256-bit SSL</span>
          <span>Version 2.4 Pro</span>
        </div>
      </div>
    </div>
  );
}
