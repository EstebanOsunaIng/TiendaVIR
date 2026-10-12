"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStoreMember } from "@/lib/auth/require-role";

export type AddProductImageResult = { ok: true } | { ok: false; error: string };

/**
 * Registra en product_images una foto que el cliente ya subió a Storage
 * (bucket product-images, ruta {storeId}/{productId}/{archivo}). La subida
 * binaria se hace desde el navegador porque Server Actions no son el
 * camino adecuado para archivos grandes; esta acción solo persiste la
 * referencia una vez que la subida ya terminó.
 */
export async function addProductImage(
  storeSlug: string,
  productId: string,
  storagePath: string,
  position: number,
): Promise<AddProductImageResult> {
  const context = await requireStoreMember(storeSlug);

  if (!storagePath.startsWith(`${context.storeId}/${productId}/`)) {
    return { ok: false, error: "Ruta de archivo inválida" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("product_images").insert({
    product_id: productId,
    storage_path: storagePath,
    position,
  });

  if (error) {
    return { ok: false, error: "No se pudo registrar la foto" };
  }

  return { ok: true };
}
