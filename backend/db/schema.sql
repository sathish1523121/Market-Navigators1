-- schema.sql
-- Supabase (Postgres) tables backing the "single source of truth" store
-- in the architecture diagram. Run this in the Supabase SQL editor.

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

-- Row Level Security: enable and add policies once auth is wired up.
-- alter table products enable row level security;
