"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { orderRequestContactSchema, cartItemSchema } from "@/lib/validations/order-request.schema";
import { z } from "zod";

async function getRequesterIp(): Promise<string | null> {
  const headerList = await headers();
  // x-forwarded-for puede traer una lista "cliente, proxy1, proxy2"; el
  // primer valor es el más cercano al cliente original.
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? null;
  return headerList.get("x-real-ip");
}

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
  const requesterIp = await getRequesterIp();

  const { data: orderRequestId, error } = await supabase.rpc("create_order_request", {
    p_store_id: storeId,
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_customer_note: customerNote ?? "",
    p_items: items.map((item) => ({ variant_id: item.variantId, quantity: item.quantity })),
    p_requester_ip: requesterIp,
  });

  if (error || !orderRequestId) {
    return { ok: false, error: error?.message ?? "No se pudo enviar la solicitud" };
  }

  return { ok: true, orderRequestId };
}
