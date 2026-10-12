-- order_request_items.variant_id no tenía ON DELETE CASCADE: borrar una
-- tienda completa fallaba con "violates foreign key constraint
-- order_request_items_variant_id_fkey" porque el cascade de stores ->
-- products -> product_variants intentaba borrar la variante mientras
-- order_request_items todavía la referenciaba (detectado al limpiar datos
-- de prueba de la Etapa 3 contra la base real). order_requests ya se
-- borra en cascada junto con la tienda, así que es consistente que sus
-- líneas también lo hagan si la variante desaparece.
alter table public.order_request_items
  drop constraint order_request_items_variant_id_fkey,
  add constraint order_request_items_variant_id_fkey
    foreign key (variant_id) references public.product_variants (id) on delete cascade;
