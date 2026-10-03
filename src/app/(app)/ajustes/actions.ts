"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { colorKey } from "@/lib/print-bag";
import { ALL_DTF_DESIGNS } from "@/lib/stock-catalog";
import { hashAntolaToken, newAntolaToken } from "@/lib/antola";

export type RuleFormState = { error?: string; ok?: number };

function revalidateAfterChange() {
  revalidatePath("/ajustes");
  revalidatePath("/");
}

const shirtRuleSchema = z.object({
  shirtColor: z.string().trim().min(1, "Escribe el color de la camiseta").max(40),
  dtfColor: z.string().trim().min(1, "Escribe el color del DTF").max(40),
});

const designRuleSchema = z.object({
  design: z.enum(ALL_DTF_DESIGNS as [string, ...string[]], "Elige un diseño"),
  dtfColor: z.string().trim().min(1, "Escribe el DTF especial").max(40),
});

export async function saveShirtRuleAction(
  prev: RuleFormState,
  formData: FormData,
): Promise<RuleFormState> {
  const { userId } = await requireUser();
  const parsed = shirtRuleSchema.safeParse({
    shirtColor: formData.get("shirtColor"),
    dtfColor: formData.get("dtfColor"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const { shirtColor, dtfColor } = parsed.data;
  const key = colorKey(shirtColor);

  await prisma.shirtDtfRule.upsert({
    where: { userId_shirtColorKey: { userId, shirtColorKey: key } },
    update: { shirtColor, dtfColor },
    create: { userId, shirtColor, shirtColorKey: key, dtfColor },
  });
  revalidateAfterChange();
  return { ok: (prev.ok ?? 0) + 1 };
}

export async function deleteShirtRuleAction(formData: FormData) {
  const { userId } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.shirtDtfRule.deleteMany({ where: { id, userId } });
  revalidateAfterChange();
}

export async function saveDesignRuleAction(
  prev: RuleFormState,
  formData: FormData,
): Promise<RuleFormState> {
  const { userId } = await requireUser();
  const parsed = designRuleSchema.safeParse({
    design: formData.get("design"),
    dtfColor: formData.get("dtfColor"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const { design, dtfColor } = parsed.data;

  await prisma.designDtfRule.upsert({
    where: { userId_design: { userId, design } },
    update: { dtfColor },
    create: { userId, design, dtfColor },
  });
  revalidateAfterChange();
  return { ok: (prev.ok ?? 0) + 1 };
}

export async function deleteDesignRuleAction(formData: FormData) {
  const { userId } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.designDtfRule.deleteMany({ where: { id, userId } });
  revalidateAfterChange();
}

// ── Conectar con Antola ──

export type AntolaTokenState = { token?: string; error?: string };

/** Genera una clave nueva para Antola (la anterior deja de funcionar). Se muestra una sola vez. */
export async function createAntolaTokenAction(): Promise<AntolaTokenState> {
  const { userId } = await requireUser();
  const token = newAntolaToken();
  await prisma.user.update({
    where: { id: userId },
    data: { antolaTokenHash: hashAntolaToken(token), antolaTokenCreatedAt: new Date() },
  });
  revalidatePath("/ajustes");
  return { token };
}

/** Desconecta Antola: la clave deja de funcionar. */
export async function revokeAntolaTokenAction() {
  const { userId } = await requireUser();
  await prisma.user.update({ where: { id: userId }, data: { antolaTokenHash: null, antolaTokenCreatedAt: null } });
  revalidatePath("/ajustes");
}
