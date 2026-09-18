"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { expenseSchema } from "@/lib/validation";
import { parseExpensesFile } from "@/lib/import";

export type ExpenseFormState = { error?: string };
export type ImportState = { error?: string; imported?: number; skipped?: number };

function revalidateAfterChange() {
  revalidatePath("/gastos");
  revalidatePath("/");
  revalidatePath("/estadisticas");
}

export async function saveExpenseAction(
  _prevState: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  const { userId } = await requireUser();

  const parsed = expenseSchema.safeParse({
    id: formData.get("id") || undefined,
    date: formData.get("date"),
    category: formData.get("category"),
    concept: formData.get("concept"),
    amount: formData.get("amount"),
    paymentMethod: formData.get("paymentMethod"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { id, date, category, concept, amount, paymentMethod } = parsed.data;
  const data = {
    date: new Date(date),
    category,
    concept: concept ?? null,
    amount,
    paymentMethod: paymentMethod ?? null,
  };

  if (id) {
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return { error: "Gasto no encontrado" };
    }
    await prisma.expense.update({ where: { id }, data });
  } else {
    await prisma.expense.create({ data: { ...data, userId } });
  }

  revalidateAfterChange();
  return {};
}

export async function deleteExpenseAction(formData: FormData) {
  const { userId } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return;

  await prisma.expense.delete({ where: { id } });
  revalidateAfterChange();
}

export async function importExpensesAction(
  _prevState: ImportState,
  formData: FormData,
): Promise<ImportState> {
  const { userId } = await requireUser();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Elige primero un archivo Excel (.xlsx)" };
  }

  let rows;
  let skipped;
  try {
    const buffer = await file.arrayBuffer();
    ({ rows, skipped } = await parseExpensesFile(buffer));
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "No se pudo leer el archivo",
    };
  }

  if (rows.length === 0) {
    return { error: "No he encontrado ninguna fila válida en el archivo" };
  }

  await prisma.expense.createMany({
    data: rows.map((row) => ({
      userId,
      date: row.date,
      category: row.category,
      concept: row.concept,
      amount: row.amount,
      paymentMethod: row.paymentMethod,
    })),
  });

  revalidateAfterChange();
  return { imported: rows.length, skipped };
}

export async function deleteAllExpensesAction() {
  const { userId } = await requireUser();
  await prisma.expense.deleteMany({ where: { userId } });
  revalidateAfterChange();
}
