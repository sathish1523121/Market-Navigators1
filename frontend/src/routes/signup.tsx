import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Radar, CheckCircle, Mail, Eye, EyeOff, KeyRound, ShieldCheck, ArrowRight, ExternalLink, Sparkles, User, Lock, Building, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  registerUser,
  resendVerificationEmail,
  sendOtpEmail,
  verifyOtpCode,
  completeOtpSignup,
} from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — Compete IQ" },
      { name: "description", content: "Start your real-time intelligence workspace with instant OTP verification." },
      { property: "og:title", content: "Create your account — Compete IQ" },
      { property: "og:description", content: "Start your real-time intelligence workspace with instant OTP verification." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialEmail = searchParams.get("email") || "";
  const initialMode = searchParams.get("mode") || "otp";

  const [authMethod, setAuthMethod] = useState<"otp" | "link">(
    initialMode === "link" ? "link" : "otp"
  );

  const [loading, setLoading] = useState(false);

  // Common fields
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  // OTP workflow states
  const [otpStep, setOtpStep] = useState<1 | 2 | 3>(1);
  const [otpCode, setOtpCode] = useState("");
  const [devOtpCode, setDevOtpCode] = useState<string | undefined>(undefined);
  const [otpVerified, setOtpVerified] = useState(false);
  const [name, setName] = useState("");

  // Link-based registration states (legacy flow)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [devVerifyLink, setDevVerifyLink] = useState<string | undefined>(undefined);

  // ---------------------------------------------------------------------------
  // OTP Step 1: Send OTP code to email
  // ---------------------------------------------------------------------------
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await sendOtpEmail(email.trim());
      setDevOtpCode(res.devOtpCode);
      setOtpStep(2);
      toast.success(`Verification code sent to ${email.trim()}`);
    } catch (err: any) {
      const msg: string = err?.message || "Failed to send verification code.";
      if (msg.toLowerCase().includes("already exists")) {
        toast.error("An account with this email already exists. Please sign in instead.", {
          action: { label: "Sign in", onClick: () => navigate({ to: "/login" }) },
          duration: 6000,
        });
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // OTP Step 2: Verify OTP code
  // ---------------------------------------------------------------------------
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      toast.error("Please enter a 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      await verifyOtpCode(email.trim(), otpCode.trim());
      setOtpVerified(true);
      setOtpStep(3);
      toast.success("Code verified! Please set your name and password.");
    } catch (err: any) {
      toast.error(err?.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // OTP Step 3: Set Name and Password, Complete Signup
  // ---------------------------------------------------------------------------
  const handleCompleteOtpSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (password.length < 4) {
      toast.error("Password must be at least 4 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!acceptedTerms) {
      toast.error("Please accept the Terms and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      await completeOtpSignup(email.trim(), otpCode.trim(), name.trim(), password);
      toast.success("Account created successfully! Welcome to Compete IQ.");
      navigate({ to: "/app" });
    } catch (err: any) {
      toast.error(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Legacy Link-Based Registration
  // ---------------------------------------------------------------------------
  const handleLinkSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please enter your first and last name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (password.length < 4) {
      toast.error("Password must be at least 4 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!acceptedTerms) {
      toast.error("Please accept the Terms and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const result = await registerUser(email.trim(), password, fullName);

      setRegisteredEmail(result.email);
      if (result.verificationLink) {
        setDevVerifyLink(result.verificationLink);
      }
      setRegistered(true);
      toast.success(`Account created! Check your inbox to verify your email.`);
    } catch (err: any) {
      const msg: string = err?.message || "Registration failed. Please try again.";
      if (msg.toLowerCase().includes("already exists")) {
        toast.error("An account with this email already exists. Please sign in instead.", {
          action: { label: "Sign in", onClick: () => navigate({ to: "/login" }) },
          duration: 6000,
        });
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Email Sent View (Legacy link flow)
  // ---------------------------------------------------------------------------
  if (registered) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 selection:bg-primary/20">
        <div className="w-full max-w-md text-center rounded-3xl border border-border/80 bg-card/90 p-8 shadow-2xl backdrop-blur">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-primary/20 to-indigo-500/20 ring-8 ring-primary/10 shadow-inner">
            <Mail className="h-10 w-10 text-primary animate-pulse" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">Check your inbox</h1>
          <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
            We've sent an activation email to{" "}
            <span className="font-semibold text-foreground underline decoration-primary/40">{registeredEmail}</span>.
            Click the link inside to activate your account.
          </p>

          <div className="mt-6 rounded-2xl border border-border/60 bg-muted/30 p-4 text-left space-y-3 shadow-inner">
            {[
              "Check your inbox (and Spam / Junk folder)",
              "Click the secure verification link in the email",
              "Sign in to start monitoring market trends",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 flex-shrink-0">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <span className="text-xs font-medium text-foreground/90">{step}</span>
              </div>
            ))}
          </div>

          {devVerifyLink && (
            <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-left text-xs">
              <p className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[11px] mb-1">
                🛠 Dev Mode Active — Direct Verification
              </p>
              <p className="text-muted-foreground mb-2">
                Click below to instantly verify without opening your email:
              </p>
              <a
                href={devVerifyLink}
                className="flex items-center gap-1 font-mono text-[11px] text-primary hover:underline break-all"
              >
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                {devVerifyLink}
              </a>
            </div>
          )}

          <div className="mt-8 space-y-3">
            <Button className="w-full h-11 rounded-xl font-semibold shadow-lg shadow-primary/20" onClick={() => navigate({ to: "/login" })}>
              Proceed to Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="w-full h-10 text-xs text-muted-foreground hover:text-foreground rounded-xl"
              onClick={async () => {
                try {
                  const result = await resendVerificationEmail(registeredEmail);
                  toast.success("Verification email resent! Check your inbox.");
                  if (result.verificationLink) {
                    setDevVerifyLink(result.verificationLink);
                  }
                } catch (err: any) {
                  toast.error(err?.message || "Could not resend verification email.");
                }
              }}
            >
              Didn't receive it? Resend verification email
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Main Signup Form View
  // ---------------------------------------------------------------------------
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
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-1 border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Instant Workspace Creation</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Verify in seconds and unlock real-time AI market intelligence.
            </p>
          </div>

          {/* Sleek Mode Switcher */}
          <div className="mt-6 grid grid-cols-2 gap-1.5 rounded-2xl bg-muted/60 p-1.5 text-xs font-semibold border border-border/60 shadow-inner">
            <button
              type="button"
              onClick={() => setAuthMethod("otp")}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all duration-200 ${
                authMethod === "otp"
                  ? "bg-background text-primary shadow-sm border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <KeyRound className="h-4 w-4" />
              <span>Instant OTP Code</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod("link")}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all duration-200 ${
                authMethod === "link"
                  ? "bg-background text-primary shadow-sm border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="h-4 w-4" />
              <span>Email Link</span>
            </button>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* OTP VERIFICATION WORKFLOW */}
          {/* ------------------------------------------------------------------- */}
          {authMethod === "otp" && (
            <div className="mt-6 space-y-6">
              {/* Modern Stepper Indicator */}
              <div className="flex items-center justify-between px-2 py-3 bg-muted/30 rounded-xl border border-border/50 text-xs font-semibold text-muted-foreground">
                <div className={`flex items-center gap-2 transition-colors ${otpStep >= 1 ? "text-primary" : ""}`}>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${otpStep >= 1 ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30" : "bg-muted text-muted-foreground"}`}>
                    {otpStep > 1 ? <Check className="h-3.5 w-3.5" /> : "1"}
                  </span>
                  <span>Email</span>
                </div>
                <div className={`h-0.5 flex-1 mx-3 rounded-full transition-colors ${otpStep >= 2 ? "bg-primary/50" : "bg-border"}`} />
                <div className={`flex items-center gap-2 transition-colors ${otpStep >= 2 ? "text-primary" : ""}`}>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${otpStep >= 2 ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30" : "bg-muted text-muted-foreground"}`}>
                    {otpStep > 2 ? <Check className="h-3.5 w-3.5" /> : "2"}
                  </span>
                  <span>Verify Code</span>
                </div>
                <div className={`h-0.5 flex-1 mx-3 rounded-full transition-colors ${otpStep >= 3 ? "bg-primary/50" : "bg-border"}`} />
                <div className={`flex items-center gap-2 transition-colors ${otpStep >= 3 ? "text-primary" : ""}`}>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${otpStep >= 3 ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30" : "bg-muted text-muted-foreground"}`}>
                    3
                  </span>
                  <span>Set Credentials</span>
                </div>
              </div>

              {/* STEP 1: Send OTP */}
              {otpStep === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="otp-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-primary" /> Email Address
                    </Label>
                    <Input
                      id="otp-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="h-11 px-3.5 rounded-xl border-border/80 bg-muted/30 text-sm placeholder:text-muted-foreground/60 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all duration-200"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 active:scale-[0.99] transition-all duration-200 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span>Sending verification code…</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>Send 6-Digit Code</span>
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>
              )}

              {/* STEP 2: Verify OTP Code */}
              {otpStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs flex items-center justify-between text-muted-foreground shadow-inner">
                    <span>Code sent to <strong className="text-foreground">{email}</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtpStep(1)}
                      className="font-semibold text-primary hover:underline"
                    >
                      Change email
                    </button>
                  </div>

                  {devOtpCode && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs space-y-1.5 shadow-inner">
                      <p className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[11px]">
                        🛠 Dev Mode — Instant Verification
                      </p>
                      <p className="text-muted-foreground">
                        Your verification code is: <strong className="text-foreground font-mono text-base tracking-widest">{devOtpCode}</strong>
                      </p>
                      <button
                        type="button"
                        onClick={() => setOtpCode(devOtpCode)}
                        className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline"
                      >
                        Click here to auto-fill code ({devOtpCode}) <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="otp-code" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5 text-primary" /> Enter 6-Digit Code
                    </Label>
                    <Input
                      id="otp-code"
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="••••••"
                      className="h-14 text-center font-mono text-2xl font-bold tracking-[0.4em] rounded-xl border-2 border-primary/30 bg-muted/20 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all duration-200"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 active:scale-[0.99] transition-all duration-200 bg-gradient-to-r from-primary to-indigo-600"
                    disabled={loading}
                  >
                    {loading ? "Verifying code..." : "Verify Code & Continue"}
                  </Button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Didn't receive the email? <span className="text-primary hover:underline">Resend code</span>
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Set Name and Password -> Access Dashboard */}
              {otpStep === 3 && (
                <form onSubmit={handleCompleteOtpSignup} className="space-y-4">
                  <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 shadow-inner">
                    <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                    <span>Email <strong>{email}</strong> verified successfully!</span>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="full-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-primary" /> Full Name
                    </Label>
                    <Input
                      id="full-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Shreya Narayanan"
                      className="h-10 px-3.5 rounded-xl border-border/80 bg-muted/30 text-sm focus:bg-background focus:border-primary transition-all duration-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="pw-otp" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-primary" /> Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="pw-otp"
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 4 chars"
                          className="h-10 pl-3.5 pr-8 rounded-xl border-border/80 bg-muted/30 text-sm focus:bg-background focus:border-primary transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cpw-otp" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-primary" /> Confirm
                      </Label>
                      <div className="relative">
                        <Input
                          id="cpw-otp"
                          type={showConfirm ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="h-10 pl-3.5 pr-8 rounded-xl border-border/80 bg-muted/30 text-sm focus:bg-background focus:border-primary transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((p) => !p)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                          tabIndex={-1}
                        >
                          {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2.5 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                      <Checkbox
                        id="terms-otp"
                        checked={acceptedTerms}
                        onCheckedChange={(v) => setAcceptedTerms(Boolean(v))}
                        className="rounded-md"
                      />
                      <span>I accept the Terms of Service and Privacy Policy</span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 active:scale-[0.99] transition-all duration-200 bg-gradient-to-r from-primary to-indigo-600"
                    disabled={loading}
                  >
                    {loading ? "Completing setup…" : "Complete Account & Launch Workspace"}
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* LINK-BASED SIGNUP (LEGACY) */}
          {/* ------------------------------------------------------------------- */}
          {authMethod === "link" && (
            <form className="mt-6 space-y-4" onSubmit={handleLinkSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="fn" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">First name</Label>
                  <Input
                    id="fn"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="h-10 px-3.5 rounded-xl border-border/80 bg-muted/30 text-sm focus:bg-background focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ln" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last name</Label>
                  <Input
                    id="ln"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                    className="h-10 px-3.5 rounded-xl border-border/80 bg-muted/30 text-sm focus:bg-background focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="em" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary" /> Work Email
                </Label>
                <Input
                  id="em"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="h-10 px-3.5 rounded-xl border-border/80 bg-muted/30 text-sm focus:bg-background focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pw" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                  <Input
                    id="pw"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 4 chars"
                    className="h-10 px-3.5 rounded-xl border-border/80 bg-muted/30 text-sm focus:bg-background focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cpw" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm</Label>
                  <Input
                    id="cpw"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="h-10 px-3.5 rounded-xl border-border/80 bg-muted/30 text-sm focus:bg-background focus:border-primary transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl active:scale-[0.99] transition-all bg-gradient-to-r from-primary to-indigo-600"
                disabled={loading}
              >
                {loading ? "Creating workspace…" : "Create Account & Send Link"}
              </Button>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline inline-flex items-center gap-1 transition-colors hover:text-primary/90"
              >
                Sign in instead <ArrowRight className="h-3 w-3 inline" />
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center lg:text-left text-xs text-muted-foreground/80 py-2">
          &copy; {new Date().getFullYear()} Compete IQ. Real-time market intelligence.
        </div>
      </div>

      {/* Right hero branding panel */}
      <div className="relative hidden lg:flex lg:col-span-5 xl:col-span-6 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-12 xl:p-16 border-l border-border/30">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-3 text-sm font-semibold tracking-wide uppercase text-indigo-300/80">
          <ShieldCheck className="h-4 w-4 text-emerald-400" /> Instant verification security
        </div>

        <div className="relative z-10 my-auto space-y-8 max-w-xl">
          <div className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-white font-serif">
            "Start monitoring product claims and pricing strategies in real-time."
          </div>
          
          <ul className="space-y-4 text-sm font-medium text-indigo-100/90">
            <li className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 flex-shrink-0">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
              <span>Quick account creation with instant 6-digit OTP verification</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 flex-shrink-0">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
              <span>AI-extracted competitor claims, ingredients & retail pricing</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 flex-shrink-0">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
              <span>Instant access to your personalized intelligence dashboard</span>
            </li>
          </ul>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs font-medium text-indigo-300/60 pt-6 border-t border-white/5">
          <span>Powered by Supabase GoTrue Auth</span>
          <span>FastAPI AI Engine</span>
        </div>
      </div>
    </div>
  );
}
