import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, LogIn } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { VerificationPending } from "@/components/auth/VerificationPending";
import { motion } from "framer-motion";

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, pendingVerificationEmail, setPendingVerificationEmail } = useAuth();
  
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialEmail = searchParams.get("email") || pendingVerificationEmail || "";

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(Boolean(pendingVerificationEmail));

  if (needsVerification) {
    return (
      <VerificationPending
        email={email}
        onBackToLogin={() => {
          setNeedsVerification(false);
          setPendingVerificationEmail(null);
        }}
        onChangeEmail={() => navigate({ to: `/signup?email=${encodeURIComponent(email)}` as any })}
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both your email address and password.");
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      toast.success("Welcome back!", { description: "You are signed into your workspace." });
      navigate({ to: "/app" });
    } catch (err: any) {
      if (err.code === "EMAIL_NOT_VERIFIED" || err.message === "EMAIL_NOT_VERIFIED" || (err.message || "").toLowerCase().includes("not verified")) {
        setNeedsVerification(true);
        toast.error("Email verification required", {
          description: "Please confirm your email address before accessing the workspace.",
        });
      } else {
        toast.error("Authentication failed", {
          description: err.message || "Invalid email or password. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl font-serif">
          Welcome Back
        </h1>
        <p className="text-sm text-slate-400">
          Enter your credentials to continue to your dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="login-email" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-indigo-400" /> Email Address
          </Label>
          <Input
            id="login-email"
            type="email"
            required
            autoFocus={!email}
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 px-4 rounded-2xl border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:bg-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all text-sm shadow-inner"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-indigo-400" /> Password
            </Label>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              autoFocus={Boolean(email)}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 pl-4 pr-11 rounded-2xl border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:bg-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all text-sm shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/25 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98] transition-all duration-200 text-white flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Verifying Session...</span>
            </span>
          ) : (
            <>
              <span>Continue</span>
              <LogIn className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center pt-1">
        <Link
          to="/forgot-password"
          className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
        >
          Forgot Password?
        </Link>
      </div>

      {/* Elegant Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-900 px-3 text-slate-500 font-semibold tracking-widest">or</span>
        </div>
      </div>

      {/* Create Account Action */}
      <div className="text-center">
        <Link to="/signup" className="block w-full">
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-2xl border-slate-700 bg-slate-800/40 text-white font-bold hover:bg-slate-800 hover:border-slate-600 transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Create Account</span>
            <ArrowRight className="h-4 w-4 text-indigo-400" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};
