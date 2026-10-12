-- Configuración de tienda (moneda, umbral de stock bajo por defecto). El
-- número de WhatsApp ya vive en stores.whatsapp_number desde la Etapa 3.
create table public.store_settings (
  store_id uuid primary key references public.stores (id) on delete cascade,
  currency text not null default 'USD',
  default_low_stock_threshold integer not null default 5 check (default_low_stock_threshold >= 0),
  updated_at timestamptz not null default now()
);

alter table public.store_settings enable row level security;

create policy "store_settings_select_members" on public.store_settings
  for select
  using (public.is_store_member(store_id));

create policy "store_settings_update_owner" on public.store_settings
  for update
  using (public.is_store_owner(store_id))
  with check (public.is_store_owner(store_id));

-- Crea la fila de configuración por defecto junto con la tienda.
create function public.handle_new_store_settings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.store_settings (store_id) values (new.id);
  return new;
end;
$$;

create trigger on_store_created_settings
  after insert on public.stores
  for each row execute function public.handle_new_store_settings();

-- Backfill por si ya existieran tiendas antes de esta migración.
insert into public.store_settings (store_id)
select id from public.stores
where not exists (select 1 from public.store_settings where store_id = stores.id);

-- Placeholder para la fase de planes de suscripción. Sin lógica de
-- billing todavía: sin policy de insert/update desde el cliente (eso
-- llegará con un backend de pagos que use la service_role key).
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null unique references public.stores (id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_owner" on public.subscriptions
  for select
  using (public.is_store_owner(store_id));
