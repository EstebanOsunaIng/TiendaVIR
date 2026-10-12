"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStoreMember } from "@/lib/auth/require-role";

export type DeleteProductImageResult = { ok: true } | { ok: false; error: string };

export async function deleteProductImage(
  storeSlug: string,
  imageId: string,
): Promise<DeleteProductImageResult> {
  await requireStoreMember(storeSlug);

  const supabase = await createClient();
  const { data: image } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("id", imageId)
    .single();

  if (!image) {
    return { ok: false, error: "Foto no encontrada" };
  }

  const { error: storageError } = await supabase.storage
    .from("product-images")
    .remove([image.storage_path]);
  if (storageError) {
    return { ok: false, error: "No se pudo borrar el archivo" };
  }

  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) {
    return { ok: false, error: "No se pudo borrar la foto" };
  }

  return { ok: true };
}
