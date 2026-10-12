"use server";

import { createClient } from "@/lib/supabase/server";
import { requestPasswordResetSchema } from "@/lib/validations/auth.schema";

export type RequestPasswordResetResult = { ok: true } | { ok: false; error: string };

export async function requestPasswordReset(formData: FormData): Promise<RequestPasswordResetResult> {
  const parsed = requestPasswordResetSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/callback?next=${encodeURIComponent("/restablecer-password")}`,
  });

  // Siempre se responde ok, exista o no esa cuenta, para no revelar qué
  // correos están registrados.
  return { ok: true };
}
