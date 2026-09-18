"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  adjustDtfStock,
  adjustTshirtStock,
  registerProduction,
} from "@/lib/stock";
import {
  dtfAdjustSchema,
  productionSchema,
  tshirtAdjustSchema,
} from "@/lib/validation";

export type ProductionFormState = { error?: string; success?: boolean };

function revalidateAfterChange() {
  revalidatePath("/stock");
  revalidatePath("/stock/camisetas");
  revalidatePath("/stock/dtf");
}

export async function adjustTshirtStockAction(formData: FormData) {
  const { userId } = await requireUser();

  const parsed = tshirtAdjustSchema.safeParse({
    model: formData.get("model"),
    size: formData.get("size"),
    amount: formData.get("amount"),
    direction: formData.get("direction"),
  });
  if (!parsed.success) return;

  const { model, size, amount, direction } = parsed.data;
  await adjustTshirtStock(userId, model, size, amount * Number(direction));
  revalidateAfterChange();
}

export async function adjustDtfStockAction(formData: FormData) {
  const { userId } = await requireUser();

  const parsed = dtfAdjustSchema.safeParse({
    name: formData.get("name"),
    variant: formData.get("variant"),
    amount: formData.get("amount"),
    direction: formData.get("direction"),
  });
  if (!parsed.success) return;

  const { name, variant, amount, direction } = parsed.data;
  await adjustDtfStock(userId, name, variant, amount * Number(direction));
  revalidateAfterChange();
}

export async function registerProductionAction(
  _prevState: ProductionFormState,
  formData: FormData,
): Promise<ProductionFormState> {
  const { userId } = await requireUser();

  const parsed = productionSchema.safeParse({
    model: formData.get("model"),
    size: formData.get("size"),
    quantity: formData.get("quantity"),
    designName: formData.get("designName"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  await registerProduction(userId, parsed.data);
  revalidateAfterChange();
  return { success: true };
}
