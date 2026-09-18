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

export const incomeSchema = z.object({
  id: z.string().min(1).optional(),
  date: z.iso.date("Fecha inválida"),
  source: z.string().trim().min(1, "La fuente es obligatoria").max(60),
  concept: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v ? v : undefined)),
  amount: z.coerce.number().positive("El importe debe ser mayor que 0"),
  method: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export type IncomeInput = z.infer<typeof incomeSchema>;

export const tshirtModelValues = ["BLANCA", "NEGRA", "FUTBOL"] as const;
export const dtfVariantValues = ["UNICO", "BLANCO", "NEGRO"] as const;

export const stockAdjustSchema = z.object({
  amount: z.coerce.number().int().positive("La cantidad debe ser mayor que 0"),
  direction: z.enum(["1", "-1"]),
});

export const tshirtAdjustSchema = stockAdjustSchema.extend({
  model: z.enum(tshirtModelValues),
  size: z.string().trim().min(1).max(10),
});

export const dtfAdjustSchema = stockAdjustSchema.extend({
  name: z.string().trim().min(1).max(60),
  variant: z.enum(dtfVariantValues),
});

export const productionSchema = z.object({
  model: z.enum(tshirtModelValues),
  size: z.string().trim().min(1).max(10),
  quantity: z.coerce.number().int().positive("La cantidad debe ser mayor que 0"),
  designName: z
    .string()
    .trim()
    .max(60)
    .optional()
    .transform((v) => (v ? v : undefined)),
});
