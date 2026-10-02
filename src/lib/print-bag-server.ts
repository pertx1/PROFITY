import "server-only";
import { prisma } from "@/lib/prisma";
import { buildPrintBag, type BagLine } from "@/lib/print-bag";

export type CheckedBagLine = BagLine & { checked: boolean; changed: boolean };

export async function getPrintBag(userId: string) {
  const [orders, shirtRules, designRules, checks] = await Promise.all([
    prisma.order.findMany({
      where: { userId, status: "SIN_HACER" },
      select: { id: true, orderNumber: true, model: true, color: true, size: true, quantity: true },
      orderBy: { date: "asc" },
    }),
    prisma.shirtDtfRule.findMany({ where: { userId } }),
    prisma.designDtfRule.findMany({ where: { userId } }),
    prisma.printBagCheck.findMany({ where: { userId } }),
  ]);

  const bag = buildPrintBag(orders, { shirt: shirtRules, design: designRules });
  const checkByKey = new Map(checks.map((c) => [c.key, c.quantity]));

  // Una línea marcada cuya cantidad ya no coincide con la que tenía al
  // marcarla se muestra desmarcada y como "ha cambiado".
  const withChecks = (lines: BagLine[]): CheckedBagLine[] =>
    lines.map((line) => {
      const checkedQuantity = checkByKey.get(line.key);
      return {
        ...line,
        checked: checkedQuantity === line.quantity,
        changed: checkedQuantity !== undefined && checkedQuantity !== line.quantity,
      };
    });

  return { ...bag, shirts: withChecks(bag.shirts), dtfs: withChecks(bag.dtfs) };
}

export type PrintBagData = Awaited<ReturnType<typeof getPrintBag>>;
