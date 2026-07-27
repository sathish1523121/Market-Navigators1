from fastapi import APIRouter, Depends, status
from app.schemas import (
    SignupRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    MessageResponse,
)
from app.auth_service import auth_service
from app.dependencies import get_current_user, get_token

router = APIRouter(tags=["Authentication"])


@router.post(
    "/signup",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
    description="Registers a user via Supabase Auth and triggers a verification email. Automatically populates public.users.",
)
async def signup(payload: SignupRequest) -> MessageResponse:
    """
    Registers a new user.
    - Requires email, password (min 6 chars), and full_name.
    - Sends a confirmation email to the user.
    - Prevents login until email is confirmed.
    """
    return await auth_service.signup(payload)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user & obtain access token",
    description="Validates email/password credentials and checks email verification status. Returns JWT access & refresh tokens.",
)
async def login(payload: LoginRequest) -> TokenResponse:
    """
    Authenticates an existing user.
    - Validates email and password.
    - Fails if email is not verified (403 Forbidden).
    - Returns JWT access token and user metadata.
    """
    return await auth_service.login(payload)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile (Protected)",
    description="Validates Bearer access token and returns user profile from public.users table.",
)
async def get_me(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    """
    Protected route: Returns profile of the currently logged-in user.
    Requires header: `Authorization: Bearer <access_token>`
    """
    return current_user


@router.post(
    "/logout",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Log out user & revoke session (Protected)",
    description="Revokes active session in Supabase Auth.",
)
async def logout(
    current_user: UserResponse = Depends(get_current_user),
    token: str = Depends(get_token),
) -> MessageResponse:
    """
    Protected route: Signs out user and invalidates the session in Supabase Auth.
    Requires header: `Authorization: Bearer <access_token>`
    """
    return await auth_service.logout(token)
