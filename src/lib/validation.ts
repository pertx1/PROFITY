import { z } from "zod";

export const expenseSchema = z.object({
  id: z.string().min(1).optional(),
  date: z.iso.date("Fecha inválida"),
  category: z.string().trim().min(1, "La categoría es obligatoria").max(60),
  concept: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v ? v : undefined)),
  amount: z.coerce.number().positive("El importe debe ser mayor que 0"),
  paymentMethod: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

export const orderStatusValues = [
  "SIN_HACER",
  "EN_CASA",
  "EN_PAQUETE",
  "ENVIADO",
  "SIN_LLEGAR",
  "CANCELADO",
] as const;

export const orderSchema = z.object({
  id: z.string().min(1).optional(),
  date: z.iso.date("Fecha inválida"),
  orderNumber: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => (v ? v : undefined)),
  quantity: z.coerce.number().int().positive().default(1),
  model: z.string().trim().min(1, "El modelo es obligatorio").max(80),
  color: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => (v ? v : undefined)),
  size: z
    .string()
    .trim()
    .max(20)
    .optional()
    .transform((v) => (v ? v : undefined)),
  price: z.coerce.number().nonnegative("El precio no puede ser negativo"),
  status: z.enum(orderStatusValues),
});

export type OrderInput = z.infer<typeof orderSchema>;
