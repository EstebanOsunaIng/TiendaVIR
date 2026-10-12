-- Perfil de cada usuario autenticado. Se crea automáticamente cuando se
-- registra un usuario en auth.users (trigger más abajo).
-- RLS se habilita en 00000000000009_rls_policies.sql, una vez existen
-- las tablas (store_members) que sus políticas necesitan referenciar.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Crea el profile automáticamente al registrarse en Supabase Auth.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
