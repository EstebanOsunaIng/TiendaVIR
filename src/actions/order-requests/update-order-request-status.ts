"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStoreMember } from "@/lib/auth/require-role";
import { ORDER_REQUEST_STATUSES, type OrderRequestStatus } from "@/lib/constants";

export type UpdateOrderRequestStatusResult = { ok: true } | { ok: false; error: string };

export async function updateOrderRequestStatus(
  storeSlug: string,
  orderRequestId: string,
  status: OrderRequestStatus,
): Promise<UpdateOrderRequestStatusResult> {
  const context = await requireStoreMember(storeSlug);

  if (!ORDER_REQUEST_STATUSES.includes(status)) {
    return { ok: false, error: "Estado inválido" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("order_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderRequestId)
    .eq("store_id", context.storeId);

  if (error) {
    return { ok: false, error: "No se pudo actualizar el estado" };
  }

  return { ok: true };
}
