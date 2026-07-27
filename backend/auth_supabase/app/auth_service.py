from fastapi import HTTPException, status
from gotrue.errors import AuthApiError
from app.database import get_supabase, get_supabase_admin
from app.schemas import SignupRequest, LoginRequest, TokenResponse, UserResponse, MessageResponse


class AuthService:
    def __init__(self):
        self.supabase = get_supabase()
        self.supabase_admin = get_supabase_admin()

    async def signup(self, payload: SignupRequest) -> MessageResponse:
        """
        Register a new user with Supabase Auth.
        Passes full_name in user_metadata so the database trigger creates
        the row in public.users automatically.
        Triggers email verification link automatically.
        """
        try:
            res = self.supabase.auth.sign_up(
                {
                    "email": payload.email.strip().lower(),
                    "password": payload.password,
                    "options": {
                        "data": {
                            "full_name": payload.full_name.strip(),
                        }
                    },
                }
            )

            if not res.user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Signup failed. Please try again.",
                )

            # Check if user already exists (Supabase might return user with identities = [])
            if res.user.identities is not None and len(res.user.identities) == 0:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="An account with this email address already exists.",
                )

            return MessageResponse(
                message="Registration successful! Please check your email to verify your account before logging in."
            )

        except AuthApiError as exc:
            err_msg = str(exc).lower()
            if "already registered" in err_msg or "already exists" in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="An account with this email address already exists.",
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Registration error: {exc.message}",
            )
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unexpected signup error: {str(exc)}",
            )

    async def login(self, payload: LoginRequest) -> TokenResponse:
        """
        Authenticate user with email and password.
        Rejects login attempts if email is not verified (email_confirmed_at is None).
        Returns JWT access and refresh tokens along with user profile.
        """
        try:
            res = self.supabase.auth.sign_in_with_password(
                {
                    "email": payload.email.strip().lower(),
                    "password": payload.password,
                }
            )

            if not res.user or not res.session:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password.",
                )

            # Enforce Email Verification Requirement
            if not res.user.email_confirmed_at:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Email not verified. Please check your inbox for the verification email before logging in.",
                )

            # Retrieve user profile from public.users table
            profile = await self.get_profile_by_id(str(res.user.id))

            user_res = UserResponse(
                id=res.user.id,
                full_name=profile.get("full_name", res.user.user_metadata.get("full_name", "User")),
                email=res.user.email,
                created_at=res.user.created_at,
            )

            return TokenResponse(
                access_token=res.session.access_token,
                refresh_token=res.session.refresh_token,
                token_type="bearer",
                user=user_res,
            )

        except AuthApiError as exc:
            err_msg = str(exc).lower()
            if "invalid login credentials" in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password.",
                )
            if "email not confirmed" in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Email not verified. Please check your inbox for the verification email.",
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Authentication error: {exc.message}",
            )
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unexpected login error: {str(exc)}",
            )

    async def logout(self, access_token: str) -> MessageResponse:
        """
        Revoke the current session in Supabase Auth.
        """
        try:
            self.supabase.auth.sign_out(access_token)
            return MessageResponse(message="Successfully logged out.")
        except Exception as exc:
            # Even if sign_out throws, client token discard is effective
            return MessageResponse(message="Logged out.")

    async def get_profile_by_id(self, user_id: str) -> dict:
        """
        Fetch public user profile by UUID from public.users table.
        """
        try:
            response = (
                self.supabase_admin.table("users")
                .select("*")
                .eq("id", user_id)
                .single()
                .execute()
            )
            if response.data:
                return response.data
            return {}
        except Exception:
            return {}


auth_service = AuthService()
