import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExpensesView } from "./ExpensesView";

export const metadata: Metadata = { title: "Gastos · PROFITY" };

const DEFAULT_CATEGORIES = [
  "Camisetas",
  "DTF",
  "Envío",
  "Publicidad",
  "Web",
  "Dominio",
  "Muestras",
  "Fotografía",
  "Pegatinas",
];

const DEFAULT_PAYMENT_METHODS = ["Efectivo", "Tarjeta", "Transferencia", "Bizum"];

export default async function GastosPage() {
  const { userId } = await requireUser();

  const [expenses, categoryRows] = await Promise.all([
    prisma.expense.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    }),
    prisma.expense.findMany({
      where: { userId },
      select: { category: true },
      distinct: ["category"],
    }),
  ]);

  const categories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...categoryRows.map((c) => c.category)]),
  ).sort((a, b) => a.localeCompare(b, "es"));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[34px] font-bold leading-[41px] tracking-tight">Gastos</h1>
        <p className="mt-1 text-sm text-secondary">
          Todo lo que sale de tu negocio.
        </p>
      </div>
      <ExpensesView
        expenses={expenses}
        categories={categories}
        paymentMethods={DEFAULT_PAYMENT_METHODS}
      />
    </div>
  );
}
