import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ALL_DTF_DESIGNS,
  TSHIRT_MODEL_LABELS,
  TSHIRT_MODELS,
  TSHIRT_SIZES,
} from "@/lib/stock-catalog";
import { OrdersView } from "./OrdersView";

export const metadata: Metadata = { title: "Pedidos · PROFITY" };

const DEFAULT_SIZES = [...TSHIRT_SIZES, "XS"];
const DEFAULT_COLORS = ["BLANCO", "NEGRO"];
const DEFAULT_MODELS = [
  ...TSHIRT_MODELS.map((m) => TSHIRT_MODEL_LABELS[m]),
  ...ALL_DTF_DESIGNS,
];

export default async function PedidosPage() {
  const { userId } = await requireUser();

  const [orders, modelRows, colorRows, sizeRows] = await Promise.all([
    prisma.order.findMany({ where: { userId }, orderBy: { date: "desc" } }),
    prisma.order.findMany({
      where: { userId },
      select: { model: true },
      distinct: ["model"],
    }),
    prisma.order.findMany({
      where: { userId, color: { not: null } },
      select: { color: true },
      distinct: ["color"],
    }),
    prisma.order.findMany({
      where: { userId, size: { not: null } },
      select: { size: true },
      distinct: ["size"],
    }),
  ]);

  const models = Array.from(
    new Set([...DEFAULT_MODELS, ...modelRows.map((r) => r.model)]),
  ).sort((a, b) => a.localeCompare(b, "es"));
  const colors = Array.from(
    new Set([...DEFAULT_COLORS, ...colorRows.map((r) => r.color).filter((c): c is string => !!c)]),
  ).sort((a, b) => a.localeCompare(b, "es"));
  const sizes = Array.from(
    new Set([...DEFAULT_SIZES, ...sizeRows.map((r) => r.size).filter((s): s is string => !!s)]),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
        <p className="mt-1 text-sm text-secondary">
          Todo lo que vendes, con su estado.
        </p>
      </div>
      <OrdersView orders={orders} models={models} colors={colors} sizes={sizes} />
    </div>
  );
}
