export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType: string;
  user: UserProfile;
}

export interface AuthState {
  user: UserProfile | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isLoading: boolean;
  error: string | null;
  pendingVerificationEmail: string | null;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}

export interface AuthError {
  code: string;
  message: string;
  details?: string;
}
