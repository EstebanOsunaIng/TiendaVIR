import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/**
 * Cliente de Supabase para componentes de navegador ("use client").
 * Usa la clave anon: respeta RLS como el usuario autenticado en sesión.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
