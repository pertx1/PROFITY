"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { incomeSchema } from "@/lib/validation";

export type IncomeFormState = { error?: string };

function revalidateAfterChange() {
  revalidatePath("/ingresos");
  revalidatePath("/");
  revalidatePath("/estadisticas");
}

export async function saveIncomeAction(
  _prevState: IncomeFormState,
  formData: FormData,
): Promise<IncomeFormState> {
  const { userId } = await requireUser();

  const parsed = incomeSchema.safeParse({
    id: formData.get("id") || undefined,
    date: formData.get("date"),
    source: formData.get("source"),
    concept: formData.get("concept"),
    amount: formData.get("amount"),
    method: formData.get("method"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { id, date, source, concept, amount, method } = parsed.data;
  const data = {
    date: new Date(date),
    source,
    concept: concept ?? null,
    amount,
    method: method ?? null,
  };

  if (id) {
    const existing = await prisma.income.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return { error: "Ingreso no encontrado" };
    }
    await prisma.income.update({ where: { id }, data });
  } else {
    await prisma.income.create({ data: { ...data, userId } });
  }

  revalidateAfterChange();
  return {};
}

export async function deleteIncomeAction(formData: FormData) {
  const { userId } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const existing = await prisma.income.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return;

  await prisma.income.delete({ where: { id } });
  revalidateAfterChange();
}

export async function deleteAllIncomesAction() {
  const { userId } = await requireUser();
  await prisma.income.deleteMany({ where: { userId } });
  revalidateAfterChange();
}
