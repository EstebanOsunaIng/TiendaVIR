"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStoreMember } from "@/lib/auth/require-role";
import { adjustStockSchema } from "@/lib/validations/inventory.schema";

export type AdjustStockResult = { ok: true } | { ok: false; error: string };

export async function adjustStock(
  storeSlug: string,
  formData: FormData,
): Promise<AdjustStockResult> {
  await requireStoreMember(storeSlug);

  const parsed = adjustStockSchema.safeParse({
    variantId: formData.get("variantId"),
    quantity: formData.get("quantity"),
    type: formData.get("type"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("adjust_stock", {
    p_variant_id: parsed.data.variantId,
    p_quantity: parsed.data.quantity,
    p_type: parsed.data.type,
    p_note: parsed.data.note || undefined,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
