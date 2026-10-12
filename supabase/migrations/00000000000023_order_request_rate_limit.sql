-- create_order_request es callable por anon sin autenticación (es el punto
-- de entrada del carrito público), así que queda abierto a flood/spam desde
-- un script. Se añade un límite simple por IP+tienda y un límite global por
-- tienda como respaldo cuando no hay IP disponible (p. ej. dev local).
alter table public.order_requests add column if not exists requester_ip inet;

create index if not exists idx_order_requests_rate_limit
  on public.order_requests (store_id, requester_ip, created_at);

-- Añadir un parámetro crea un overload nuevo en vez de reemplazar la
-- función existente (CREATE OR REPLACE solo reemplaza si la firma es
-- idéntica); hay que tumbar la firma vieja de 5 argumentos primero para
-- que vuelva a haber una sola función con este nombre.
drop function if exists public.create_order_request(uuid, text, text, text, jsonb);

create function public.create_order_request(
  p_store_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_note text,
  p_items jsonb, -- [{ "variant_id": "...", "quantity": 2 }, ...]
  p_requester_ip inet default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request_id uuid;
  v_total numeric(12, 2) := 0;
  v_item jsonb;
  v_variant_id uuid;
  v_quantity integer;
  v_unit_price numeric(12, 2);
  v_item_count integer := 0;
  v_recent_from_ip integer;
  v_recent_for_store integer;
begin
  if trim(coalesce(p_customer_name, '')) = '' then
    raise exception 'Falta el nombre del cliente';
  end if;
  if trim(coalesce(p_customer_phone, '')) = '' then
    raise exception 'Falta el teléfono del cliente';
  end if;

  if not exists (select 1 from public.stores where id = p_store_id and is_active = true) then
    raise exception 'Esta tienda no está disponible';
  end if;

  if p_requester_ip is not null then
    select count(*) into v_recent_from_ip
      from public.order_requests
      where store_id = p_store_id
        and requester_ip = p_requester_ip
        and created_at > now() - interval '10 minutes';

    if v_recent_from_ip >= 5 then
      raise exception 'Enviaste demasiadas solicitudes. Intenta de nuevo en unos minutos.';
    end if;
  end if;

  select count(*) into v_recent_for_store
    from public.order_requests
    where store_id = p_store_id
      and created_at > now() - interval '10 minutes';

  if v_recent_for_store >= 30 then
    raise exception 'Esta tienda recibió demasiadas solicitudes. Intenta de nuevo en unos minutos.';
  end if;

  insert into public.order_requests (store_id, customer_name, customer_phone, customer_note, total_estimate, requester_ip)
  values (p_store_id, trim(p_customer_name), trim(p_customer_phone), p_customer_note, 0, p_requester_ip)
  returning id into v_request_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_variant_id := (v_item ->> 'variant_id')::uuid;
    v_quantity := (v_item ->> 'quantity')::integer;

    if v_quantity <= 0 then
      raise exception 'Cantidad inválida';
    end if;

    select coalesce(pv.price_override, p.base_price) into v_unit_price
      from public.product_variants pv
      join public.products p on p.id = pv.product_id
      where pv.id = v_variant_id
        and pv.store_id = p_store_id
        and pv.is_active = true
        and p.is_published = true;

    if v_unit_price is null then
      raise exception 'Uno de los productos ya no está disponible';
    end if;

    insert into public.order_request_items (order_request_id, variant_id, quantity, unit_price_snapshot)
    values (v_request_id, v_variant_id, v_quantity, v_unit_price);

    v_total := v_total + (v_unit_price * v_quantity);
    v_item_count := v_item_count + 1;
  end loop;

  if v_item_count = 0 then
    raise exception 'El carrito está vacío';
  end if;

  update public.order_requests set total_estimate = v_total where id = v_request_id;

  return v_request_id;
end;
$$;

revoke all on function public.create_order_request from public, anon, authenticated;
grant execute on function public.create_order_request to anon, authenticated;
