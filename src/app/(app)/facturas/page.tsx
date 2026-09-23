import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FacturasView } from "./FacturasView";

export const metadata: Metadata = { title: "Facturas · PROFITY" };

export default async function FacturasPage() {
  const { userId } = await requireUser();

  const invoices = await prisma.invoice.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[34px] font-bold leading-[41px] tracking-tight">Facturas</h1>
        <p className="mt-1 text-sm text-secondary">
          Enlaces a tus facturas en Drive, con el nombre que tú les pongas.
        </p>
      </div>
      <FacturasView invoices={invoices} />
    </div>
  );
}
