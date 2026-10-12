"use server";

import { createClient } from "@/lib/supabase/server";
import { signInSchema } from "@/lib/validations/auth.schema";

export type SignInResult =
  | { ok: true; defaultStoreSlug: string | null }
  | { ok: false; error: string };

export async function signIn(formData: FormData): Promise<SignInResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { ok: false, error: "Correo o contraseña incorrectos" };
  }

  const { data: membership } = await supabase
    .from("store_members")
    .select("store_id")
    .eq("user_id", data.user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return { ok: true, defaultStoreSlug: null };
  }

  const { data: store } = await supabase
    .from("stores")
    .select("slug")
    .eq("id", membership.store_id)
    .single();

  return { ok: true, defaultStoreSlug: store?.slug ?? null };
}
