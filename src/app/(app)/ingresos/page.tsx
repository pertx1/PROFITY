import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { IncomesView } from "./IncomesView";

export const metadata: Metadata = { title: "Ingresos · PROFITY" };

const DEFAULT_SOURCES = ["Etsy", "Instagram", "Subvención", "Reembolso", "Otro"];
const DEFAULT_METHODS = ["Transferencia", "Efectivo", "PayPal", "Bizum"];

export default async function IngresosPage() {
  const { userId } = await requireUser();

  const [incomes, sourceRows] = await Promise.all([
    prisma.income.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    }),
    prisma.income.findMany({
      where: { userId },
      select: { source: true },
      distinct: ["source"],
    }),
  ]);

  const sources = Array.from(
    new Set([...DEFAULT_SOURCES, ...sourceRows.map((s) => s.source)]),
  ).sort((a, b) => a.localeCompare(b, "es"));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ingresos</h1>
        <p className="mt-1 text-sm text-secondary">
          Dinero que entra sin ser un pedido: otras ventas, subvenciones,
          reembolsos…
        </p>
      </div>
      <IncomesView incomes={incomes} sources={sources} methods={DEFAULT_METHODS} />
    </div>
  );
}
