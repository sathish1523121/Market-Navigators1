import { supabase, API_BASE_URL } from "./supabase-client";
import { AuthSession, UserProfile, LoginCredentials, RegisterCredentials } from "@/types/auth";

const SESSION_STORAGE_KEY = "compete_iq_auth_session";

class AuthService {
  /**
   * Register a new user with Email and Password.
   * Immediately requires email verification before dashboard access.
   */
  async register(credentials: RegisterCredentials): Promise<{ user: UserProfile; verificationSent: boolean }> {
    const fullName = `${credentials.firstName.trim()} ${credentials.lastName.trim()}`.trim();

    // Try Supabase Auth first
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email.trim(),
        password: credentials.password!,
        options: {
          data: {
            first_name: credentials.firstName.trim(),
            last_name: credentials.lastName.trim(),
            full_name: fullName,
          },
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/verify-email` : undefined,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to create account. Please try again.");
      }

      // Simultaneously synchronize with backend API to ensure profile creation in DB
      try {
        await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email.trim(),
            password: credentials.password,
            name: fullName,
          }),
        });
      } catch (e) {
        console.warn("Backend profile synchronization note:", e);
      }

      const isVerified = Boolean(data.user?.email_confirmed_at || data.session);
      const userProfile: UserProfile = {
        id: data.user?.id || "temp-id",
        email: credentials.email.trim(),
        firstName: credentials.firstName.trim(),
        lastName: credentials.lastName.trim(),
        fullName,
        emailVerified: isVerified,
        createdAt: data.user?.created_at || new Date().toISOString(),
      };

      return { user: userProfile, verificationSent: !isVerified };
    }

    // Fallback directly to REST API if supabase SDK isn't active
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials.email.trim(),
        password: credentials.password,
        name: fullName,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || errData.message || "Registration failed. Please try again.");
    }

    const data = await res.json();
    const userProfile: UserProfile = {
      id: data.id || "usr-" + Date.now(),
      email: credentials.email.trim(),
      firstName: credentials.firstName.trim(),
      lastName: credentials.lastName.trim(),
      fullName,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };

    return { user: userProfile, verificationSent: true };
  }

  /**
   * Authenticate with credentials. Enforces email verification.
   */
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim(),
        password: credentials.password!,
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("email not confirmed") || msg.includes("not verified")) {
          const err = new Error("EMAIL_NOT_VERIFIED");
          (err as any).code = "EMAIL_NOT_VERIFIED";
          (err as any).email = credentials.email.trim();
          throw err;
        }
        if (msg.includes("invalid login") || msg.includes("credentials") || msg.includes("not found")) {
          throw new Error("Invalid email or password. Please check your credentials.");
        }
        throw new Error(error.message || "Failed to sign in.");
      }

      if (!data.user?.email_confirmed_at) {
        const err = new Error("EMAIL_NOT_VERIFIED");
        (err as any).code = "EMAIL_NOT_VERIFIED";
        (err as any).email = credentials.email.trim();
        throw err;
      }

      const profile: UserProfile = {
        id: data.user.id,
        email: data.user.email || credentials.email.trim(),
        firstName: data.user.user_metadata?.first_name || "",
        lastName: data.user.user_metadata?.last_name || "",
        fullName: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User",
        emailVerified: true,
        createdAt: data.user.created_at,
      };

      const session: AuthSession = {
        accessToken: data.session?.access_token || "",
        refreshToken: data.session?.refresh_token || "",
        tokenType: data.session?.token_type || "Bearer",
        expiresAt: data.session?.expires_at ? data.session.expires_at * 1000 : Date.now() + 3600000,
        user: profile,
      };

      this.saveLocalSession(session);
      return session;
    }

    // Backend API fallback check
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: credentials.email.trim(), password: credentials.password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg: string = (err.detail || err.message || "").toLowerCase();
      if (msg.includes("verify") || msg.includes("confirmed") || msg.includes("unverified")) {
        const customErr = new Error("EMAIL_NOT_VERIFIED");
        (customErr as any).code = "EMAIL_NOT_VERIFIED";
        (customErr as any).email = credentials.email.trim();
        throw customErr;
      }
      throw new Error(err.detail || "Invalid email or password.");
    }

    const data = await res.json();
    if (data.user && data.user.verified === false) {
      const customErr = new Error("EMAIL_NOT_VERIFIED");
      (customErr as any).code = "EMAIL_NOT_VERIFIED";
      (customErr as any).email = credentials.email.trim();
      throw customErr;
    }

    const profile: UserProfile = {
      id: data.user?.id || "id-active",
      email: data.user?.email || credentials.email.trim(),
      fullName: data.user?.name || "Workspace Member",
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };

    const session: AuthSession = {
      accessToken: data.access_token || "jwt-token",
      tokenType: "Bearer",
      user: profile,
    };

    this.saveLocalSession(session);
    return session;
  }

  /**
   * Resend Verification Email to pending user
   */
  async resendVerificationEmail(email: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/verify-email` : undefined,
        },
      });
      if (error) {
        // Fallthrough to backend endpoint if supabase throttled or failed
        console.warn("Supabase resend note:", error.message);
      } else {
        return true;
      }
    }

    const res = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    if (!res.ok) {
      throw new Error("Could not resend verification email. Please try again later or wait a minute between tries.");
    }
    return true;
  }

  /**
   * Request password reset link sent to inbox
   */
  async requestPasswordReset(email: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined,
      });
      if (error) {
        throw new Error(error.message || "Could not send recovery link.");
      }
      return true;
    }

    const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    if (!res.ok) {
      throw new Error("Could not send password reset email.");
    }
    return true;
  }

  /**
   * Update password with recovery session or token
   */
  async updatePassword(newPassword: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        throw new Error(error.message || "Failed to reset password.");
      }
      return true;
    }
    return true;
  }

  /**
   * Secure Global Logout
   */
  async logout(): Promise<void> {
    if (supabase) {
      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch (e) {
        console.error("Signout note:", e);
      }
    }
    this.clearLocalSession();
  }

  /**
   * Restore Session on page refresh
   */
  async restoreSession(): Promise<AuthSession | null> {
    if (supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session && data.session.user && data.session.user.email_confirmed_at) {
          const profile: UserProfile = {
            id: data.session.user.id,
            email: data.session.user.email!,
            firstName: data.session.user.user_metadata?.first_name || "",
            lastName: data.session.user.user_metadata?.last_name || "",
            fullName: data.session.user.user_metadata?.full_name || data.session.user.email?.split("@")[0] || "User",
            emailVerified: true,
            createdAt: data.session.user.created_at,
          };
          const session: AuthSession = {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            tokenType: data.session.token_type || "Bearer",
            expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : undefined,
            user: profile,
          };
          this.saveLocalSession(session);
          return session;
        }
      } catch (err) {
        console.warn("Session restore check:", err);
      }
    }

    // Check localStorage fallback
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        try {
          const session: AuthSession = JSON.parse(stored);
          if (session.expiresAt && Date.now() > session.expiresAt) {
            this.clearLocalSession();
            return null;
          }
          return session;
        } catch {
          this.clearLocalSession();
        }
      }
    }
    return null;
  }

  private saveLocalSession(session: AuthSession) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } catch (e) {
        console.warn("Could not persist session:", e);
      }
    }
  }

  private clearLocalSession() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }
}

export const authService = new AuthService();
