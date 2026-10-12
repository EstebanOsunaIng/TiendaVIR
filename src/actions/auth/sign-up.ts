"use server";

import { createClient } from "@/lib/supabase/server";
import { signUpSchema } from "@/lib/validations/auth.schema";
import { slugify } from "@/lib/slugify";

export type SignUpResult =
  | { ok: true; needsEmailConfirmation: boolean }
  | { ok: false; error: string };

/**
 * `next` es a dónde debe volver el usuario tras confirmar su correo (por
 * ejemplo /invitacion/<token> si se registró para aceptar una invitación).
 */
export async function signUp(formData: FormData, next = "/login"): Promise<SignUpResult> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    storeName: formData.get("storeName") ?? "",
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { fullName, storeName, email, password } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        ...(storeName
          ? { store_name: storeName, store_slug: slugify(storeName) }
          : {}),
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, needsEmailConfirmation: data.session === null };
}
