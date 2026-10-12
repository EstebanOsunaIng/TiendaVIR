-- Número de WhatsApp de contacto de la tienda (se configura en
-- /tienda-admin/[storeSlug]/configuracion). El resto de store_settings
-- (moneda, umbral de stock bajo por defecto) llega en la Etapa 5; este
-- campo se necesita ya para el flujo de solicitud de pedido.
alter table public.stores add column whatsapp_number text;

-- Solicitudes de pedido/cotización desde el catálogo público. No es un
-- checkout de e-commerce: no descuenta inventario, solo registra la
-- intención de compra para que la tienda la gestione por WhatsApp.
create type public.order_request_status as enum ('pending', 'contacted', 'confirmed', 'cancelled');

create table public.order_requests (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  customer_note text,
  status public.order_request_status not null default 'pending',
  total_estimate numeric(12, 2) not null check (total_estimate >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_order_requests_store on public.order_requests (store_id, created_at desc);

create table public.order_request_items (
  id uuid primary key default gen_random_uuid(),
  order_request_id uuid not null references public.order_requests (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id),
  quantity integer not null check (quantity > 0),
  unit_price_snapshot numeric(12, 2) not null check (unit_price_snapshot >= 0)
);

create index idx_order_request_items_request on public.order_request_items (order_request_id);
