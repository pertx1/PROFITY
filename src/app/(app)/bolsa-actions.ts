"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const toggleSchema = z.object({
  key: z.string().min(1).max(300),
  quantity: z.number().int().nonnegative(),
  checked: z.boolean(),
});

export async function togglePrintBagLineAction(input: {
  key: string;
  quantity: number;
  checked: boolean;
}) {
  const { userId } = await requireUser();
  const parsed = toggleSchema.safeParse(input);
  if (!parsed.success) return;
  const { key, quantity, checked } = parsed.data;

  if (checked) {
    await prisma.printBagCheck.upsert({
      where: { userId_key: { userId, key } },
      update: { quantity, checkedAt: new Date() },
      create: { userId, key, quantity },
    });
  } else {
    await prisma.printBagCheck.deleteMany({ where: { userId, key } });
  }
  revalidatePath("/");
}

export async function resetPrintBagAction() {
  const { userId } = await requireUser();
  await prisma.printBagCheck.deleteMany({ where: { userId } });
  revalidatePath("/");
}
