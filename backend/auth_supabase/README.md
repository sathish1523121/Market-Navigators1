# Complete Authentication System (FastAPI + Supabase)

A production-grade, secure authentication service built with **Python (FastAPI)** and **Supabase Auth & Database**.

---

## 🌟 Key Features

1. **Supabase Managed Authentication**: Handles password hashing, security, and session management inside `auth.users`. Zero raw passwords stored in `public.users`.
2. **Mandatory Email Verification**: Enforces email verification before permitting login access.
3. **Automated User Synchronization**: PostgreSQL Trigger (`handle_new_user`) automatically inserts new records into `public.users` when signup occurs.
4. **Row Level Security (RLS)**: Enforces database-level isolation so users can only access their own profile data.
5. **Secure JWT Token Validation**: Protects routes (`/me`, `/logout`) by verifying Bearer JWT tokens against `SUPABASE_JWT_SECRET`.
6. **Detailed Error Handling**: Returns accurate HTTP error codes:
   - `409 Conflict`: Account already exists.
   - `401 Unauthorized`: Invalid login credentials or expired JWT token.
   - `403 Forbidden`: Unverified email address.

---

## 📁 Project Structure & File Guide

```
backend/auth_supabase/
├── .env.example              # Template for environment credentials
├── schema.sql                # Complete SQL schema, RLS policies, trigger function & trigger
├── app/
│   ├── __init__.py           # Package marker
│   ├── main.py               # FastAPI application entry point & middleware
│   ├── config.py             # Environment variable management (Pydantic Settings)
│   ├── database.py           # Supabase Python Client initializers (Anon & Service Role)
│   ├── schemas.py            # Pydantic models for API request/response validation
│   ├── auth_service.py       # Core business logic for signup, login, logout, & database
│   ├── dependencies.py       # FastAPI HTTPBearer security dependency for JWT validation
│   └── routers/
│       ├── __init__.py       # Package marker
│       └── auth_router.py    # REST APIs: /signup, /login, /me, /logout
└── README.md                 # Complete documentation & execution guide
```

---

## 🛠️ Step-by-Step Setup Guide

### 1. Supabase Project Setup

1. Go to [Supabase](https://supabase.com) and create a new project.
2. In the Supabase Dashboard:
   - Go to **Project Settings** -> **API**.
   - Copy **Project URL** (`SUPABASE_URL`).
   - Copy **anon public key** (`SUPABASE_ANON_KEY`).
   - Copy **service_role key** (`SUPABASE_SERVICE_ROLE_KEY`).
   - Scroll down to **JWT Settings** and copy **JWT Secret** (`SUPABASE_JWT_SECRET`).
3. Enable Email Verification:
   - Go to **Authentication** -> **Providers** -> **Email**.
   - Ensure **"Confirm email"** is turned **ON** (enabled).

### 2. Database Migration (SQL Schema & Trigger)

1. In Supabase Dashboard, click **SQL Editor**.
2. Create a new query, paste the contents of [`schema.sql`](schema.sql), and click **Run**.
3. This creates:
   - `public.users` table
   - RLS security policies
   - `handle_new_user()` trigger function on `auth.users`

---

## 🚀 Running Locally

### 1. Environment Configuration

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
JWT_ALGORITHM=HS256
```

### 2. Install Dependencies

```bash
pip install fastapi uvicorn pydantic pydantic-settings supabase PyJWT python-dotenv
```

### 3. Launch Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

Open interactive Swagger documentation at: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📡 API Endpoint Reference

| Method | Endpoint  | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/signup` | No | Registers a new user & triggers verification email |
| `POST` | `/login`  | No | Authenticates user & returns JWT tokens (requires verified email) |
| `GET`  | `/me`     | Yes (Bearer) | Returns profile of currently logged-in user |
| `POST` | `/logout` | Yes (Bearer) | Revokes active session |

---

### Example API Requests

#### 1. POST /signup
```json
// Request Body
{
  "email": "jane.doe@example.com",
  "password": "SecurePassword123!",
  "full_name": "Jane Doe"
}

// Response (HTTP 201 Created)
{
  "message": "Registration successful! Please check your email to verify your account before logging in."
}
```

#### 2. POST /login (Before Email Verification)
```json
// Response (HTTP 403 Forbidden)
{
  "detail": "Email not verified. Please check your inbox for the verification email before logging in."
}
```

#### 3. POST /login (After Email Verification)
```json
// Response (HTTP 200 OK)
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "refresh_token": "u4g8f...",
  "token_type": "bearer",
  "user": {
    "id": "c56a4180-65aa-42ec-a945-5fd21dec0538",
    "full_name": "Jane Doe",
    "email": "jane.doe@example.com",
    "created_at": "2026-07-27T10:00:00Z"
  }
}
```

#### 4. GET /me (Protected)
```bash
# Request Header
Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...
```
```json
// Response (HTTP 200 OK)
{
  "id": "c56a4180-65aa-42ec-a945-5fd21dec0538",
  "full_name": "Jane Doe",
  "email": "jane.doe@example.com",
  "created_at": "2026-07-27T10:00:00Z"
}
```

---

## 🚢 Deployment Guide

### Deploying to Railway / Render

1. Create a `Dockerfile`:
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```
2. Connect your GitHub repository to Railway or Render.
3. Configure Environment Variables in the cloud dashboard (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`).
