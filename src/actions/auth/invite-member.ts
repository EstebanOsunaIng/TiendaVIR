"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStoreOwner } from "@/lib/auth/require-role";
import { inviteMemberSchema } from "@/lib/validations/auth.schema";

export type InviteMemberResult =
  | { ok: true; invitationLink: string }
  | { ok: false; error: string };

export async function inviteMember(
  storeSlug: string,
  formData: FormData,
): Promise<InviteMemberResult> {
  const context = await requireStoreOwner(storeSlug);

  const parsed = inviteMemberSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("store_invitations")
    .insert({
      store_id: context.storeId,
      email: parsed.data.email,
      role: "employee",
      invited_by: context.userId,
    })
    .select("token")
    .single();

  if (error || !data) {
    return { ok: false, error: "No se pudo crear la invitación" };
  }

  return {
    ok: true,
    invitationLink: `${process.env.NEXT_PUBLIC_SITE_URL}/invitacion/${data.token}`,
  };
}
