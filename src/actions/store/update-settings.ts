"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStoreOwner } from "@/lib/auth/require-role";
import { updateStoreSettingsSchema } from "@/lib/validations/store.schema";

export type UpdateStoreSettingsResult = { ok: true } | { ok: false; error: string };

export async function updateStoreSettings(
  storeSlug: string,
  formData: FormData,
): Promise<UpdateStoreSettingsResult> {
  const context = await requireStoreOwner(storeSlug);

  const parsed = updateStoreSettingsSchema.safeParse({
    description: formData.get("description") ?? "",
    logoUrl: formData.get("logoUrl") ?? "",
    coverImageUrl: formData.get("coverImageUrl") ?? "",
    whatsappNumber: formData.get("whatsappNumber") ?? "",
    currency: formData.get("currency") ?? "USD",
    defaultLowStockThreshold: formData.get("defaultLowStockThreshold") ?? "5",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();

  const { error: storeError } = await supabase
    .from("stores")
    .update({
      description: parsed.data.description || null,
      logo_url: parsed.data.logoUrl || null,
      cover_image_url: parsed.data.coverImageUrl || null,
      whatsapp_number: parsed.data.whatsappNumber || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", context.storeId);

  if (storeError) {
    return { ok: false, error: "No se pudo guardar la configuración" };
  }

  const { error: settingsError } = await supabase
    .from("store_settings")
    .update({
      currency: parsed.data.currency,
      default_low_stock_threshold: parsed.data.defaultLowStockThreshold,
      updated_at: new Date().toISOString(),
    })
    .eq("store_id", context.storeId);

  if (settingsError) {
    return { ok: false, error: "No se pudo guardar la configuración" };
  }

  return { ok: true };
}
