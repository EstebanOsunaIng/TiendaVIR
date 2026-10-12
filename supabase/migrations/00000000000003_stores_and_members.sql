-- Tiendas (tenants) y su membresía. RLS se habilita en
-- 00000000000009_rls_policies.sql.
create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  is_active boolean not null default true,
  plan text not null default 'free', -- placeholder para fase de suscripciones
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_stores_slug on public.stores (slug);

create type public.store_role as enum ('owner', 'employee');

create table public.store_members (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.store_role not null,
  created_at timestamptz not null default now(),
  unique (store_id, user_id)
);

create index idx_store_members_user on public.store_members (user_id);
create index idx_store_members_store on public.store_members (store_id);

-- Invitaciones de empleados. El token va en la URL /invitacion/[token];
-- es un uuid impredecible, así que actúa como el propio secreto de acceso.
create type public.store_invitation_status as enum ('pending', 'accepted', 'revoked');

create table public.store_invitations (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  email citext not null,
  role public.store_role not null default 'employee',
  token uuid not null unique default gen_random_uuid(),
  status public.store_invitation_status not null default 'pending',
  invited_by uuid not null references public.profiles (id),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_store_invitations_store on public.store_invitations (store_id);
create index idx_store_invitations_email on public.store_invitations (email);
