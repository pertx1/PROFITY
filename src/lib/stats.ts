import "server-only";
import { prisma } from "@/lib/prisma";

const NOT_CANCELLED = { not: "CANCELADO" as const };

type DateRange = { start: Date; end: Date };

export async function getTopModels(userId: string, range: DateRange, take = 8) {
  const rows = await prisma.order.groupBy({
    by: ["model"],
    where: {
      userId,
      status: NOT_CANCELLED,
      date: { gte: range.start, lte: range.end },
    },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take,
  });
  return rows.map((r) => ({
    label: r.model,
    value: r._sum.quantity ?? 0,
  }));
}

export async function getTopModelSizes(userId: string, range: DateRange, take = 8) {
  const rows = await prisma.order.groupBy({
    by: ["model", "size"],
    where: {
      userId,
      status: NOT_CANCELLED,
      date: { gte: range.start, lte: range.end },
    },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take,
  });
  return rows.map((r) => ({
    label: r.size ? `${r.model} · ${r.size}` : r.model,
    value: r._sum.quantity ?? 0,
  }));
}

export async function getTopColors(userId: string, range: DateRange, take = 8) {
  const rows = await prisma.order.groupBy({
    by: ["color"],
    where: {
      userId,
      status: NOT_CANCELLED,
      color: { not: null },
      date: { gte: range.start, lte: range.end },
    },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take,
  });
  return rows.map((r) => ({
    label: r.color ?? "Sin especificar",
    value: r._sum.quantity ?? 0,
  }));
}

export async function getTopExpenseCategories(userId: string, range: DateRange, take = 8) {
  const rows = await prisma.expense.groupBy({
    by: ["category"],
    where: { userId, date: { gte: range.start, lte: range.end } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take,
  });
  return rows.map((r) => ({
    label: r.category,
    value: r._sum.amount ?? 0,
  }));
}

export async function getOrderStatusBreakdown(userId: string, range: DateRange) {
  const rows = await prisma.order.groupBy({
    by: ["status"],
    where: { userId, date: { gte: range.start, lte: range.end } },
    _count: { _all: true },
  });
  return rows.map((r) => ({ status: r.status, count: r._count._all }));
}
