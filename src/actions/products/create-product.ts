"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStoreMember } from "@/lib/auth/require-role";
import { productSchema, variantSchema } from "@/lib/validations/product.schema";
import { slugify } from "@/lib/slugify";

export type CreateProductResult =
  | { ok: true; productId: string }
  | { ok: false; error: string };

export async function createProduct(
  storeSlug: string,
  formData: FormData,
): Promise<CreateProductResult> {
  const context = await requireStoreMember(storeSlug);

  const parsedProduct = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    categoryId: formData.get("categoryId") ?? "",
    basePrice: formData.get("basePrice"),
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsedProduct.success) {
    return { ok: false, error: parsedProduct.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const parsedVariant = variantSchema.safeParse({
    sku: formData.get("sku"),
    size: formData.get("size") ?? "",
    color: formData.get("color") ?? "",
    priceOverride: formData.get("priceOverride") ?? "",
    initialStock: formData.get("initialStock") ?? "0",
  });
  if (!parsedVariant.success) {
    return { ok: false, error: parsedVariant.error.issues[0]?.message ?? "Variante inválida" };
  }

  const { name, description, categoryId, basePrice, isPublished } = parsedProduct.data;
  const supabase = await createClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      store_id: context.storeId,
      category_id: categoryId || null,
      name,
      slug: slugify(name),
      description: description || null,
      base_price: basePrice,
      is_published: isPublished,
    })
    .select("id")
    .single();

  if (productError || !product) {
    return {
      ok: false,
      error: productError?.code === "23505" ? "Ya existe un producto con ese nombre" : "No se pudo crear el producto",
    };
  }

  const { sku, size, color, priceOverride, initialStock } = parsedVariant.data;
  const { error: variantError } = await supabase.from("product_variants").insert({
    product_id: product.id,
    store_id: context.storeId,
    sku,
    size: size || null,
    color: color || null,
    price_override: priceOverride === "" ? null : priceOverride,
    stock: initialStock,
  });

  if (variantError) {
    // No hay transacción multi-tabla vía PostgREST: revertimos a mano.
    await supabase.from("products").delete().eq("id", product.id);
    return {
      ok: false,
      error: variantError.code === "23505" ? "Ya existe una variante con ese SKU" : "No se pudo crear la variante inicial",
    };
  }

  return { ok: true, productId: product.id };
}
