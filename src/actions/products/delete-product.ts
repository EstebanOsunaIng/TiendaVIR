"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStoreMember } from "@/lib/auth/require-role";

export type DeleteProductResult = { ok: true } | { ok: false; error: string };

export async function deleteProduct(
  storeSlug: string,
  productId: string,
): Promise<DeleteProductResult> {
  const context = await requireStoreMember(storeSlug);

  const supabase = await createClient();

  // product_images se borra en cascada junto con el producto, pero los
  // archivos en Storage no están enlazados por FK: hay que borrarlos
  // aparte o quedan huérfanos para siempre.
  const { data: images } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("product_id", productId);

  if (images && images.length > 0) {
    await supabase.storage
      .from("product-images")
      .remove(images.map((image) => image.storage_path));
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("store_id", context.storeId);

  if (error) {
    return { ok: false, error: "No se pudo eliminar el producto" };
  }

  return { ok: true };
}
