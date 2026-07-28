import React, { createContext, useEffect, useState, useCallback, ReactNode } from "react";
import { AuthSession, UserProfile, LoginCredentials, RegisterCredentials } from "@/types/auth";
import { authService } from "@/services/auth/auth-service";
import { toast } from "sonner";

export interface AuthContextType {
  user: UserProfile | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isLoading: boolean;
  error: string | null;
  pendingVerificationEmail: string | null;
  setPendingVerificationEmail: (email: string | null) => void;
  login: (credentials: LoginCredentials) => Promise<AuthSession>;
  register: (credentials: RegisterCredentials) => Promise<{ user: UserProfile; verificationSent: boolean }>;
  logout: () => Promise<void>;
  resendVerification: (email?: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadSession = async () => {
      try {
        const restored = await authService.restoreSession();
        if (restored && isMounted) {
          setSession(restored);
          setUser(restored.user);
        }
      } catch (err) {
        console.error("Session restore error:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const sess = await authService.login(credentials);
      setSession(sess);
      setUser(sess.user);
      setPendingVerificationEmail(null);
      return sess;
    } catch (err: any) {
      if (err.code === "EMAIL_NOT_VERIFIED" || err.message === "EMAIL_NOT_VERIFIED") {
        setPendingVerificationEmail(err.email || credentials.email);
        setError("Your email address has not been verified yet.");
      } else {
        setError(err.message || "Failed to log in.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.register(credentials);
      if (result.verificationSent) {
        setPendingVerificationEmail(credentials.email.trim());
      } else {
        // If automatically verified (e.g. enterprise domain exception)
        setUser(result.user);
      }
      return result;
    } catch (err: any) {
      setError(err.message || "Registration failed.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setSession(null);
      setPendingVerificationEmail(null);
      toast.success("You have successfully signed out of your workspace.");
    } catch (err: any) {
      console.error("Logout issue:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resendVerification = useCallback(async (emailToVerify?: string) => {
    const targetEmail = emailToVerify || pendingVerificationEmail;
    if (!targetEmail) {
      throw new Error("No email specified for verification resend.");
    }
    return await authService.resendVerificationEmail(targetEmail);
  }, [pendingVerificationEmail]);

  const requestPasswordReset = useCallback(async (email: string) => {
    return await authService.requestPasswordReset(email);
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    return await authService.updatePassword(newPassword);
  }, []);

  const isAuthenticated = Boolean(session && user);
  const isEmailVerified = Boolean(user?.emailVerified || session);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated,
        isEmailVerified,
        isLoading,
        error,
        pendingVerificationEmail,
        setPendingVerificationEmail,
        login,
        register,
        logout,
        resendVerification,
        requestPasswordReset,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
