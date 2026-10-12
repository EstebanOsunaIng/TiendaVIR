"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStoreMember } from "@/lib/auth/require-role";

export type DeleteCategoryResult = { ok: true } | { ok: false; error: string };

export async function deleteCategory(
  storeSlug: string,
  categoryId: string,
): Promise<DeleteCategoryResult> {
  const context = await requireStoreMember(storeSlug);

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .eq("store_id", context.storeId);

  if (error) {
    return { ok: false, error: "No se pudo eliminar la categoría" };
  }

  return { ok: true };
}
