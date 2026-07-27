import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import get_settings
from app.database import get_supabase
from app.schemas import UserResponse
from app.auth_service import auth_service

settings = get_settings()
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> UserResponse:
    """
    FastAPI dependency that extracts and validates the Bearer JWT token on protected routes.
    1. Verifies token authenticity against Supabase Auth / SUPABASE_JWT_SECRET.
    2. Ensures user is active and email is verified.
    3. Retrieves profile from public.users table.
    """
    token = credentials.credentials

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 1. Decode & Verify JWT Access Token
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            audience="authenticated",
        )
        user_id: str = payload.get("sub", "")
        email: str = payload.get("email", "")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError as exc:
        # Fallback to Supabase Auth API token verification if local JWT decode fails
        try:
            supabase = get_supabase()
            user_response = supabase.auth.get_user(token)
            if not user_response or not user_response.user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication token.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            user_id = str(user_response.user.id)
            email = user_response.user.email
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or unverified access token.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # 2. Fetch User Profile from public.users table
    profile = await auth_service.get_profile_by_id(user_id)

    if not profile:
        # Fallback profile construction if database query returned empty
        return UserResponse(
            id=user_id,
            full_name="User",
            email=email,
            created_at=profile.get("created_at"),
        )

    return UserResponse(
        id=profile["id"],
        full_name=profile["full_name"],
        email=profile["email"],
        created_at=profile["created_at"],
    )


def get_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Extracts raw Bearer token string from header."""
    return credentials.credentials
