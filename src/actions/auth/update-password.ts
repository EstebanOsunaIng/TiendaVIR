"use server";

import { createClient } from "@/lib/supabase/server";
import { updatePasswordSchema } from "@/lib/validations/auth.schema";

export type UpdatePasswordResult = { ok: true } | { ok: false; error: string };

export async function updatePassword(formData: FormData): Promise<UpdatePasswordResult> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();

  // Solo funciona si hay una sesión activa: el enlace de recuperación de
  // correo ya la estableció vía /callback antes de llegar a este formulario.
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { ok: false, error: "El enlace de recuperación expiró o no es válido. Solicita uno nuevo." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
