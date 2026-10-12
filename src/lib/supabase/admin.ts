import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import type { WebSocketLikeConstructor } from "@supabase/realtime-js";
import type { Database } from "@/types/database.types";

/**
 * Cliente con la clave `service_role`: ignora RLS por completo.
 *
 * ADVERTENCIA: solo se importa desde código server-only (src/actions/**,
 * src/app/**\/route.ts). El import de "server-only" hace que el build falle
 * si este módulo termina en un bundle de cliente. Nunca pasar el resultado
 * de operaciones aquí directamente a datos renderizados sin validar que el
 * usuario actual tiene permiso para verlos — esta conexión no filtra nada.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      // Node 20 no tiene WebSocket global nativo; ver nota en server.ts
      // (incluye por qué el cast es necesario y seguro).
      realtime: {
        transport: WebSocket as unknown as WebSocketLikeConstructor,
      },
    },
  );
}
