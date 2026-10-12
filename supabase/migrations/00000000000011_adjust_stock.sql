-- Ajuste manual de inventario (compra, ajuste, devolución). Las ventas NO
-- pasan por aquí: usan register_sale (Etapa 4), que además descuenta stock
-- dentro de la misma transacción que registra la venta.
--
-- security invoker (no definer): las policies de product_variants/
-- stock_movements ya permiten a cualquier miembro de la tienda escribir
-- ahí, así que no hace falta elevar privilegios -- misma decisión que
-- register_sale, documentada en el plan. El chequeo explícito de
-- is_store_member es una defensa adicional, no la única.
create function public.adjust_stock(
  p_variant_id uuid,
  p_quantity integer, -- delta: positivo = entrada, negativo = salida
  p_type public.stock_movement_type,
  p_note text default null
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_store_id uuid;
  v_current_stock integer;
  v_caller uuid := auth.uid();
begin
  if p_type = 'sale' then
    raise exception 'Usa register_sale para registrar ventas, no adjust_stock';
  end if;

  if p_quantity = 0 then
    raise exception 'La cantidad del ajuste no puede ser cero';
  end if;

  select store_id, stock into v_store_id, v_current_stock
    from public.product_variants
    where id = p_variant_id
    for update;

  if v_store_id is null then
    raise exception 'Variante no encontrada';
  end if;

  if not public.is_store_member(v_store_id, v_caller) then
    raise exception 'No autorizado para esta tienda';
  end if;

  if v_current_stock + p_quantity < 0 then
    raise exception 'Stock insuficiente: disponible %, se intentó restar %', v_current_stock, -p_quantity;
  end if;

  update public.product_variants
    set stock = stock + p_quantity, updated_at = now()
    where id = p_variant_id;

  insert into public.stock_movements (store_id, variant_id, type, quantity, note, created_by)
  values (v_store_id, p_variant_id, p_type, p_quantity, p_note, v_caller);
end;
$$;

revoke all on function public.adjust_stock from public;
grant execute on function public.adjust_stock to authenticated;
