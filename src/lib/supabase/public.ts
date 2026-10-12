import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import type { WebSocketLikeConstructor } from "@supabase/realtime-js";
import type { Database } from "@/types/database.types";

/**
 * Cliente anónimo sin cookies, para contextos sin request (robots.ts,
 * sitemap.ts) donde `cookies()`/`headers()` de Next.js no están disponibles.
 * Respeta RLS igual que el cliente de navegador: solo lee lo público.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      // Node 20 no tiene WebSocket global nativo; ver nota en server.ts.
      realtime: {
        transport: WebSocket as unknown as WebSocketLikeConstructor,
      },
    },
  );
}
