import React, { useState } from "react";
import { Mail, ArrowLeft, ExternalLink, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/auth/useAuth";
import { getEmailDomainProvider } from "@/utils/auth-validation";
import { authService } from "@/services/auth/auth-service";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface VerificationPendingProps {
  email?: string;
  onBackToLogin?: () => void;
  onChangeEmail?: () => void;
}

export const VerificationPending: React.FC<VerificationPendingProps> = ({
  email,
  onBackToLogin,
  onChangeEmail,
}) => {
  const navigate = useNavigate();
  const { pendingVerificationEmail, setPendingVerificationEmail, verifyOtp } = useAuth();
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpCode, setOtpCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const displayEmail = email || pendingVerificationEmail || "your email address";
  const mailProvider = getEmailDomainProvider(displayEmail);

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.trim().length === 0) {
      setErrorMsg("Please enter the 6-digit verification code sent to your inbox.");
      return;
    }

    setVerifying(true);
    setErrorMsg(null);

    try {
      await verifyOtp(displayEmail, otpCode.trim());
      toast.success("Email verified successfully!", {
        description: "Your workspace is unlocked. Redirecting to dashboard...",
      });
      setTimeout(() => {
        navigate({ to: "/app" });
      }, 300);
    } catch (err: any) {
      const msg = err.message || "Invalid verification code. Please check and try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setErrorMsg(null);

    try {
      await authService.sendOtp(displayEmail);
      toast.success("Verification code sent! Please check your email inbox.", {
        description: `We dispatched a fresh 6-digit code to ${displayEmail}`,
      });
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || "Failed to resend verification code.");
    } finally {
      setResending(false);
    }
  };

  const handleLoginReturn = () => {
    if (onBackToLogin) {
      onBackToLogin();
    } else {
      setPendingVerificationEmail(null);
      navigate({ to: "/login" });
    }
  };

  const handleChangeEmailClick = () => {
    if (onChangeEmail) {
      onChangeEmail();
    } else {
      setPendingVerificationEmail(null);
      navigate({ to: "/signup" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center space-y-7 my-4"
    >
      {/* Animated Illustration */}
      <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-emerald-500/20 ring-8 ring-indigo-500/10"
        />
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600/90 text-white shadow-lg shadow-indigo-500/30 border border-white/20">
          <KeyRound className="h-10 w-10 animate-pulse" style={{ animationDuration: "2.5s" }} />
        </div>
        <div className="absolute -bottom-1 -right-1 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-4 ring-slate-900">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl font-serif">
          Enter Verification Code
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed px-2">
          We sent a secure 6-digit OTP verification code to:
        </p>
        <div className="inline-block rounded-xl bg-slate-800/80 px-4 py-2 text-sm font-mono font-bold text-indigo-300 border border-slate-700/80 shadow-inner">
          {displayEmail}
        </div>
      </div>

      {/* OTP Code Form */}
      <form onSubmit={handleVerifyOtp} className="space-y-4 max-w-xs mx-auto">
        <div>
          <label htmlFor="otp-input" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            6-Digit Code
          </label>
          <input
            id="otp-input"
            type="text"
            maxLength={6}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-full text-center text-2xl font-mono font-black tracking-[0.4em] py-3 px-4 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
            autoFocus
            autoComplete="one-time-code"
          />
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-400 text-center animate-shake">
            {errorMsg}
          </div>
        )}

        <Button
          type="submit"
          disabled={verifying || otpCode.length < 4}
          className="w-full h-12 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/25 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all transform active:scale-95 flex items-center justify-center gap-2"
        >
          {verifying ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Verifying Code...</span>
            </>
          ) : (
            <>
              <span>Verify & Launch Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-left text-xs text-slate-400 flex items-start gap-3 shadow-inner">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-indigo-400 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-300">Didn't receive your code?</p>
          <p className="mt-0.5 text-slate-400/90">
            Check your spam or bulk folder, or tap the button below to resend a fresh 6-digit OTP code.
          </p>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="space-y-3 pt-2">
        {mailProvider && (
          <Button
            asChild
            variant="outline"
            className="w-full h-11 rounded-2xl font-semibold text-sm border-slate-700 bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
          >
            <a href={mailProvider.url} target="_blank" rel="noopener noreferrer">
              <span>Open {mailProvider.name} App</span>
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          onClick={handleResend}
          disabled={resending || resendCooldown > 0}
          className="w-full h-11 rounded-2xl font-semibold text-sm text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 transition-all"
        >
          {resending ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" /> Sending Verification Code...
            </span>
          ) : resendCooldown > 0 ? (
            `Resend available in ${resendCooldown}s`
          ) : (
            "Resend Verification Code"
          )}
        </Button>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
          <Button
            type="button"
            variant="ghost"
            onClick={handleChangeEmailClick}
            className="h-10 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-xl"
          >
            Change Email
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleLoginReturn}
            className="h-10 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-xl flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
