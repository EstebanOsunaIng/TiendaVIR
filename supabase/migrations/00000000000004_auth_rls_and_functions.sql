-- ========================================================================
-- Helpers de membership (security definer para evitar el ciclo de RLS al
-- consultar store_members desde las policies de otras tablas).
-- ========================================================================

create function public.is_store_member(p_store_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.store_members sm
    where sm.store_id = p_store_id and sm.user_id = p_user_id
  );
$$;

create function public.get_store_role(p_store_id uuid, p_user_id uuid default auth.uid())
returns public.store_role
language sql
security definer
set search_path = public
stable
as $$
  select sm.role from public.store_members sm
  where sm.store_id = p_store_id and sm.user_id = p_user_id
  limit 1;
$$;

create function public.is_store_owner(p_store_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.get_store_role(p_store_id, p_user_id) = 'owner';
$$;

-- ========================================================================
-- profiles
-- ========================================================================

alter table public.profiles enable row level security;

create policy "profiles_select_self_or_co_member" on public.profiles
  for select
  using (
    id = auth.uid()
    or exists (
      select 1
      from public.store_members my_membership
      join public.store_members their_membership
        on their_membership.store_id = my_membership.store_id
      where my_membership.user_id = auth.uid()
        and their_membership.user_id = public.profiles.id
    )
  );

create policy "profiles_update_self" on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ========================================================================
-- stores
-- ========================================================================

alter table public.stores enable row level security;

create policy "stores_select_members" on public.stores
  for select
  using (public.is_store_member(id));

create policy "stores_select_public_active" on public.stores
  for select
  using (is_active = true);

-- Cualquier usuario autenticado puede crear una tienda de la que será
-- dueño; el trigger handle_new_store() lo inserta como owner enseguida.
create policy "stores_insert_as_owner" on public.stores
  for insert
  with check (created_by = auth.uid());

create policy "stores_update_owner" on public.stores
  for update
  using (public.is_store_owner(id))
  with check (public.is_store_owner(id));

create function public.handle_new_store()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.store_members (store_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

create trigger on_store_created
  after insert on public.stores
  for each row execute function public.handle_new_store();

-- ========================================================================
-- store_members
-- ========================================================================

alter table public.store_members enable row level security;

create policy "store_members_select_self_or_same_store" on public.store_members
  for select
  using (
    user_id = auth.uid()
    or public.is_store_member(store_id)
  );

-- INSERT/UPDATE/DELETE directos solo para el owner (invitar/expulsar
-- gente ya existente en la tienda). El alta inicial del owner la hace
-- el trigger on_store_created, y el alta de empleados invitados la hace
-- accept_store_invitation() — ambos corren security definer y por tanto
-- no pasan por estas policies.
create policy "store_members_insert_owner" on public.store_members
  for insert
  with check (public.is_store_owner(store_id));

create policy "store_members_update_owner" on public.store_members
  for update
  using (public.is_store_owner(store_id))
  with check (public.is_store_owner(store_id));

create policy "store_members_delete_owner" on public.store_members
  for delete
  using (public.is_store_owner(store_id));

-- ========================================================================
-- store_invitations
-- ========================================================================

alter table public.store_invitations enable row level security;

create policy "store_invitations_select_owner" on public.store_invitations
  for select
  using (public.is_store_owner(store_id));

create policy "store_invitations_insert_owner" on public.store_invitations
  for insert
  with check (public.is_store_owner(store_id) and invited_by = auth.uid());

create policy "store_invitations_update_owner" on public.store_invitations
  for update
  using (public.is_store_owner(store_id))
  with check (public.is_store_owner(store_id));

-- La persona invitada todavía no es miembro de la tienda, así que no
-- puede pasar por las policies de arriba. Estas dos funciones son el
-- único camino para leer/aceptar una invitación por token.

create function public.get_invitation_by_token(p_token uuid)
returns table (
  store_name text,
  store_slug text,
  email citext,
  role public.store_role,
  status public.store_invitation_status,
  expires_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select s.name, s.slug, i.email, i.role, i.status, i.expires_at
  from public.store_invitations i
  join public.stores s on s.id = i.store_id
  where i.token = p_token;
$$;

create function public.accept_store_invitation(p_token uuid)
returns uuid -- store_id
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.store_invitations;
  v_caller_email citext := (auth.jwt() ->> 'email');
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión para aceptar una invitación';
  end if;

  select * into v_invitation
    from public.store_invitations
    where token = p_token
    for update;

  if v_invitation is null then
    raise exception 'Invitación no encontrada';
  end if;

  if v_invitation.status <> 'pending' then
    raise exception 'Esta invitación ya no está disponible';
  end if;

  if v_invitation.expires_at < now() then
    raise exception 'Esta invitación expiró';
  end if;

  if v_caller_email is null or v_caller_email <> v_invitation.email then
    raise exception 'Esta invitación fue enviada a otro correo';
  end if;

  insert into public.store_members (store_id, user_id, role)
  values (v_invitation.store_id, auth.uid(), v_invitation.role)
  on conflict (store_id, user_id) do nothing;

  update public.store_invitations
    set status = 'accepted', accepted_at = now()
    where id = v_invitation.id;

  return v_invitation.store_id;
end;
$$;

revoke all on function public.get_invitation_by_token from public;
grant execute on function public.get_invitation_by_token to anon, authenticated;

revoke all on function public.accept_store_invitation from public;
grant execute on function public.accept_store_invitation to authenticated;
