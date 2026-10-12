"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStoreMember } from "@/lib/auth/require-role";
import { variantSchema } from "@/lib/validations/product.schema";

export type VariantActionResult = { ok: true } | { ok: false; error: string };

export async function addVariant(
  storeSlug: string,
  productId: string,
  formData: FormData,
): Promise<VariantActionResult> {
  const context = await requireStoreMember(storeSlug);

  const parsed = variantSchema.safeParse({
    sku: formData.get("sku"),
    size: formData.get("size") ?? "",
    color: formData.get("color") ?? "",
    priceOverride: formData.get("priceOverride") ?? "",
    initialStock: formData.get("initialStock") ?? "0",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { sku, size, color, priceOverride, initialStock } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("product_variants").insert({
    product_id: productId,
    store_id: context.storeId,
    sku,
    size: size || null,
    color: color || null,
    price_override: priceOverride === "" ? null : priceOverride,
    stock: initialStock,
  });

  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "Ya existe una variante con ese SKU" : "No se pudo crear la variante",
    };
  }

  return { ok: true };
}

/**
 * Activa/desactiva una variante. Nunca se borra de verdad: tiene historial
 * en stock_movements que debe conservarse, y las ventas pasadas referencian
 * su id.
 */
export async function setVariantActive(
  storeSlug: string,
  variantId: string,
  isActive: boolean,
): Promise<VariantActionResult> {
  const context = await requireStoreMember(storeSlug);

  const supabase = await createClient();
  const { error } = await supabase
    .from("product_variants")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", variantId)
    .eq("store_id", context.storeId);

  if (error) {
    return { ok: false, error: "No se pudo actualizar la variante" };
  }

  return { ok: true };
}
