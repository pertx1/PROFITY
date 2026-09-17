"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { orderSchema } from "@/lib/validation";

export type OrderFormState = { error?: string };

function revalidateAfterChange() {
  revalidatePath("/pedidos");
  revalidatePath("/");
  revalidatePath("/estadisticas");
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
  } else {
    await prisma.order.create({ data: { ...data, userId } });
  }

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
  revalidateAfterChange();
}
