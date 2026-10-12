-- Ventas registradas manualmente desde el panel. client_request_id +
-- unique(store_id, client_request_id) da idempotencia: un doble clic o un
-- reintento de red con el mismo id no duplica la venta (ver register_sale).
create table public.sales (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  sold_by uuid not null references public.profiles (id),
  client_request_id uuid not null,
  total_amount numeric(12, 2) not null check (total_amount >= 0),
  notes text,
  created_at timestamptz not null default now(),
  unique (store_id, client_request_id)
);

create index idx_sales_store on public.sales (store_id, created_at desc);

create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales (id) on delete cascade,
  -- on delete cascade (no el default RESTRICT): si se borra la tienda
  -- entera, sale_items no debe bloquear el cascade hacia product_variants.
  -- Ver fk_cascade_defaults en memoria -- mismo bug que order_request_items.
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  subtotal numeric(12, 2) not null check (subtotal >= 0)
);

create index idx_sale_items_sale on public.sale_items (sale_id);
create index idx_sale_items_variant on public.sale_items (variant_id);

-- stock_movements.reference_sale_id se agregó sin FK en la migración 9
-- (sales todavía no existía). Se enlaza ahora.
alter table public.stock_movements
  add constraint fk_stock_movements_sale
  foreign key (reference_sale_id) references public.sales (id) on delete set null;
