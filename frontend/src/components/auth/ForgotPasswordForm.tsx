import React, { useState } from "react";
import { Mail, ArrowLeft, Send, CheckCircle2, KeyRound, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const ForgotPasswordForm: React.FC = () => {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please provide a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
      toast.success("Password recovery link sent!", {
        description: `Instructions have been emailed to ${email.trim()}`,
      });
    } catch (err: any) {
      toast.error("Recovery unsuccessful", {
        description: err.message || "We could not send the reset link at this time.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-6 py-4"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-400 ring-8 ring-indigo-500/10 border border-indigo-500/30">
          <CheckCircle2 className="h-10 w-10 text-indigo-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white font-serif">Check your email</h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
            We have sent a secure password reset link to <strong className="text-white font-mono">{email}</strong>. Click the link inside to set a new password.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <Link to="/login" className="block w-full">
            <Button className="w-full h-12 rounded-2xl font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all shadow-md">
              <ArrowLeft className="mr-2 h-4 w-4" /> Return to Login
            </Button>
          </Link>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setSent(false)}
            className="text-xs text-slate-400 hover:text-white"
          >
            Use a different email address
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl font-serif">
          Forgot Password?
        </h1>
        <p className="text-sm text-slate-400">
          Enter your verified email address below and we will dispatch a secure recovery link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="recover-email" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-indigo-400" /> Account Email Address
          </Label>
          <Input
            id="recover-email"
            type="email"
            required
            autoFocus
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 px-4 rounded-2xl border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:bg-slate-800 focus:border-indigo-500 transition-all text-sm"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/25 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98] transition-all text-white flex items-center justify-center gap-2"
        >
          {loading ? "Dispatching link..." : (
            <>
              <span>Send Reset Link</span>
              <Send className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center pt-2">
        <Link
          to="/login"
          className="text-sm font-semibold text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </Link>
      </div>
    </motion.div>
  );
};

export const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password too short", { description: "Please enter a password with at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords mismatch", { description: "Your confirmation password does not match." });
      return;
    }

    setLoading(true);
    try {
      await updatePassword(newPassword);
      toast.success("Password reset successfully!", {
        description: "Your new credentials are now active. Please sign in.",
      });
      navigate({ to: "/login" });
    } catch (err: any) {
      toast.error("Password reset error", { description: err.message || "Failed to save new password." });
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
          Create New Password
        </h1>
        <p className="text-sm text-slate-400">
          Enter your new secure password below to complete account recovery.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="new-pass" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-indigo-400" /> New Password
          </Label>
          <div className="relative">
            <Input
              id="new-pass"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12 pl-4 pr-11 rounded-2xl border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:bg-slate-800 focus:border-indigo-500 transition-all text-sm"
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
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-pass" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-indigo-400" /> Confirm New Password
          </Label>
          <div className="relative">
            <Input
              id="confirm-pass"
              type={showConfirm ? "text" : "password"}
              required
              placeholder="Repeat password exactly"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 pl-4 pr-11 rounded-2xl border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:bg-slate-800 focus:border-indigo-500 transition-all text-sm"
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

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/25 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98] transition-all text-white"
        >
          {loading ? "Updating password..." : "Set New Password & Continue"}
        </Button>
      </form>
    </motion.div>
  );
};
