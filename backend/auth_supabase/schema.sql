-- ============================================================================
-- SUPABASE AUTH & PUBLIC USERS SCHEMA, TRIGGER, AND RLS POLICIES
-- ============================================================================

-- 1. Create Public Users Table
-- Note: Password is NOT stored here. Passwords remain securely hashed inside auth.users.
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast lookup by email or id
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 2. Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to read only their own profile
CREATE POLICY "Users can view own profile"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Allow users to update only their own profile
CREATE POLICY "Users can update own profile"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- Allow backend service role (full permissions for server-side APIs)
CREATE POLICY "Service role full access"
    ON public.users
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');


-- 3. Automatic User Creation Trigger Function
-- Runs with SECURITY DEFINER privileges to bypass RLS during automatic creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, full_name, email, created_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        NEW.email,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.users.full_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Attach Trigger to auth.users Table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
