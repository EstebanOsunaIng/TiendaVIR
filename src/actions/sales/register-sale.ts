"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStoreMember } from "@/lib/auth/require-role";
import { registerSaleSchema } from "@/lib/validations/sale.schema";

export type RegisterSaleResult = { ok: true; saleId: string } | { ok: false; error: string };

/**
 * Único punto de entrada a la lógica de venta. `input.clientRequestId` lo
 * genera el cliente (crypto.randomUUID()) una sola vez por intento de
 * envío, y viaja igual en reintentos -- así register_sale() detecta un
 * doble clic o un reintento de red y no duplica la venta.
 */
export async function registerSale(
  storeSlug: string,
  input: unknown,
): Promise<RegisterSaleResult> {
  const context = await requireStoreMember(storeSlug);

  const parsed = registerSaleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { data: saleId, error } = await supabase.rpc("register_sale", {
    p_store_id: context.storeId,
    p_client_request_id: parsed.data.clientRequestId,
    p_items: parsed.data.items.map((item) => ({
      variant_id: item.variantId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    })),
    p_notes: parsed.data.notes || "",
  });

  if (error || !saleId) {
    return { ok: false, error: error?.message ?? "No se pudo registrar la venta" };
  }

  return { ok: true, saleId };
}
