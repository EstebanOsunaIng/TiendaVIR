-- RLS: nadie inserta directamente en order_requests/order_request_items
-- (ni siquiera los miembros) -- todo pasa por create_order_request(),
-- que valida que la tienda esté activa y que las variantes le pertenezcan
-- antes de escribir nada. Los miembros solo leen y cambian el status.
alter table public.order_requests enable row level security;

create policy "order_requests_select_members" on public.order_requests
  for select
  using (public.is_store_member(store_id));

create policy "order_requests_update_members" on public.order_requests
  for update
  using (public.is_store_member(store_id))
  with check (public.is_store_member(store_id));

alter table public.order_request_items enable row level security;

create policy "order_request_items_select_members" on public.order_request_items
  for select
  using (
    exists (
      select 1 from public.order_requests r
      where r.id = order_request_id and public.is_store_member(r.store_id)
    )
  );

create function public.create_order_request(
  p_store_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_note text,
  p_items jsonb -- [{ "variant_id": "...", "quantity": 2 }, ...]
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

  insert into public.order_requests (store_id, customer_name, customer_phone, customer_note, total_estimate)
  values (p_store_id, trim(p_customer_name), trim(p_customer_phone), p_customer_note, 0)
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

revoke all on function public.create_order_request from public;
grant execute on function public.create_order_request to anon, authenticated;
