const AUTH_STORAGE_KEY = "competeiq-auth";

export interface AuthSession {
  email: string;
  name: string;
  expiresAt: number;
}

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function saveAuthSession(email: string) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  const session: AuthSession = {
    email: email.trim().toLowerCase(),
    name: email.trim().split("@")[0] || "User",
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };

  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function getAuthSession(): AuthSession | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const raw = storage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed.email || !parsed.expiresAt || parsed.expiresAt <= Date.now()) {
      storage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    storage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getAuthSession());
}

export function clearAuthSession() {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(AUTH_STORAGE_KEY);
}
