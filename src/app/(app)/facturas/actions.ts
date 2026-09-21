"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { invoiceSchema } from "@/lib/validation";

export type InvoiceFormState = { error?: string };

function revalidateAfterChange() {
  revalidatePath("/facturas");
  revalidatePath("/akerra");
}

export async function saveInvoiceAction(
  _prevState: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  const { userId } = await requireUser();

  const parsed = invoiceSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    url: formData.get("url"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { id, name, url } = parsed.data;

  if (id) {
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return { error: "Factura no encontrada" };
    }
    await prisma.invoice.update({ where: { id }, data: { name, url } });
  } else {
    await prisma.invoice.create({ data: { userId, name, url } });
  }

  revalidateAfterChange();
  return {};
}

export async function deleteInvoiceAction(formData: FormData) {
  const { userId } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return;

  await prisma.invoice.delete({ where: { id } });
  revalidateAfterChange();
}

export async function deleteAllInvoicesAction() {
  const { userId } = await requireUser();
  await prisma.invoice.deleteMany({ where: { userId } });
  revalidateAfterChange();
}
