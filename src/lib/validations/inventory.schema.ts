import { z } from "zod";
import { STOCK_MOVEMENT_TYPES } from "@/lib/constants";

export const adjustStockSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.coerce.number().int().refine((n) => n !== 0, "La cantidad no puede ser cero"),
  type: z.enum(
    STOCK_MOVEMENT_TYPES.filter((t) => t !== "sale") as Exclude<
      (typeof STOCK_MOVEMENT_TYPES)[number],
      "sale"
    >[],
  ),
  note: z.string().trim().optional(),
});
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
