-- Bucket de Storage para fotos de producto. Público para lectura (las
-- fotos de catálogo se sirven por la URL pública, que no pasa por RLS);
-- escritura restringida a miembros de la tienda dueña del archivo.
--
-- Convención de ruta obligatoria: {store_id}/{product_id}/{filename} --
-- las policies de escritura dependen de que el primer segmento de la ruta
-- sea el store_id.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_storage_select_members" on storage.objects
  for select
  using (
    bucket_id = 'product-images'
    and public.is_store_member((storage.foldername(name))[1]::uuid)
  );

create policy "product_images_storage_insert_members" on storage.objects
  for insert
  with check (
    bucket_id = 'product-images'
    and public.is_store_member((storage.foldername(name))[1]::uuid)
  );

create policy "product_images_storage_update_members" on storage.objects
  for update
  using (
    bucket_id = 'product-images'
    and public.is_store_member((storage.foldername(name))[1]::uuid)
  );

create policy "product_images_storage_delete_members" on storage.objects
  for delete
  using (
    bucket_id = 'product-images'
    and public.is_store_member((storage.foldername(name))[1]::uuid)
  );
