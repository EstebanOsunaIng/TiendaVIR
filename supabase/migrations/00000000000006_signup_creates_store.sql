-- Extiende handle_new_user(): si el registro incluye metadata de tienda
-- (store_name/store_slug, puestos por la Server Action de signup), crea
-- la tienda en la misma operación. El trigger on_store_created (migración
-- 00000000000004) agrega automáticamente la membership de owner.
-- Esto funciona sin importar si el proyecto exige confirmación de email:
-- el trigger corre al insertarse la fila en auth.users, no al confirmar.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_store_name text := new.raw_user_meta_data ->> 'store_name';
  v_requested_slug text := new.raw_user_meta_data ->> 'store_slug';
  v_base_slug text;
  v_slug text;
  v_suffix int := 0;
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');

  if v_store_name is not null and length(trim(v_store_name)) > 0 then
    v_base_slug := coalesce(v_requested_slug, regexp_replace(lower(trim(v_store_name)), '[^a-z0-9]+', '-', 'g'));
    v_base_slug := trim(v_base_slug, '-');
    v_slug := v_base_slug;

    while exists (select 1 from public.stores where slug = v_slug) loop
      v_suffix := v_suffix + 1;
      v_slug := v_base_slug || '-' || v_suffix;
    end loop;

    insert into public.stores (name, slug, created_by)
    values (v_store_name, v_slug, new.id);
  end if;

  return new;
end;
$$;
