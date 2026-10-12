import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Ingresa un nombre de categoría"),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
