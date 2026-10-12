-- Extensiones requeridas por el resto de las migraciones.
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "citext";     -- comparaciones de texto insensibles a mayúsculas
