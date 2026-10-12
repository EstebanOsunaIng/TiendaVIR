-- Registra una venta y descuenta inventario de forma atómica. Ver el
-- diseño completo documentado en el plan: lock de fila (for update) para
-- serializar ventas concurrentes sobre la misma variante, idempotencia
-- vía client_request_id, rollback completo ante cualquier error.
--
-- security invoker (no definer): las policies de sales/sale_items/
-- stock_movements/product_variants ya permiten a cualquier miembro
-- escribir ahí -- misma decisión que adjust_stock, documentada en el plan.
create function public.register_sale(
  p_store_id uuid,
  p_client_request_id uuid,
  p_items jsonb, -- [{ "variant_id": "...", "quantity": 2, "unit_price": 19.99 }, ...]
  p_notes text default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_sale_id uuid;
  v_total numeric(12, 2) := 0;
  v_item jsonb;
  v_variant_id uuid;
  v_qty integer;
  v_price numeric(12, 2);
  v_current_stock integer;
  v_variant_store_id uuid;
  v_item_count integer := 0;
  v_caller uuid := auth.uid();
begin
  if not public.is_store_member(p_store_id, v_caller) then
    raise exception 'No autorizado para esta tienda';
  end if;

  -- Idempotencia: si ya existe una venta con este client_request_id, la
  -- devolvemos sin reprocesar (doble clic, reintento de red).
  select id into v_sale_id from public.sales
    where store_id = p_store_id and client_request_id = p_client_request_id;
  if v_sale_id is not null then
    return v_sale_id;
  end if;

  insert into public.sales (store_id, sold_by, client_request_id, total_amount, notes)
  values (p_store_id, v_caller, p_client_request_id, 0, p_notes)
  returning id into v_sale_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_variant_id := (v_item ->> 'variant_id')::uuid;
    v_qty := (v_item ->> 'quantity')::integer;
    v_price := (v_item ->> 'unit_price')::numeric;

    if v_qty <= 0 then
      raise exception 'Cantidad inválida para variante %', v_variant_id;
    end if;

    -- Lock de fila: bloquea la variante hasta el commit, serializando
    -- ventas concurrentes sobre la misma variante.
    select store_id, stock into v_variant_store_id, v_current_stock
      from public.product_variants
      where id = v_variant_id
      for update;

    if v_variant_store_id is null or v_variant_store_id <> p_store_id then
      raise exception 'Variante % no pertenece a esta tienda', v_variant_id;
    end if;

    if v_current_stock < v_qty then
      raise exception 'Stock insuficiente para variante % (disponible: %, solicitado: %)',
        v_variant_id, v_current_stock, v_qty;
    end if;

    update public.product_variants
      set stock = stock - v_qty, updated_at = now()
      where id = v_variant_id;

    insert into public.sale_items (sale_id, variant_id, quantity, unit_price, subtotal)
    values (v_sale_id, v_variant_id, v_qty, v_price, v_qty * v_price);

    insert into public.stock_movements (store_id, variant_id, type, quantity, reference_sale_id, created_by)
    values (p_store_id, v_variant_id, 'sale', -v_qty, v_sale_id, v_caller);

    v_total := v_total + (v_qty * v_price);
    v_item_count := v_item_count + 1;
  end loop;

  if v_item_count = 0 then
    raise exception 'La venta no puede estar vacía';
  end if;

  update public.sales set total_amount = v_total where id = v_sale_id;

  return v_sale_id;
end;
$$;

revoke all on function public.register_sale from public;
grant execute on function public.register_sale to authenticated;
