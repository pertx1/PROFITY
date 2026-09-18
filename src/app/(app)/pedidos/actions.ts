"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { orderSchema } from "@/lib/validation";
import { parseOrdersFile } from "@/lib/import";
import { applyOrderStockEffect } from "@/lib/stock";

export type OrderFormState = { error?: string };
export type ImportState = { error?: string; imported?: number; skipped?: number };

function revalidateAfterChange() {
  revalidatePath("/pedidos");
  revalidatePath("/");
  revalidatePath("/estadisticas");
  revalidatePath("/stock");
  revalidatePath("/stock/camisetas");
  revalidatePath("/stock/dtf");
}

export async function saveOrderAction(
  _prevState: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const { userId } = await requireUser();

  const parsed = orderSchema.safeParse({
    id: formData.get("id") || undefined,
    date: formData.get("date"),
    orderNumber: formData.get("orderNumber") || undefined,
    quantity: formData.get("quantity") || 1,
    model: formData.get("model"),
    color: formData.get("color"),
    size: formData.get("size"),
    price: formData.get("price"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { id, date, orderNumber, quantity, model, color, size, price, status } =
    parsed.data;
  const data = {
    date: new Date(date),
    orderNumber: orderNumber ?? null,
    quantity,
    model,
    color: color ?? null,
    size: size ?? null,
    price,
    status,
  };

  if (id) {
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return { error: "Pedido no encontrado" };
    }
    await prisma.order.update({ where: { id }, data });
    await applyOrderStockEffect(userId, existing, "restore");
  } else {
    await prisma.order.create({ data: { ...data, userId } });
  }

  await applyOrderStockEffect(userId, data, "consume");

  revalidateAfterChange();
  return {};
}

export async function deleteOrderAction(formData: FormData) {
  const { userId } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return;

  await prisma.order.delete({ where: { id } });
  await applyOrderStockEffect(userId, existing, "restore");
  revalidateAfterChange();
}

export async function importOrdersAction(
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
    ({ rows, skipped } = await parseOrdersFile(buffer));
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

  // Si el Excel no trae una fecha por pedido (lo habitual), repartimos las
  // fechas de forma proporcional dentro del rango de fechas de tus gastos,
  // en el orden del número de pedido, para que el gráfico de evolución
  // tenga sentido.
  const hasAnyDate = rows.some((row) => row.date !== null);
  let fallbackRange: { min: number; max: number } | null = null;
  if (!hasAnyDate) {
    const range = await prisma.expense.aggregate({
      where: { userId },
      _min: { date: true },
      _max: { date: true },
    });
    if (range._min.date && range._max.date) {
      fallbackRange = {
        min: range._min.date.getTime(),
        max: range._max.date.getTime(),
      };
    }
  }

  // Los pedidos con un número (p.ej. 1001) se ordenan por ese número; los
  // que llevan un nombre en vez de número (pedidos informales) se dejan al
  // final, en el mismo orden en que aparecían en el Excel.
  const orderSortKey = (value: string | null) => {
    const n = value ? Number(value) : NaN;
    return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
  };
  const ordered = hasAnyDate
    ? rows
    : [...rows].sort(
        (a, b) => orderSortKey(a.orderNumber) - orderSortKey(b.orderNumber),
      );

  await prisma.order.createMany({
    data: ordered.map((row, index) => {
      let date: Date;
      if (row.date) {
        date = row.date;
      } else if (fallbackRange) {
        const t = ordered.length > 1 ? index / (ordered.length - 1) : 0;
        date = new Date(
          fallbackRange.min + t * (fallbackRange.max - fallbackRange.min),
        );
      } else {
        date = new Date();
      }
      return {
        userId,
        date,
        orderNumber: row.orderNumber,
        quantity: row.quantity,
        model: row.model,
        color: row.color,
        size: row.size,
        price: row.price,
        status: row.status,
      };
    }),
  });

  revalidateAfterChange();
  return { imported: rows.length, skipped };
}

export async function deleteAllOrdersAction() {
  const { userId } = await requireUser();
  await prisma.order.deleteMany({ where: { userId } });
  revalidateAfterChange();
}
