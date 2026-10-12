import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Ingresa el nombre del producto"),
  description: z.string().trim().optional(),
  categoryId: z.union([z.literal(""), z.string().uuid()]),
  basePrice: z.coerce.number().min(0, "El precio no puede ser negativo"),
  isPublished: z.coerce.boolean(),
});
export type ProductInput = z.infer<typeof productSchema>;

export const variantSchema = z.object({
  sku: z.string().trim().min(1, "Ingresa un SKU"),
  size: z.string().trim().optional(),
  color: z.string().trim().optional(),
  priceOverride: z.union([z.literal(""), z.coerce.number().min(0)]),
  initialStock: z.coerce.number().int().min(0, "El stock inicial no puede ser negativo"),
});
export type VariantInput = z.infer<typeof variantSchema>;
