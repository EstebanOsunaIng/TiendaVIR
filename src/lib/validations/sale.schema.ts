import { z } from "zod";

export const saleItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().min(0),
});
export type SaleItemInput = z.infer<typeof saleItemSchema>;

export const registerSaleSchema = z.object({
  clientRequestId: z.string().uuid(),
  items: z.array(saleItemSchema).min(1, "Agrega al menos un producto"),
  notes: z.string().trim().optional(),
});
export type RegisterSaleInput = z.infer<typeof registerSaleSchema>;
