-- La migración 00000000000005 movió la extensión citext de public a
-- extensions. accept_store_invitation() declaraba una variable
-- `v_caller_email citext` y PL/pgSQL resuelve los tipos usados en DECLARE
-- contra el search_path vigente EN CADA EJECUCIÓN (a diferencia de un tipo
-- de columna ya creado, que queda enlazado por OID) -- así que, con
-- `search_path = public`, dejó de encontrar el tipo y la función empezó a
-- fallar con "type citext does not exist" (detectado al probar la Etapa 1
-- de punta a punta contra la base real).
--
-- Se evita el problema de raíz: ya no se declara ninguna variable de tipo
-- citext. La comparación de correos se hace con texto plano en minúsculas,
-- así la función no depende de qué schema tenga instalada la extensión.
create or replace function public.accept_store_invitation(p_token uuid)
returns uuid -- store_id
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.store_invitations;
  v_caller_email text := lower(auth.jwt() ->> 'email');
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

  if v_caller_email is null or v_caller_email <> lower(v_invitation.email::text) then
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
