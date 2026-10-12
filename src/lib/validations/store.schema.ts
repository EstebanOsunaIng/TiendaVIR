import { z } from "zod";

export const updateStoreSettingsSchema = z.object({
  description: z.string().trim().optional(),
  logoUrl: z.url("URL de logo inválida").optional().or(z.literal("")),
  coverImageUrl: z.url("URL de portada inválida").optional().or(z.literal("")),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,20}$/, "Ingresa un número de WhatsApp válido")
    .optional()
    .or(z.literal("")),
  currency: z
    .string()
    .trim()
    .length(3, "Usa un código de moneda ISO de 3 letras (ej. USD, MXN)")
    .toUpperCase(),
  defaultLowStockThreshold: z.coerce.number().int().min(0, "No puede ser negativo"),
});
export type UpdateStoreSettingsInput = z.infer<typeof updateStoreSettingsSchema>;
