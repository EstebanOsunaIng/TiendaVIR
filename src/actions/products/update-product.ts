"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStoreMember } from "@/lib/auth/require-role";
import { productSchema } from "@/lib/validations/product.schema";

export type UpdateProductResult = { ok: true } | { ok: false; error: string };

export async function updateProduct(
  storeSlug: string,
  productId: string,
  formData: FormData,
): Promise<UpdateProductResult> {
  const context = await requireStoreMember(storeSlug);

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    categoryId: formData.get("categoryId") ?? "",
    basePrice: formData.get("basePrice"),
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { name, description, categoryId, basePrice, isPublished } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name,
      category_id: categoryId || null,
      description: description || null,
      base_price: basePrice,
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .eq("store_id", context.storeId);

  if (error) {
    return { ok: false, error: "No se pudo actualizar el producto" };
  }

  return { ok: true };
}
