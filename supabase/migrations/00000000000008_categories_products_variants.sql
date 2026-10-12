-- Catálogo interno: categorías, productos, imágenes y variantes.
-- RLS se habilita en 00000000000010_catalog_rls.sql.
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (store_id, slug)
);

create index idx_categories_store on public.categories (store_id);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  base_price numeric(12, 2) not null check (base_price >= 0),
  low_stock_threshold integer check (low_stock_threshold >= 0),
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, slug)
);

create index idx_products_store on public.products (store_id);
create index idx_products_category on public.products (category_id);
create index idx_products_published on public.products (store_id, is_published);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_product_images_product on public.product_images (product_id, position);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  store_id uuid not null references public.stores (id) on delete cascade,
  sku text not null,
  size text,
  color text,
  price_override numeric(12, 2) check (price_override >= 0),
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, sku)
);

create index idx_variants_product on public.product_variants (product_id);
create index idx_variants_store on public.product_variants (store_id);
