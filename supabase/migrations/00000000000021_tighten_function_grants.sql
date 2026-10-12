-- Hallazgo de `supabase db advisors` + verificación manual: `revoke all
-- on function ... from public` SOLO revoca el grant implícito del
-- pseudo-rol PUBLIC. Supabase otorga EXECUTE directamente a los roles
-- `anon`/`authenticated` vía privilegios por defecto al crear cualquier
-- función nueva en el schema public -- un grant separado que ese
-- `revoke ... from public` nunca tocó. Por eso adjust_stock y
-- register_sale seguían siendo invocables por `anon` (la comprobación
-- interna de is_store_member los rechaza igual porque auth.uid() es null
-- para anon, así que no era explotable -- pero es superficie expuesta de
-- más). handle_new_store_settings (migración 20) es función de trigger y
-- nunca debió quedar expuesta en absoluto, igual que
-- handle_new_store/handle_new_user en la migración 5.
revoke execute on function public.adjust_stock from public, anon;
revoke execute on function public.register_sale from public, anon;
revoke execute on function public.handle_new_store_settings from public, anon, authenticated;
