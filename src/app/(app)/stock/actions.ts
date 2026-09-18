"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { adjustDtfStock, adjustTshirtStock } from "@/lib/stock";
import { dtfAdjustSchema, tshirtAdjustSchema } from "@/lib/validation";

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
