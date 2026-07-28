// Forwarder adapter replacing legacy authentication functions with modern production architecture
import { authService, getAuthToken as getToken } from "@/services/auth/auth-service";
import { AuthSession } from "@/types/auth";

const SESSION_STORAGE_KEY = "compete_iq_auth_session";

export function getAuthToken(): string | null {
  return getToken();
}

export function getAuthSession(): AuthSession | null {
  if (typeof window !== "undefined") {
    try {
      const item = localStorage.getItem(SESSION_STORAGE_KEY);
      if (item) {
        return JSON.parse(item);
      }
    } catch (e) {
      console.warn("Session read note:", e);
    }
  }
  return null;
}

export async function registerUser(email: string, password?: string, name?: string) {
  const nameParts = (name || "New User").split(" ");
  const firstName = nameParts[0] || "User";
  const lastName = nameParts.slice(1).join(" ") || "";
  const res = await authService.register({ email, password: password || "tempPassA!1", firstName, lastName });
  return { id: res.user.id, email: res.user.email, verificationLink: null };
}

export async function loginWithCredentials(email: string, password?: string) {
  return await authService.login({ email, password });
}

export async function resendVerificationEmail(email: string) {
  await authService.sendOtp(email);
  return { success: true, verificationLink: null };
}

export async function sendOtpEmail(email: string) {
  await authService.sendOtp(email);
  return { success: true, devOtpCode: undefined };
}

export async function verifyOtpCode(email: string, code: string) {
  const session = await authService.verifyOtp(email, code);
  return { verified: true, session };
}

export async function completeOtpSignup(email: string, code: string, name: string, password?: string) {
  const session = await authService.verifyOtp(email, code);
  return session;
}
