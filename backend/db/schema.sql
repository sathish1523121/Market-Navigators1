-- schema.sql
-- Supabase (Postgres) tables backing the "single source of truth" store
-- in the architecture diagram. Run this in the Supabase SQL editor.

-- ---------------------------------------------------------------------------
-- Users table for authentication
-- ---------------------------------------------------------------------------
create table if not exists users (
    id            bigint generated always as identity primary key,
    email         text not null unique,
    name          text not null,
    password_hash text not null,  -- SHA-256 hex digest (upgrade to bcrypt in production)
    role          text not null default 'admin' check (role in ('admin', 'viewer')),
    is_active     boolean not null default true,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

-- Seed the two authorised users (password: 12345 -> SHA-256 hash)
-- SHA-256('12345') = 5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5
insert into users (email, name, password_hash, role, is_active) values
  ('shreya.narayae1@gmail.com',        'Shreya Narayanan',  '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5', 'admin', true),
  ('shamarthi.sathish111@gmail.com',   'Shamarthi Sathish', '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5', 'admin', true)
on conflict (email) do nothing;

create table if not exists jobs (
    job_id      text not null,
    agent       text not null,
    status      text not null check (status in ('pending','running','success','failed')),
    error       text,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now(),
    primary key (job_id, agent)
);

create table if not exists products (
    id                 bigint generated always as identity primary key,
    job_id             text not null,
    source             text not null check (source in ('openfoodfacts','usda_fdc')),
    source_id          text not null,
    name               text not null,
    brand              text,
    category           text,
    ingredients_text   text,
    nutrients          jsonb default '{}'::jsonb,
    image_url          text,
    matched_query      text,
    match_score        numeric default 0,
    created_at         timestamptz not null default now(),
    unique (source, source_id)
);
create index if not exists idx_products_job_id on products (job_id);

create table if not exists claims (
    id                  bigint generated always as identity primary key,
    job_id              text not null,
    product_source_id   text not null,
    claim_text          text not null,
    claim_type          text not null default 'other',
    confidence          numeric default 0,
    evidence_snippet    text,
    created_at          timestamptz not null default now()
);
create index if not exists idx_claims_job_id on claims (job_id);

create table if not exists ingredients (
    id                    bigint generated always as identity primary key,
    job_id                text not null,
    product_source_id     text not null,
    ingredient_name       text not null,
    is_active_ingredient  boolean not null default false,
    category              text,
    amount_per_serving    text,
    created_at            timestamptz not null default now()
);
create index if not exists idx_ingredients_job_id on ingredients (job_id);

create table if not exists revenue_attribution (
    id                       bigint generated always as identity primary key,
    job_id                   text not null,
    product_source_id        text not null,
    estimated_revenue_usd    numeric not null default 0,
    revenue_period           text,
    confidence                numeric default 0,
    methodology              text,
    created_at               timestamptz not null default now()
);
create index if not exists idx_revenue_job_id on revenue_attribution (job_id);

-- Optional: populate this from your own POS/ERP export to get real
-- (not placeholder) revenue attribution out of revenue_agent.py.
create table if not exists sku_sales (
    source_id     text primary key,
    revenue_usd   numeric not null,
    period        text,
    updated_at    timestamptz not null default now()
);

-- Row Level Security: enable policies so users only see their own data.
-- alter table products enable row level security;
-- alter table users enable row level security;

