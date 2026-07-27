import re
import supabase._sync.client
from supabase import create_client, Client
from app.config import get_settings

# Patch regex validation in supabase-py SDK to support new Supabase opaque keys (sb_publishable_* / sb_secret_*)
_orig_match = re.match
def _custom_key_match(pattern, string, flags=0):
    if string and (string.startswith("sb_publishable_") or string.startswith("sb_secret_")):
        return True
    return _orig_match(pattern, string, flags)

supabase._sync.client.re.match = _custom_key_match

settings = get_settings()

# Client initialized with ANON key (standard user operations)
supabase: Client = create_client(
    supabase_url=settings.SUPABASE_URL,
    supabase_key=settings.SUPABASE_ANON_KEY,
)

# Admin Client initialized with SERVICE ROLE key (server-side admin operations)
supabase_admin: Client = create_client(
    supabase_url=settings.SUPABASE_URL,
    supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY,
)


def get_supabase() -> Client:
    """Returns the standard Supabase client instance."""
    return supabase


def get_supabase_admin() -> Client:
    """Returns the admin Supabase client instance (bypasses RLS)."""
    return supabase_admin
