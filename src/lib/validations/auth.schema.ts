import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Ingresa tu nombre completo"),
  // Vacío cuando alguien se registra solo para aceptar una invitación de
  // empleado: no debe crear una tienda propia.
  storeName: z.union([z.literal(""), z.string().trim().min(2)]),
  email: z.email("Correo inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const inviteMemberSchema = z.object({
  email: z.email("Correo inválido"),
});
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
