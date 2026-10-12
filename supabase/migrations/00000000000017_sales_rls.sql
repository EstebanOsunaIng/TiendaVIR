-- Ledger inmutable igual que stock_movements: solo select + insert.
-- Correcciones se hacen con un nuevo movimiento de ajuste, no editando o
-- borrando una venta pasada.
alter table public.sales enable row level security;

create policy "sales_select_members" on public.sales
  for select
  using (public.is_store_member(store_id));

create policy "sales_insert_members" on public.sales
  for insert
  with check (public.is_store_member(store_id));

alter table public.sale_items enable row level security;

create policy "sale_items_select_members" on public.sale_items
  for select
  using (
    exists (
      select 1 from public.sales s
      where s.id = sale_id and public.is_store_member(s.store_id)
    )
  );

create policy "sale_items_insert_members" on public.sale_items
  for insert
  with check (
    exists (
      select 1 from public.sales s
      where s.id = sale_id and public.is_store_member(s.store_id)
    )
  );
