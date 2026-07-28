import React, { useState, useMemo } from "react";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ShieldCheck, Check, AlertCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { validateEmail, validatePasswordStrength } from "@/utils/auth-validation";
import { VerificationPending } from "@/components/auth/VerificationPending";
import { motion } from "framer-motion";

export const SignupForm: React.FC = () => {
  const { register } = useAuth();

  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialEmail = searchParams.get("email") || "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const passwordEvaluation = useMemo(() => validatePasswordStrength(password), [password]);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  if (verificationPending) {
    return <VerificationPending email={registeredEmail} onBackToLogin={undefined} />;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Missing name fields", { description: "Please enter your first and last name." });
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Invalid email format", { description: "Please provide a valid business or personal email address." });
      return;
    }

    if (!passwordEvaluation.isValid) {
      toast.error("Weak password", {
        description: `Please ensure your password meets the security criteria: ${passwordEvaluation.feedback.join(", ")}`,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match", { description: "Please confirm your password identical to the original." });
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });

      // DO NOT allow login immediately -> Show Verification Pending screen!
      setRegisteredEmail(result.user.email);
      setVerificationPending(true);
      toast.success("Account initialized!", {
        description: "Please check your email to confirm your address before logging in.",
      });
    } catch (err: any) {
      const msg = err.message || "Could not create account.";
      if (msg.toLowerCase().includes("already exists") || msg.toLowerCase().includes("unique")) {
        toast.error("Email already registered", {
          description: "An account with this email address already exists. Try logging in or resetting your password.",
        });
      } else {
        toast.error("Registration unsuccessful", { description: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 1) return "bg-rose-500";
    if (score === 2) return "bg-amber-500";
    if (score === 3) return "bg-blue-500";
    return "bg-emerald-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl font-serif">
          Create your account
        </h1>
        <p className="text-sm text-slate-400">
          Enter your professional details to set up your real-time intelligence workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="fname" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-indigo-400" /> First Name
            </Label>
            <Input
              id="fname"
              type="text"
              required
              placeholder="Alex"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-11 px-3.5 rounded-2xl border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:bg-slate-800 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lname" className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Last Name
            </Label>
            <Input
              id="lname"
              type="text"
              required
              placeholder="Johnson"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-11 px-3.5 rounded-2xl border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:bg-slate-800 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-email" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-indigo-400" /> Email Address
          </Label>
          <Input
            id="signup-email"
            type="email"
            required
            placeholder="alex.johnson@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 px-3.5 rounded-2xl border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:bg-slate-800 focus:border-indigo-500 transition-all text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-pass" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-indigo-400" /> Password
          </Label>
          <div className="relative">
            <Input
              id="signup-pass"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Min. 8 characters with symbol & number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 pl-3.5 pr-11 rounded-2xl border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:bg-slate-800 focus:border-indigo-500 transition-all text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Real-time Password Strength Bar */}
          {password.length > 0 && (
            <div className="pt-2 space-y-1.5">
              <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-slate-800">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 transition-colors duration-300 ${
                      passwordEvaluation.score >= step ? getScoreColor(passwordEvaluation.score) : "bg-slate-700"
                    }`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] font-medium text-slate-400 pt-1">
                <span className={`flex items-center gap-1 ${password.length >= 8 ? "text-emerald-400" : ""}`}>
                  {password.length >= 8 ? <Check className="h-3 w-3" /> : "•"} 8+ chars
                </span>
                <span className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? "text-emerald-400" : ""}`}>
                  {/[A-Z]/.test(password) ? <Check className="h-3 w-3" /> : "•"} Uppercase
                </span>
                <span className={`flex items-center gap-1 ${/[0-9]/.test(password) ? "text-emerald-400" : ""}`}>
                  {/[0-9]/.test(password) ? <Check className="h-3 w-3" /> : "•"} Number
                </span>
                <span className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(password) ? "text-emerald-400" : ""}`}>
                  {/[^A-Za-z0-9]/.test(password) ? <Check className="h-3 w-3" /> : "•"} Symbol
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1.5 pt-1">
          <Label htmlFor="signup-cpass" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Confirm Password</span>
            {confirmPassword && (
              <span className={`text-[11px] font-semibold ${passwordsMatch ? "text-emerald-400" : "text-rose-400"}`}>
                {passwordsMatch ? "Passwords match ✓" : "Do not match ✕"}
              </span>
            )}
          </Label>
          <div className="relative">
            <Input
              id="signup-cpass"
              type={showConfirm ? "text" : "password"}
              required
              placeholder="Repeat password exactly"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11 pl-3.5 pr-11 rounded-2xl border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:bg-slate-800 focus:border-indigo-500 transition-all text-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="pt-3">
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/25 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98] transition-all duration-200 text-white flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Initializing Account...</span>
              </span>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="pt-2 border-t border-slate-800/80 text-center">
        <p className="text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors inline-flex items-center gap-1">
            Sign in <ArrowRight className="h-3 w-3 inline" />
          </Link>
        </p>
      </div>
    </motion.div>
  );
};
