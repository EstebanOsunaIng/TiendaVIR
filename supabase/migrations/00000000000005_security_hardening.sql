-- Hallazgos de `supabase db advisors` sobre las migraciones 2-4:
--
-- 1. citext estaba instalada en el schema public (WARN de seguridad
--    "extension_in_public"). Se mueve a un schema dedicado `extensions`,
--    siguiendo la convención de Supabase.
-- 2. handle_new_store()/handle_new_user() son funciones de trigger: no
--    tienen ningún motivo para ser invocables directamente vía
--    /rest/v1/rpc/... Se les revoca el EXECUTE público; siguen
--    funcionando como triggers porque esa ruta no depende de permisos
--    de ejecución de la sesión que hace el INSERT.
--    (is_store_member/is_store_owner/get_store_role SÍ necesitan quedar
--    ejecutables por anon/authenticated: las políticas RLS de
--    store_members/store_invitations las invocan evaluando como esos
--    roles, así que revocar ahí rompería las políticas mismas.)
-- 3. Varias políticas usaban auth.uid()/auth.jwt() sin envolver en
--    "(select ...)", lo que el linter de Supabase marca como
--    "auth_rls_initplan" (se reevalúa por fila en vez de una vez por
--    query). Se recrean con el patrón recomendado.
-- 4. `stores` tenía dos políticas SELECT permisivas separadas
--    (members / is_active) -- se combinan en una sola.

create schema if not exists extensions;
alter extension citext set schema extensions;

revoke execute on function public.handle_new_store from public, anon, authenticated;
revoke execute on function public.handle_new_user from public, anon, authenticated;

-- ---- profiles ----

drop policy "profiles_select_self_or_co_member" on public.profiles;
create policy "profiles_select_self_or_co_member" on public.profiles
  for select
  using (
    id = (select auth.uid())
    or exists (
      select 1
      from public.store_members my_membership
      join public.store_members their_membership
        on their_membership.store_id = my_membership.store_id
      where my_membership.user_id = (select auth.uid())
        and their_membership.user_id = public.profiles.id
    )
  );

drop policy "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ---- stores ----

drop policy "stores_select_members" on public.stores;
drop policy "stores_select_public_active" on public.stores;
create policy "stores_select_members_or_public_active" on public.stores
  for select
  using (
    is_active = true
    or public.is_store_member(id)
  );

drop policy "stores_insert_as_owner" on public.stores;
create policy "stores_insert_as_owner" on public.stores
  for insert
  with check (created_by = (select auth.uid()));

-- ---- store_members ----

drop policy "store_members_select_self_or_same_store" on public.store_members;
create policy "store_members_select_self_or_same_store" on public.store_members
  for select
  using (
    user_id = (select auth.uid())
    or public.is_store_member(store_id)
  );

-- ---- store_invitations ----

drop policy "store_invitations_insert_owner" on public.store_invitations;
create policy "store_invitations_insert_owner" on public.store_invitations
  for insert
  with check (public.is_store_owner(store_id) and invited_by = (select auth.uid()));
