-- RLS para categorías, productos, imágenes, variantes y movimientos de
-- stock. Patrón: miembros (owner y employee) tienen CRUD completo sobre su
-- tienda; el público (anon) solo puede LEER lo publicado de tiendas
-- activas. stock_movements es ledger inmutable: solo select + insert.

-- ========== categories ==========
alter table public.categories enable row level security;

create policy "categories_select_members_or_public" on public.categories
  for select
  using (
    public.is_store_member(store_id)
    or exists (select 1 from public.stores s where s.id = store_id and s.is_active = true)
  );

create policy "categories_insert_members" on public.categories
  for insert
  with check (public.is_store_member(store_id));

create policy "categories_update_members" on public.categories
  for update
  using (public.is_store_member(store_id))
  with check (public.is_store_member(store_id));

create policy "categories_delete_members" on public.categories
  for delete
  using (public.is_store_member(store_id));

-- ========== products ==========
alter table public.products enable row level security;

create policy "products_select_members_or_public" on public.products
  for select
  using (
    public.is_store_member(store_id)
    or (
      is_published = true
      and exists (select 1 from public.stores s where s.id = store_id and s.is_active = true)
    )
  );

create policy "products_insert_members" on public.products
  for insert
  with check (public.is_store_member(store_id));

create policy "products_update_members" on public.products
  for update
  using (public.is_store_member(store_id))
  with check (public.is_store_member(store_id));

create policy "products_delete_members" on public.products
  for delete
  using (public.is_store_member(store_id));

-- ========== product_images ==========
-- No tiene store_id propio: se resuelve vía el producto padre.
alter table public.product_images enable row level security;

create policy "product_images_select_members_or_public" on public.product_images
  for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and (
          public.is_store_member(p.store_id)
          or (
            p.is_published = true
            and exists (select 1 from public.stores s where s.id = p.store_id and s.is_active = true)
          )
        )
    )
  );

create policy "product_images_insert_members" on public.product_images
  for insert
  with check (
    exists (
      select 1 from public.products p
      where p.id = product_id and public.is_store_member(p.store_id)
    )
  );

create policy "product_images_update_members" on public.product_images
  for update
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and public.is_store_member(p.store_id)
    )
  )
  with check (
    exists (
      select 1 from public.products p
      where p.id = product_id and public.is_store_member(p.store_id)
    )
  );

create policy "product_images_delete_members" on public.product_images
  for delete
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and public.is_store_member(p.store_id)
    )
  );

-- ========== product_variants ==========
alter table public.product_variants enable row level security;

create policy "product_variants_select_members_or_public" on public.product_variants
  for select
  using (
    public.is_store_member(store_id)
    or (
      is_active = true
      and exists (
        select 1 from public.products p
        join public.stores s on s.id = p.store_id
        where p.id = product_id and p.is_published = true and s.is_active = true
      )
    )
  );

create policy "product_variants_insert_members" on public.product_variants
  for insert
  with check (public.is_store_member(store_id));

create policy "product_variants_update_members" on public.product_variants
  for update
  using (public.is_store_member(store_id))
  with check (public.is_store_member(store_id));

create policy "product_variants_delete_members" on public.product_variants
  for delete
  using (public.is_store_member(store_id));

-- ========== stock_movements ==========
-- Ledger inmutable: sin policy de update/delete.
alter table public.stock_movements enable row level security;

create policy "stock_movements_select_members" on public.stock_movements
  for select
  using (public.is_store_member(store_id));

create policy "stock_movements_insert_members" on public.stock_movements
  for insert
  with check (public.is_store_member(store_id));
