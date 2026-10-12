"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStoreMember } from "@/lib/auth/require-role";
import { createCategorySchema } from "@/lib/validations/category.schema";
import { slugify } from "@/lib/slugify";

export type CreateCategoryResult = { ok: true } | { ok: false; error: string };

export async function createCategory(
  storeSlug: string,
  formData: FormData,
): Promise<CreateCategoryResult> {
  const context = await requireStoreMember(storeSlug);

  const parsed = createCategorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    store_id: context.storeId,
    name: parsed.data.name,
    slug: slugify(parsed.data.name),
  });

  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "Ya existe una categoría con ese nombre" : "No se pudo crear la categoría",
    };
  }

  return { ok: true };
}
