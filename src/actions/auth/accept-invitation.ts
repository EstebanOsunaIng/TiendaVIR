"use server";

import { createClient } from "@/lib/supabase/server";

export type AcceptInvitationResult =
  | { ok: true; storeSlug: string }
  | { ok: false; error: string };

export async function acceptInvitation(token: string): Promise<AcceptInvitationResult> {
  const supabase = await createClient();

  const { data: storeId, error } = await supabase.rpc("accept_store_invitation", {
    p_token: token,
  });

  if (error || !storeId) {
    return { ok: false, error: error?.message ?? "No se pudo aceptar la invitación" };
  }

  const { data: store } = await supabase.from("stores").select("slug").eq("id", storeId).single();
  if (!store) {
    return { ok: false, error: "No se pudo aceptar la invitación" };
  }

  return { ok: true, storeSlug: store.slug };
}
