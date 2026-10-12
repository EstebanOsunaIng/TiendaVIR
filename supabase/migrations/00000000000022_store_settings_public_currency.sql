-- El catálogo público necesita mostrar precios en la moneda de la tienda
-- (store_settings.currency no es dato sensible). La policy original solo
-- dejaba leer a miembros; se combina con una condición pública igual que
-- el patrón ya usado en stores/products, en una sola policy para evitar
-- el warning de "multiple permissive policies".
drop policy "store_settings_select_members" on public.store_settings;

create policy "store_settings_select_members_or_public" on public.store_settings
  for select
  using (
    public.is_store_member(store_id)
    or exists (select 1 from public.stores s where s.id = store_id and s.is_active = true)
  );
