# Compete IQ — Immune Support Market Insights
### Technical Documentation · v1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Backend — How It Works](#backend)
   - [API Endpoints](#api-endpoints)
   - [Agent Pipeline](#agent-pipeline)
   - [Services and Data Sources](#services-and-data-sources)
   - [LLM Integration](#llm-integration)
6. [Frontend — Pages and Features](#frontend)
7. [Data Flow — End to End](#data-flow)
8. [Environment Configuration](#environment-configuration)
9. [Running Locally](#running-locally)
10. [Deployment (Vercel)](#deployment-vercel)
11. [Database (Supabase)](#database-supabase)

---

## Overview

**Compete IQ** is an AI-powered **market intelligence platform** built specifically for the **immune support supplement and functional food market**. It helps brand strategists, product managers, and competitive analysts:

- Discover competitor products in real time
- Extract marketing and health claims automatically from product data
- Identify active ingredients and formulation trends
- Estimate revenue attribution per SKU
- Chat with an AI assistant to get instant market answers
- Receive proactive alerts on category shifts

> The platform queries two public food/supplement databases (Open Food Facts + USDA FDC), runs an AI agent pipeline over the results, persists everything to Supabase, and presents it through a polished React dashboard.

---

## Architecture

```
User (Browser)
     |
     v
Frontend (React SPA / Vite)
     |
     v  POST /api/trends or /api/assistant/chat
     |
     v
FastAPI Backend (Python 3.12)
     |
     |----> LLM Provider (Gemini / OpenAI / Anthropic)
     |           Intent classification, Claims extraction, AI chat replies
     |
     |----> Open Food Facts API       --|
     |----> USDA FDC Branded Foods API --| Match Agent (parallel)
     |
     |----> Claims Agent
     |----> Ingredient Agent          (run in parallel)
     |----> Revenue Agent
     |
     |----> Supabase (Postgres) — persist results
     |
     v
Aggregated MarketTrendsResponse → Frontend → Dashboard
```

**Async Production Mode** (with Redis + Celery):
```
POST /api/trends/async  -->  Redis Queue  -->  Celery Worker
                                               (runs the same pipeline in background)
GET  /api/jobs/{id}     <--  Supabase     <--  Worker saves results
```

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + TypeScript | UI framework |
| **Routing** | TanStack Router (file-based) | SPA routing with type safety |
| **Styling** | Tailwind CSS + shadcn/ui | Design system and components |
| **Build Tool** | Vite 8 | Fast dev server and production bundler |
| **Backend** | Python 3.12 + FastAPI | REST API and agent orchestrator |
| **Async Tasks** | Celery + Redis | Production async pipeline |
| **Database** | Supabase (Postgres) | Persistent storage |
| **LLM** | Google Gemini 2.5 Flash | Intent classification, claims extraction, chat |
| **Data Source 1** | Open Food Facts | 3M+ global food/supplement products |
| **Data Source 2** | USDA FDC Branded Foods | US supplement and functional food registry |
| **Deployment** | Vercel | Frontend hosting and edge delivery |

---

## Project Structure

```
immune-market-insights/
|
|-- frontend/                        React SPA
|   |-- index.html                   HTML entry point
|   |-- vite.config.ts               Vite build configuration
|   |-- src/
|       |-- main.tsx                 React root mount + CSS import
|       |-- router.tsx               TanStack Router setup
|       |-- styles.css               Global CSS + Tailwind
|       |-- routes/
|       |   |-- index.tsx            Landing page (public)
|       |   |-- login.tsx            Sign in page
|       |   |-- signup.tsx           Registration page
|       |   |-- app.tsx              Authenticated layout (sidebar + header)
|       |   |-- app.index.tsx        Dashboard (market overview)
|       |   |-- app.competitors.tsx  Competitor analysis
|       |   |-- app.products.tsx     Product catalog
|       |   |-- app.claims.tsx       Marketing claims browser
|       |   |-- app.ingredients.tsx  Ingredient insights
|       |   |-- app.trends.tsx       Market trend charts
|       |   |-- app.pricing.tsx      Pricing intelligence
|       |   |-- app.alerts.tsx       Competitive alerts
|       |   |-- app.assistant.tsx    AI chat assistant
|       |   |-- app.reports.tsx      Reports generator
|       |   `-- app.settings.tsx     User settings
|       |-- components/              Reusable UI components (shadcn/ui)
|       `-- lib/
|           |-- api.ts               Backend API client (typed fetch calls)
|           `-- auth.ts              Session management (localStorage)
|
|-- backend/                         FastAPI application
|   |-- main.py                      App entry point + all route definitions
|   |-- config.py                    Environment settings (Pydantic Settings)
|   |-- celery_app.py                Celery worker configuration
|   |-- agents/
|   |   |-- match_agent.py           Product discovery and relevance scoring
|   |   |-- claims_agent.py          Marketing claims extraction
|   |   |-- ingredient_agent.py      Active ingredient identification
|   |   `-- revenue_agent.py         Revenue attribution estimation
|   |-- services/
|   |   |-- llm_client.py            Unified LLM client (Gemini / OpenAI / Anthropic)
|   |   |-- openfoodfacts_client.py  Open Food Facts API wrapper
|   |   |-- usda_fdc_client.py       USDA FDC API wrapper
|   |   `-- supabase_client.py       Supabase DB wrapper
|   |-- models/
|   |   `-- schemas.py               Pydantic request/response schemas
|   |-- tasks/
|   |   `-- jobs.py                  Celery task definitions
|   |-- db/
|   |   `-- schema.sql               Supabase table definitions
|   `-- requirements.txt             Python dependencies
|
|-- api/
|   `-- index.py                     Vercel Serverless Python bridge
|-- vercel.json                      Vercel deployment configuration
`-- docker-compose.yml               Local Redis + backend stack
```

---

## Backend

### API Endpoints

All endpoints are served by the FastAPI app at `http://localhost:8000`.
Interactive API docs are available at **http://localhost:8000/docs**.

---

#### `GET /health`
Health check. Returns app name and current environment.

```json
{ "status": "ok", "app": "Immune Support Market Insights", "env": "development" }
```

---

#### `POST /api/trends`  — Main Orchestration Endpoint

The **core endpoint**. Accepts a market query, runs the full 4-agent pipeline, and returns aggregated market intelligence.

**Request:**
```json
{
  "query": "immune support",
  "limit": 25
}
```

**Response:**
```json
{
  "query": "immune support",
  "intent": "market_trends",
  "products": [
    {
      "source": "openfoodfacts",
      "source_id": "abc123",
      "name": "Elderberry + Vitamin C Gummies",
      "brand": "Nature's Bounty",
      "category": "Supplements",
      "ingredients_text": "Elderberry extract, Vitamin C, Zinc...",
      "match_score": 0.857
    }
  ],
  "claims": [
    {
      "product_source_id": "abc123",
      "claim_text": "Contains/associated with: elderberry",
      "claim_type": "immune_support",
      "confidence": 0.55
    }
  ],
  "ingredients": [ ... ],
  "revenue": [ ... ],
  "job_ids": ["550e8400-e29b-41d4-a716-446655440000"]
}
```

---

#### `POST /api/assistant/chat` — AI Assistant

Accepts a natural language question. Runs the agent pipeline on extracted keywords, then uses the configured LLM to generate a professional 2–3 paragraph market intelligence answer.

**Request:**
```json
{ "message": "Which brands dominate vitamin C supplements?" }
```

**Response:**
```json
{
  "reply": "Based on market intelligence data, the vitamin C supplement space is dominated by...",
  "products_count": 10,
  "claims_count": 8,
  "ingredients_count": 12,
  "chart_data": [{ "category": "Vitamins", "value": 5 }],
  "products": [ ... ]
}
```

---

#### `POST /api/trends/async`
Dispatches a Celery job and returns immediately with a job ID. Requires Redis and a running Celery worker.

```json
{ "job_id": "550e8400-...", "status": "dispatched" }
```

---

#### `GET /api/jobs/{job_id}`
Polls Supabase for the results of a previously dispatched async job.

---

#### `GET /api/llm/status`
Returns which LLM provider is active and whether an API key is configured.

---

### Agent Pipeline

When a query hits `/api/trends`, the backend runs **4 specialised agents**:

```
User Query: "immune support"
        |
        v
[Step 1] Intent Classifier (LLM)
         Categorises the query: market_trends | product_search | ingredient_lookup
        |
        v
[Step 2] Match Agent
         - Expands query using synonym map:
           "immune support" -> ["immunity", "vitamin c", "zinc", "elderberry", "echinacea"]
         - Queries Open Food Facts API (async)
         - Queries USDA FDC Branded Foods API (async)
         - Normalises both responses to a common ProductMatch shape
         - Scores each product: hits / total_query_terms
         - De-duplicates by (source, source_id)
         - Returns top N products sorted by match_score
        |
        |-----> [Step 3a] Claims Agent (parallel)
        |        - For each product: scans name + ingredients_text
        |        - Rule-based: regex patterns for immune_support, energy, digestive, beauty, sleep
        |        - LLM-based: if API key present, uses LLM for higher-quality extraction
        |        - Returns list of ExtractedClaim objects
        |
        |-----> [Step 3b] Ingredient Agent (parallel)
        |        - Parses ingredients_text from each product
        |        - Tags ingredients as active vs inactive
        |        - Identifies category: vitamin, mineral, botanical, amino acid, etc.
        |        - Returns list of IngredientInsight objects
        |
        `-----> [Step 3c] Revenue Agent (parallel)
                 - Queries Supabase sku_sales table for real sales data
                 - Falls back to: match_score * $10,000 placeholder estimate
                 - Labels methodology transparently (internal_sales_data vs placeholder)
                 - Returns list of RevenueAttribution objects
        |
        v
[Step 4] Aggregation
         All 4 results combined into MarketTrendsResponse
         Saved to Supabase (graceful no-op if unconfigured)
         Returned to frontend as JSON
```

---

### Services and Data Sources

#### Open Food Facts (`services/openfoodfacts_client.py`)
- Free, open-source food database with 3M+ products globally
- Excellent coverage of European supplements and functional foods
- **No API key required**
- Endpoint: `https://world.openfoodfacts.org/cgi/search.pl`

#### USDA FDC Branded Foods (`services/usda_fdc_client.py`)
- US government food database with strong coverage of US supplements and vitamins
- Requires a free API key from `https://fdc.nal.usda.gov/`
- Endpoint: `https://api.nal.usda.gov/fdc/v1/foods/search`

#### Supabase (`services/supabase_client.py`)
- Postgres-backed cloud database for persisting pipeline results
- **Optional** — the entire app works without it (data is not saved between runs)
- Tables: `products`, `claims`, `ingredients`, `revenue_attributions`, `sku_sales`

---

### LLM Integration

`services/llm_client.py` provides a **single unified interface** supporting three LLM providers:

| Provider | Env Variable | Model |
|---|---|---|
| **Google Gemini** (default) | `GEMINI_API_KEY` | `gemini-2.5-flash` |
| OpenAI | `OPENAI_API_KEY` | `gpt-4o-mini` |
| Anthropic | `ANTHROPIC_API_KEY` | `claude-3-haiku` |

The LLM is used for three tasks:
1. **Intent Classification** — every query is categorised before agent dispatch
2. **Claims Extraction** — higher-quality than regex when API key is present
3. **AI Assistant** — generates professional market intelligence answers

> If no LLM API key is configured, the app works fully — it falls back to rule-based regex claim extraction and skips AI-generated assistant replies.

---

## Frontend

The frontend is a **React SPA** using TanStack Router's file-based routing. All `/app/*` pages require authentication — unauthenticated users are redirected to `/login`.

### Pages

| Route | File | What it shows |
|---|---|---|
| `/` | `index.tsx` | Public landing page: hero, features, pricing, testimonials |
| `/login` | `login.tsx` | Email + password sign-in |
| `/signup` | `signup.tsx` | New account registration |
| `/app` | `app.tsx` | Authenticated shell (sidebar + header + global search) |
| `/app` (index) | `app.index.tsx` | **Main dashboard**: stats, top products, revenue chart, claims |
| `/app/competitors` | `app.competitors.tsx` | Competitor brand analysis table |
| `/app/products` | `app.products.tsx` | Full product catalog with filters |
| `/app/claims` | `app.claims.tsx` | Marketing claims extracted per product |
| `/app/ingredients` | `app.ingredients.tsx` | Active ingredients ranked by frequency |
| `/app/trends` | `app.trends.tsx` | Time-series trend visualisations |
| `/app/pricing` | `app.pricing.tsx` | Pricing intelligence per brand/SKU |
| `/app/alerts` | `app.alerts.tsx` | Proactive competitive alerts |
| `/app/assistant` | `app.assistant.tsx` | AI chat assistant — ask anything about the market |
| `/app/reports` | `app.reports.tsx` | Export market reports |
| `/app/settings` | `app.settings.tsx` | User profile and workspace configuration |

### Authentication Flow

Authentication is handled client-side via `localStorage`:

```
Sign In  -->  saveAuthSession(email)  -->  Stores 7-day session in localStorage
                                           Session: { email, name, expiresAt }

Every /app page load:
  getAuthSession()  -->  Valid?  YES --> Load page
                                 NO  --> Redirect to /login
```

> This is a demo-grade auth implementation. For production, replace with Supabase Auth or a JWT-based backend auth provider.

### Global State (MarketDataContext)

The app layout (`app.tsx`) triggers a market search on mount and shares results globally:

```
app.tsx (AppLayout)
  |
  |-- useEffect on mount:
  |     getAuthSession() -- redirect to /login if no session
  |     triggerSearch("immune support") -- calls /api/trends
  |
  `-- MarketDataContext.Provider
        Provides: { query, results, loading, error, triggerSearch }
              |
              +--> app.index.tsx (reads products, claims, revenue)
              +--> app.competitors.tsx (reads products grouped by brand)
              +--> app.products.tsx (reads all products)
              +--> app.claims.tsx (reads claims)
              `... all /app sub-routes read from this shared context
```

### API Client (`src/lib/api.ts`)

```typescript
// Fetch full market intelligence
fetchMarketTrends(query: string, limit?: number): Promise<MarketTrendsResponse>

// Send message to AI assistant
sendAssistantChat(message: string): Promise<AssistantResponse>
```

**Backend URL resolution:**
- **Local dev** (`import.meta.env.DEV`): auto-uses `http://localhost:8000`
- **Production** (Vercel): uses `VITE_API_BASE_URL` env var or relative `/api/*`

---

## Data Flow — End to End

Here is exactly what happens when a user searches for **"immune support"**:

```
1. User enters "immune support" in the dashboard search bar and presses Enter

2. Frontend (app.tsx):
   triggerSearch("immune support")
     --> calls fetchMarketTrends("immune support", 25)
     --> POST http://localhost:8000/api/trends
         Body: { "query": "immune support", "limit": 25 }

3. Backend (main.py) receives the request:
   a. LLM classifies intent --> "market_trends"
   b. Generates a UUID job_id

4. Match Agent (agents/match_agent.py):
   a. Expands query: ["immune support", "immunity", "vitamin c", "zinc", "elderberry", "echinacea"]
   b. In parallel:
      - Queries Open Food Facts: GET /cgi/search.pl?search_terms=immune+support
      - Queries USDA FDC:        POST /foods/search  { "query": "immune support", "dataType": ["Branded"] }
   c. Normalises both to ProductMatch format
   d. Scores each product by keyword hit-rate
   e. De-duplicates: removes duplicate (source, source_id) pairs
   f. Returns top 25 sorted by match_score

5. Three agents run IN PARALLEL:
   - Claims Agent: scans every product's text for health claim patterns
   - Ingredient Agent: parses ingredients_text, tags active ingredients
   - Revenue Agent: checks Supabase for sales data, returns estimates

6. Aggregation:
   - All results combined into MarketTrendsResponse
   - Saved to Supabase tables (no-op if unconfigured)
   - Returned as JSON to frontend

7. Frontend receives the response:
   - MarketDataContext updates: { results, loading: false }
   - Dashboard re-renders with:
     * Product cards grid
     * Revenue chart (bar chart by brand)
     * Claims list
     * Ingredient frequency chart
   - All sub-pages automatically get updated data via shared context
```

---

## Environment Configuration

### `backend/.env`

```env
# App mode
ENV=development

# Redis / Celery (only needed for async pipeline mode)
REDIS_URL=redis://localhost:6379/0

# Supabase — optional, app runs without it
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# USDA FDC API (free key at fdc.nal.usda.gov)
USDA_FDC_API_KEY=DEMO_KEY

# LLM Provider — pick one
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash

# Alternatives (set LLM_PROVIDER accordingly)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# CORS — add your frontend URL
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

### `frontend/.env.local` (optional)

```env
# Explicit backend URL override
VITE_API_BASE_URL=http://localhost:8000
```

---

## Running Locally

### Prerequisites
- Python 3.12+
- Node.js 20+
- (Optional) Redis — only for async Celery pipeline

### Step 1 — Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate it
.venv\Scripts\activate          # Windows PowerShell
# source .venv/bin/activate     # Mac / Linux

# Install Python dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env          # Windows
# cp .env.example .env          # Mac / Linux
# Edit .env and add your API keys

# Start the API server
python -m uvicorn main:app --reload --port 8000
```

API running at: **http://localhost:8000**
Interactive docs: **http://localhost:8000/docs**

---

### Step 2 — Frontend

```bash
cd frontend

# Install Node dependencies
npm install

# Start the dev server
npm run dev
```

App running at: **http://localhost:5174**

---

### Step 3 — Optional: Async Pipeline

```bash
# Terminal 1 — start Redis
redis-server

# Terminal 2 — start Celery worker
cd backend
celery -A celery_app worker --loglevel=info
```

---

## Deployment (Vercel)

The frontend is deployed as a **static SPA on Vercel**.

### How Vercel builds it

```json
// vercel.json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

1. Vercel runs `npm run build` in `frontend/`
2. Vite builds the React app to `frontend/dist/`
3. Vercel serves `dist/` as a static site
4. All URL paths rewrite to `index.html` for SPA client-side routing

### Deploying the Backend

The Python backend currently runs locally only. To make the full app work on Vercel:

**Option A — Railway (Recommended)**
```bash
npm install -g @railway/cli
railway login
railway up
# Set environment variables in Railway dashboard
```

**Option B — Render**
- Create a new Web Service, point to `backend/` directory
- Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Add env variables in Render dashboard

**After deploying backend**, set in Vercel:
```
VITE_API_BASE_URL = https://your-backend.railway.app
```

---

## Database (Supabase)

All pipeline results are persisted to Supabase. The schema is in `backend/db/schema.sql`.

### Tables

| Table | Columns | Description |
|---|---|---|
| `products` | source, source_id, name, brand, category, ingredients_text, match_score | Matched SKUs per job |
| `claims` | product_source_id, claim_text, claim_type, confidence, evidence_snippet | Extracted health claims |
| `ingredients` | product_source_id, ingredient_name, is_active_ingredient, category | Ingredient analysis |
| `revenue_attributions` | product_source_id, estimated_revenue_usd, confidence, methodology | Revenue estimates |
| `sku_sales` | source_id, revenue_usd | **Your own sales data** (populate from ERP/POS export) |

### Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `backend/db/schema.sql` in the Supabase SQL Editor
3. Copy Project URL and Service Role Key from Project Settings
4. Add to `backend/.env`:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key
   ```

> All Supabase operations fail gracefully — if unconfigured, the app simply skips persistence and continues working normally.

---

*Documentation for Compete IQ — Immune Support Market Insights*
*Stack: FastAPI · React · TanStack Router · Vite · Supabase · Gemini AI*
*Last updated: July 2026*
