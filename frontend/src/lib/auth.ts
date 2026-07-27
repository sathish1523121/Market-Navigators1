/**
 * auth.ts
 * Handles authentication session storage and backend API calls.
 *
 * The registration + verification flow:
 *  1. POST /api/auth/register with { email, password, name }
 *  2. Backend creates an unverified account and sends a verification email
 *  3. User clicks link → /verify-email?token=... page calls verifyEmailToken()
 *  4. verifyEmailToken() calls GET /api/auth/verify-email?token=...
 *  5. On success: backend returns a JWT, we store the session and redirect to /app
 *
 * The login flow:
 *  1. POST /api/auth/login with { email, password }
 *  2. Backend validates credentials and checks email_verified
 *  3. On success: backend returns a JWT token + user info
 *  4. We store { email, name, token, expiresAt } in localStorage
 *  5. All subsequent API calls include "Authorization: Bearer <token>"
 */

const AUTH_STORAGE_KEY = "competeiq-auth";

// Resolve the backend base URL (Vite env var, falls back to localhost)
const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000";

export interface AuthSession {
  email: string;
  name: string;
  role: string;
  token: string;
  expiresAt: number;
  emailVerified: boolean;
}

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

// ---------------------------------------------------------------------------
// Login — calls the backend, stores JWT on success
// ---------------------------------------------------------------------------
export async function loginWithCredentials(
  email: string,
  password: string
): Promise<AuthSession> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail || "Invalid email or password.");
  }

  const data = await res.json();

  const session: AuthSession = {
    email: data.email,
    name: data.name,
    role: data.role,
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    emailVerified: data.email_verified ?? true,
  };

  const storage = getStorage();
  if (storage) {
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }

  return session;
}

// ---------------------------------------------------------------------------
// Register — creates an unverified account and triggers a verification email.
// Does NOT log the user in or store a session.
// Returns { email, verificationLink? } — verificationLink is only set in dev
// mode (when SMTP is not configured) so the frontend can offer a dev shortcut.
// ---------------------------------------------------------------------------
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<{ email: string; verificationLink?: string }> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
      name: name.trim(),
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail || "Registration failed. Please try again.");
  }

  const data = await res.json();
  return {
    email: data.email,
    verificationLink: data.verification_link ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// OTP Authentication Helpers
// ---------------------------------------------------------------------------

export async function sendOtpEmail(email: string): Promise<{ email: string; devOtpCode?: string }> {
  const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail || "Failed to send verification code. Please try again.");
  }

  const data = await res.json();
  return {
    email: data.email,
    devOtpCode: data.otp_code ?? undefined,
  };
}

export async function verifyOtpCode(email: string, otp: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail || "Invalid verification code.");
  }
}

export async function completeOtpSignup(
  email: string,
  otp: string,
  name: string,
  password: string
): Promise<AuthSession> {
  const res = await fetch(`${API_BASE}/api/auth/complete-signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
      name: name.trim(),
      password,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail || "Account creation failed. Please try again.");
  }

  const data = await res.json();

  const session: AuthSession = {
    email: data.email,
    name: data.name,
    role: data.role,
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    emailVerified: true,
  };

  const storage = getStorage();
  if (storage) {
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }

  return session;
}


// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------
export function getAuthSession(): AuthSession | null {
  const storage = getStorage();
  if (!storage) return null;

  const raw = storage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed.email || !parsed.token || !parsed.expiresAt || parsed.expiresAt <= Date.now()) {
      storage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    storage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function getAuthToken(): string | null {
  return getAuthSession()?.token ?? null;
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthSession());
}

export function clearAuthSession(): void {
  const storage = getStorage();
  if (storage) {
    storage.removeItem(AUTH_STORAGE_KEY);
  }
}

// ---------------------------------------------------------------------------
// Resend verification email
// ---------------------------------------------------------------------------
export async function resendVerificationEmail(email: string): Promise<{ verificationLink?: string }> {
  const res = await fetch(`${API_BASE}/api/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password: "" }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail || "Failed to resend verification email.");
  }

  const data = await res.json();
  return { verificationLink: data.verification_link ?? undefined };
}

export async function verifyEmailToken(token: string): Promise<AuthSession> {
  const res = await fetch(`${API_BASE}/api/auth/verify-email?token=${encodeURIComponent(token)}`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail || "Email verification failed or token expired.");
  }

  const data = await res.json();

  const session: AuthSession = {
    email: data.email,
    name: data.name,
    role: data.role,
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    emailVerified: true,
  };

  const storage = getStorage();
  if (storage) {
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }

  return session;
}

// ---------------------------------------------------------------------------
// Legacy helper kept for backward-compat (no longer bypasses validation)
// ---------------------------------------------------------------------------
export function saveAuthSession(_email: string): void {
  // This is intentionally a no-op now.
  // Use loginWithCredentials() for proper authenticated login.
  console.warn(
    "saveAuthSession() is deprecated. Use loginWithCredentials() instead."
  );
}
