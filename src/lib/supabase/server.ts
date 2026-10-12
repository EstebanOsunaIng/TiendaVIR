import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import WebSocket from "ws";
import type { WebSocketLikeConstructor } from "@supabase/realtime-js";
import type { Database } from "@/types/database.types";

/**
 * Cliente de Supabase para Server Components / Server Actions / Route Handlers.
 * Usa la clave anon + cookies de sesión: respeta RLS como el usuario autenticado.
 * `setAll` puede fallar en un Server Component puro (no se pueden escribir cookies
 * fuera de un Server Action o Route Handler); se ignora porque el middleware ya
 * refresca la sesión en cada request.
 *
 * `realtime.transport`: Node 20 no tiene WebSocket global nativo (eso llega en
 * Node 22+), y supabase-js intenta construir un cliente de Realtime —y por
 * tanto resolver un WebSocket— en el constructor, aunque nunca se use
 * `.channel()`. Sin esto, cada request fallaría con
 * "Node.js 20 detected without native WebSocket support".
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      realtime: {
        // @types/ws declara un constructor(address: null) como primera
        // sobrecarga, lo que rompe la comparación estructural directa
        // contra WebSocketLikeConstructor. El cast es seguro: en runtime
        // es la misma clase que recomienda el propio mensaje de error de
        // Supabase para Node < 22.
        transport: WebSocket as unknown as WebSocketLikeConstructor,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Llamado desde un Server Component — el middleware refresca la sesión.
          }
        },
      },
    },
  );
}
