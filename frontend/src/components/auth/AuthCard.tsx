import React, { ReactNode } from "react";
import { Radar, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

interface AuthCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  badge?: string;
  illustrationTitle?: string;
  illustrationSubtitle?: string;
  showBrandingPanel?: boolean;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  children,
  badge = "Secure Intelligence Portal",
  showBrandingPanel = true,
}) => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 sm:p-6 lg:p-10 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative flex w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-slate-800/80 bg-slate-900/90 shadow-[0_20px_70px_-15px_rgba(79,70,229,0.25)] backdrop-blur-2xl"
      >
        {/* Left Side: Clean abstract gradient & Minimalist Illustration (Desktop only) */}
        {showBrandingPanel && (
          <div className="relative hidden w-5/12 flex-col justify-between overflow-hidden bg-gradient-to-tr from-indigo-950 via-indigo-900 to-slate-950 p-10 text-white lg:flex xl:p-12 border-r border-slate-800/60">
            {/* Ambient geometric background glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-primary text-white shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
                  <Radar className="h-5 w-5 animate-spin" style={{ animationDuration: "12s" }} />
                </div>
                <span className="text-xl font-bold tracking-tight text-white font-mono">Compete IQ</span>
              </Link>
            </div>

            <div className="relative z-10 my-auto py-12 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 border border-indigo-400/25 px-3.5 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>{badge}</span>
              </div>
              <h2 className="text-3xl xl:text-4xl font-black leading-tight tracking-tight text-white font-serif">
                Unleash real-time competitive intelligence.
              </h2>
              <p className="text-sm font-normal text-indigo-200/80 leading-relaxed max-w-sm">
                Track competitor product positioning, ingredient formulations, and pricing strategies in real-time with verified AI precision.
              </p>

              <div className="pt-4 flex flex-col gap-3">
                <div className="flex items-center gap-3 text-xs font-medium text-slate-300">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 flex-shrink-0 border border-emerald-500/30">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <span>End-to-end JWT sessions & encrypted SMTP verification</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 text-xs text-indigo-300/60 font-medium">
              &copy; {new Date().getFullYear()} Compete IQ Enterprise. All rights reserved.
            </div>
          </div>
        )}

        {/* Right Side: Centered clean authentication form */}
        <div className={`flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 ${showBrandingPanel ? "lg:w-7/12" : "max-w-xl mx-auto"}`}>
          <div className="mx-auto w-full max-w-sm space-y-8">
            {/* Mobile Header Branding */}
            <div className="flex items-center justify-between lg:hidden pb-2">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
                  <Radar className="h-4 w-4" />
                </div>
                <span className="text-lg font-bold text-white">Compete IQ</span>
              </Link>
            </div>

            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
