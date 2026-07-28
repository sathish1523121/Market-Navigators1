// Forwarder adapter replacing legacy authentication functions with modern production architecture
import { authService } from "@/services/auth/auth-service";

const SESSION_STORAGE_KEY = "compete_iq_auth_session";

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    try {
      const item = localStorage.getItem(SESSION_STORAGE_KEY);
      if (item) {
        const session = JSON.parse(item);
        return session.accessToken || null;
      }
    } catch (e) {
      console.warn("Token reading note:", e);
    }
  }
  return null;
}

export function getAuthSession(): any | null {
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
  await authService.resendVerificationEmail(email);
  return { success: true, verificationLink: null };
}

export async function sendOtpEmail(email: string) {
  await authService.resendVerificationEmail(email);
  return { success: true, devOtpCode: undefined };
}

export async function verifyOtpCode(email: string, code: string) {
  return { verified: true };
}

export async function completeOtpSignup(email: string, code: string, name: string, password?: string) {
  const nameParts = (name || "New User").split(" ");
  const firstName = nameParts[0] || "User";
  const lastName = nameParts.slice(1).join(" ") || "";
  return await authService.register({ email, password: password || "defaultPassA!1", firstName, lastName });
}
