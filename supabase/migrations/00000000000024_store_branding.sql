-- Columna aditiva para la portada editorial del catálogo público. logo_url
-- ya existía desde el inicio pero sin ningún campo en Configuración para
-- establecerlo; esta migración no lo toca, solo agrega la portada.
-- Las fotos se guardan en el bucket "product-images" ya existente, bajo
-- {store_id}/branding/{filename} -- la policy de Storage solo valida que
-- el primer segmento de la ruta sea el store_id, así que no hace falta
-- tocar Storage ni RLS para esto.
alter table public.stores add column cover_image_url text;
