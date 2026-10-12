"use server";

import { createClient } from "@/lib/supabase/server";
import { orderRequestContactSchema, cartItemSchema } from "@/lib/validations/order-request.schema";
import { z } from "zod";

const createOrderRequestInputSchema = orderRequestContactSchema.extend({
  storeId: z.string().uuid(),
  items: z.array(cartItemSchema).min(1, "El carrito está vacío"),
});

export type CreateOrderRequestResult =
  | { ok: true; orderRequestId: string }
  | { ok: false; error: string };

export async function createOrderRequest(
  input: unknown,
): Promise<CreateOrderRequestResult> {
  const parsed = createOrderRequestInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { storeId, customerName, customerPhone, customerNote, items } = parsed.data;
  const supabase = await createClient();

  const { data: orderRequestId, error } = await supabase.rpc("create_order_request", {
    p_store_id: storeId,
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_customer_note: customerNote ?? "",
    p_items: items.map((item) => ({ variant_id: item.variantId, quantity: item.quantity })),
  });

  if (error || !orderRequestId) {
    return { ok: false, error: error?.message ?? "No se pudo enviar la solicitud" };
  }

  return { ok: true, orderRequestId };
}
