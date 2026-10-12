import { z } from "zod";

export const orderRequestContactSchema = z.object({
  customerName: z.string().trim().min(2, "Ingresa tu nombre"),
  customerPhone: z.string().trim().min(7, "Ingresa un teléfono válido"),
  customerNote: z.string().trim().optional(),
});
export type OrderRequestContactInput = z.infer<typeof orderRequestContactSchema>;

export const cartItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive(),
});
export type CartItemInput = z.infer<typeof cartItemSchema>;
