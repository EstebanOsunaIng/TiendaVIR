-- Ledger inmutable de movimientos de inventario. stock_movements nunca se
-- actualiza ni se borra: una corrección se hace con un nuevo movimiento.
create type public.stock_movement_type as enum ('purchase', 'adjustment', 'sale', 'return');

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  type public.stock_movement_type not null,
  quantity integer not null, -- positivo = entrada, negativo = salida
  reference_sale_id uuid, -- se enlaza a sales.id en la migración de Etapa 4
  note text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index idx_stock_movements_variant on public.stock_movements (variant_id, created_at desc);
create index idx_stock_movements_store on public.stock_movements (store_id, created_at desc);
