import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPrintBag } from "@/lib/print-bag-server";
import { ALL_DTF_DESIGNS } from "@/lib/stock-catalog";
import { AjustesView } from "./AjustesView";
import { AntolaCard } from "./AntolaCard";

export const metadata: Metadata = { title: "Ajustes · PROFITY" };

export default async function AjustesPage() {
  const { userId } = await requireUser();
  const [shirtRules, designRules, bag, me] = await Promise.all([
    prisma.shirtDtfRule.findMany({ where: { userId }, orderBy: { shirtColor: "asc" } }),
    prisma.designDtfRule.findMany({ where: { userId }, orderBy: { design: "asc" } }),
    getPrintBag(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { antolaTokenCreatedAt: true } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/" className="text-sm font-medium text-accent">
          ‹ Beneficio
        </Link>
        <h1 className="mt-2 text-[34px] font-bold leading-[41px] tracking-tight">Ajustes</h1>
        <p className="mt-1 text-sm text-secondary">
          Qué DTF llevar a la imprenta según el color de la camiseta.
        </p>
      </div>
      <AjustesView
        shirtRules={shirtRules.map(({ id, shirtColor, dtfColor }) => ({ id, shirtColor, dtfColor }))}
        designRules={designRules.map(({ id, design, dtfColor }) => ({ id, design, dtfColor }))}
        colorsWithoutRule={bag.colorsWithoutRule}
        designs={ALL_DTF_DESIGNS}
      />
      <AntolaCard connectedAt={me?.antolaTokenCreatedAt?.toISOString() ?? null} />
    </div>
  );
}
