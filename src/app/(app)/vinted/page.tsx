import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VintedView } from "./VintedView";

export const metadata: Metadata = { title: "Vinted · PROFITY" };

export default async function VintedPage() {
  const { userId } = await requireUser();

  const items = await prisma.vintedItem.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });

  const compras = items.filter((i) => i.type === "COMPRA");
  const ventas = items.filter((i) => i.type === "VENTA");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vinted</h1>
        <p className="mt-1 text-sm text-secondary">
          Ropa que compras y vendes. Cada compra resta en Gastos y cada venta
          suma en Ingresos, automáticamente.
        </p>
      </div>
      <VintedView compras={compras} ventas={ventas} />
    </div>
  );
}
