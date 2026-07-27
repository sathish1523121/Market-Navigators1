import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Radar, CheckCircle, Mail, Eye, EyeOff, KeyRound, ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";
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
      {
        name: "description",
        content: "Start a 14-day free trial of Compete IQ.",
      },
      { property: "og:title", content: "Create your account — Compete IQ" },
      {
        property: "og:description",
        content: "Start a 14-day free trial of Compete IQ.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const initialEmail = searchParams.get("email") || "";
  const initialMode = searchParams.get("mode") || "otp";

  const [authMethod, setAuthMethod] = useState<"otp" | "link">(
    initialMode === "link" ? "link" : "otp"
  );

  // Loading state
  const [loading, setLoading] = useState(false);

  // Common fields
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  // OTP workflow states
  // Step 1: Send OTP to email | Step 2: Verify OTP | Step 3: Set Name & Password
  const [otpStep, setOtpStep] = useState<1 | 2 | 3>(1);
  const [otpCode, setOtpCode] = useState("");
  const [devOtpCode, setDevOtpCode] = useState<string | undefined>(undefined);
  const [otpVerified, setOtpVerified] = useState(false);
  const [name, setName] = useState("");

  // Link-based registration states (legacy flow)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
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
  // OTP Step 3: Set Name and Password, Complete Signup, and Access Dashboard
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
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5">
            <Mail className="h-10 w-10 text-primary animate-pulse" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            We've sent a confirmation link to{" "}
            <span className="font-medium text-foreground">{registeredEmail}</span>.
            Click the link in the email to activate your account.
          </p>

          <div className="mt-8 rounded-xl border border-border bg-muted/40 p-4 text-left space-y-3">
            {[
              "Check your inbox (and spam folder)",
              "Click the verification link in the email",
              "You'll be redirected to your dashboard",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span className="text-sm text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>

          {devVerifyLink && (
            <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-left">
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-2">
                🛠 Dev Mode — No SMTP Configured
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                SMTP is not set up. Use this link to verify directly:
              </p>
              <a
                href={devVerifyLink}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline break-all"
              >
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                {devVerifyLink}
              </a>
            </div>
          )}

          <div className="mt-8 space-y-3">
            <Button className="w-full" onClick={() => navigate({ to: "/login" })}>
              Go to Sign In
            </Button>
            <Button
              variant="ghost"
              className="w-full text-sm text-muted-foreground"
              onClick={async () => {
                try {
                  const result = await resendVerificationEmail(registeredEmail);
                  toast.success("Verification email resent! Check your inbox.");
                  if (result.verificationLink) {
                    setDevVerifyLink(result.verificationLink);
                  }
                } catch (err: any) {
                  toast.error(err?.message || "Could not resend.");
                }
              }}
            >
              Resend verification email
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
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left branding panel */}
      <div className="relative hidden overflow-hidden bg-gradient-hero lg:block">
        <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-background/20 text-primary-foreground backdrop-blur">
              <Radar className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold">Compete IQ</span>
          </Link>
          <div>
            <div className="text-3xl font-semibold leading-tight">
              Start monitoring market intelligence in real-time.
            </div>
            <ul className="mt-6 space-y-2.5 text-sm opacity-90">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-300" /> Quick account creation with OTP verification
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-300" /> AI-extracted claims, ingredients & pricing
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-300" /> Instant access to the intelligence dashboard
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-hero text-primary-foreground shadow-elegant">
              <Radar className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold">Compete IQ</span>
          </Link>

          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Get started with instant OTP verification.
          </p>

          {/* Mode Switcher */}
          <div className="mt-6 grid grid-cols-2 gap-1.5 rounded-lg bg-muted p-1 text-xs">
            <button
              type="button"
              onClick={() => setAuthMethod("otp")}
              className={`flex items-center justify-center gap-1.5 rounded-md py-2 font-medium transition-all ${
                authMethod === "otp"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" /> OTP Verification
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod("link")}
              className={`flex items-center justify-center gap-1.5 rounded-md py-2 font-medium transition-all ${
                authMethod === "link"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="h-3.5 w-3.5" /> Email Link
            </button>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* OTP VERIFICATION WORKFLOW */}
          {/* ------------------------------------------------------------------- */}
          {authMethod === "otp" && (
            <div className="mt-6 space-y-6">
              {/* Stepper Header */}
              <div className="flex items-center justify-between border-b pb-3 text-xs font-medium text-muted-foreground">
                <div className={`flex items-center gap-1.5 ${otpStep >= 1 ? "text-primary font-semibold" : ""}`}>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px]">1</span>
                  Email
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                <div className={`flex items-center gap-1.5 ${otpStep >= 2 ? "text-primary font-semibold" : ""}`}>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px]">2</span>
                  Verify OTP
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                <div className={`flex items-center gap-1.5 ${otpStep >= 3 ? "text-primary font-semibold" : ""}`}>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px]">3</span>
                  Set Password
                </div>
              </div>

              {/* STEP 1: Send OTP */}
              {otpStep === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="otp-email">Email Address</Label>
                    <Input
                      id="otp-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Sending Code…
                      </span>
                    ) : (
                      "Send Verification Code (OTP)"
                    )}
                  </Button>
                </form>
              )}

              {/* STEP 2: Verify OTP Code */}
              {otpStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                    Verification code sent to <strong className="text-foreground">{email}</strong>.
                    {" "}
                    <button
                      type="button"
                      onClick={() => setOtpStep(1)}
                      className="text-primary underline ml-1"
                    >
                      Change email
                    </button>
                  </div>

                  {/* Dev Mode Banner with code helper */}
                  {devOtpCode && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
                      <p className="font-semibold text-amber-600 dark:text-amber-400">
                        🛠 Dev Mode — Verification Code Generated
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        Your 6-digit OTP code is: <strong className="text-foreground text-sm font-mono tracking-widest">{devOtpCode}</strong>
                      </p>
                      <button
                        type="button"
                        onClick={() => setOtpCode(devOtpCode)}
                        className="mt-2 text-xs text-primary font-semibold hover:underline"
                      >
                        Click to auto-fill OTP ({devOtpCode})
                      </button>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="otp-code">6-Digit Verification Code</Label>
                    <Input
                      id="otp-code"
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="text-center font-mono text-lg tracking-widest"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Verifying..." : "Verify Code"}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-xs text-primary hover:underline"
                    >
                      Didn't receive code? Resend OTP
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Set Name and Password -> Access Dashboard */}
              {otpStep === 3 && (
                <form onSubmit={handleCompleteOtpSignup} className="space-y-4">
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                    <span>Email <strong>{email}</strong> verified! Now set your account credentials.</span>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Shreya Narayanan"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="pw-otp">Password</Label>
                      <div className="relative">
                        <Input
                          id="pw-otp"
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 4 chars"
                          className="pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cpw-otp">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="cpw-otp"
                          type={showConfirm ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((p) => !p)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                          tabIndex={-1}
                        >
                          {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-start gap-2 text-xs cursor-pointer">
                      <Checkbox
                        id="terms-otp"
                        checked={acceptedTerms}
                        onCheckedChange={(v) => setAcceptedTerms(Boolean(v))}
                        className="mt-0.5"
                      />
                      <span>I accept the Terms of Service and Privacy Policy</span>
                    </label>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Creating Account…
                      </span>
                    ) : (
                      "Set Password & Access Dashboard"
                    )}
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
                  <Label htmlFor="fn">First name</Label>
                  <Input
                    id="fn"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ln">Last name</Label>
                  <Input
                    id="ln"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="em">Work email</Label>
                <Input
                  id="em"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pw">Password</Label>
                  <Input
                    id="pw"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 4 chars"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cpw">Confirm</Label>
                  <Input
                    id="cpw"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
