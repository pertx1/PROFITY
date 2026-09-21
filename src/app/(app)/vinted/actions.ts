"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { vintedItemSchema, type VintedItemInput } from "@/lib/validation";

export type VintedFormState = { error?: string };

function revalidateAfterChange() {
  revalidatePath("/vinted");
  revalidatePath("/gastos");
  revalidatePath("/ingresos");
  revalidatePath("/akerra");
  revalidatePath("/");
  revalidatePath("/estadisticas");
}

export async function saveVintedItemAction(
  _prevState: VintedFormState,
  formData: FormData,
): Promise<VintedFormState> {
  const { userId } = await requireUser();

  const parsed = vintedItemSchema.safeParse({
    id: formData.get("id") || undefined,
    type: formData.get("type"),
    date: formData.get("date"),
    name: formData.get("name"),
    size: formData.get("size"),
    price: formData.get("price"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { id, type, date, name, size, price }: VintedItemInput = parsed.data;
  const parsedDate = new Date(date);
  const concept = size ? `${name} · talla ${size}` : name;

  if (id) {
    const existing = await prisma.vintedItem.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId || existing.type !== type) {
      return { error: "Artículo no encontrado" };
    }
    if (type === "COMPRA") {
      await prisma.vintedItem.update({
        where: { id },
        data: {
          name,
          size: size ?? null,
          price,
          date: parsedDate,
          expense: {
            update: { date: parsedDate, category: "Vinted", concept, amount: price },
          },
        },
      });
    } else {
      await prisma.vintedItem.update({
        where: { id },
        data: {
          name,
          size: size ?? null,
          price,
          date: parsedDate,
          income: {
            update: { date: parsedDate, source: "Vinted", concept, amount: price },
          },
        },
      });
    }
  } else if (type === "COMPRA") {
    await prisma.vintedItem.create({
      data: {
        user: { connect: { id: userId } },
        type,
        name,
        size: size ?? null,
        price,
        date: parsedDate,
        expense: {
          create: { userId, date: parsedDate, category: "Vinted", concept, amount: price },
        },
      },
    });
  } else {
    await prisma.vintedItem.create({
      data: {
        user: { connect: { id: userId } },
        type,
        name,
        size: size ?? null,
        price,
        date: parsedDate,
        income: {
          create: { userId, date: parsedDate, source: "Vinted", concept, amount: price },
        },
      },
    });
  }

  revalidateAfterChange();
  return {};
}

export async function deleteVintedItemAction(formData: FormData) {
  const { userId } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const existing = await prisma.vintedItem.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return;

  if (existing.expenseId) {
    await prisma.expense.delete({ where: { id: existing.expenseId } });
  } else if (existing.incomeId) {
    await prisma.income.delete({ where: { id: existing.incomeId } });
  } else {
    await prisma.vintedItem.delete({ where: { id } });
  }
  revalidateAfterChange();
}

export async function deleteAllVintedComprasAction() {
  await deleteAllVintedByType("COMPRA");
}

export async function deleteAllVintedVentasAction() {
  await deleteAllVintedByType("VENTA");
}

async function deleteAllVintedByType(type: "COMPRA" | "VENTA") {
  const { userId } = await requireUser();

  const items = await prisma.vintedItem.findMany({
    where: { userId, type },
    select: { expenseId: true, incomeId: true },
  });

  const expenseIds = items.map((i) => i.expenseId).filter((v): v is string => !!v);
  const incomeIds = items.map((i) => i.incomeId).filter((v): v is string => !!v);

  await Promise.all([
    expenseIds.length ? prisma.expense.deleteMany({ where: { id: { in: expenseIds } } }) : null,
    incomeIds.length ? prisma.income.deleteMany({ where: { id: { in: incomeIds } } }) : null,
  ]);

  revalidateAfterChange();
}
