import "server-only";
import { prisma } from "@/lib/prisma";
import { buildBuckets } from "@/lib/date-range";

export async function getFinancialSummary(userId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [expensesAgg, ordersAgg, expensesMonthAgg, ordersMonthAgg] =
    await Promise.all([
      prisma.expense.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      prisma.order.aggregate({
        where: { userId, status: { not: "CANCELADO" } },
        _sum: { price: true },
      }),
      prisma.expense.aggregate({
        where: { userId, date: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.order.aggregate({
        where: {
          userId,
          status: { not: "CANCELADO" },
          date: { gte: startOfMonth },
        },
        _sum: { price: true },
      }),
    ]);

  const totalGastos = expensesAgg._sum.amount ?? 0;
  const totalIngresos = ordersAgg._sum.price ?? 0;
  const gastosMes = expensesMonthAgg._sum.amount ?? 0;
  const ingresosMes = ordersMonthAgg._sum.price ?? 0;

  return {
    totalGastos,
    totalIngresos,
    beneficio: totalIngresos - totalGastos,
    gastosMes,
    ingresosMes,
    beneficioMes: ingresosMes - gastosMes,
  };
}

export async function getRecentActivity(userId: string) {
  const [expenses, orders] = await Promise.all([
    prisma.expense.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 5,
    }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 5,
    }),
  ]);

  return { expenses, orders };
}

export async function getMonthlySeries(userId: string, months = 6) {
  const start = new Date();
  start.setMonth(start.getMonth() - (months - 1));
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const [expenses, orders] = await Promise.all([
    prisma.expense.findMany({
      where: { userId, date: { gte: start } },
      select: { date: true, amount: true },
    }),
    prisma.order.findMany({
      where: { userId, date: { gte: start }, status: { not: "CANCELADO" } },
      select: { date: true, price: true },
    }),
  ]);

  const buckets: { key: string; label: string; gastos: number; ingresos: number }[] =
    [];
  const bucketIndex = new Map<string, number>();

  for (let i = 0; i < months; i += 1) {
    const d = new Date(start);
    d.setMonth(start.getMonth() + i);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    bucketIndex.set(key, buckets.length);
    buckets.push({
      key,
      label: d.toLocaleDateString("es-ES", { month: "short", year: "2-digit" }),
      gastos: 0,
      ingresos: 0,
    });
  }

  for (const e of expenses) {
    const key = `${e.date.getFullYear()}-${e.date.getMonth()}`;
    const idx = bucketIndex.get(key);
    if (idx !== undefined) buckets[idx].gastos += e.amount;
  }
  for (const o of orders) {
    const key = `${o.date.getFullYear()}-${o.date.getMonth()}`;
    const idx = bucketIndex.get(key);
    if (idx !== undefined) buckets[idx].ingresos += o.price;
  }

  return buckets;
}

export async function getSeriesForRange(userId: string, start: Date, end: Date) {
  const { buckets, bucketIndex, bucketOf } = buildBuckets(start, end);

  const [expenses, orders] = await Promise.all([
    prisma.expense.findMany({
      where: { userId, date: { gte: start, lte: end } },
      select: { date: true, amount: true },
    }),
    prisma.order.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
        status: { not: "CANCELADO" },
      },
      select: { date: true, price: true },
    }),
  ]);

  for (const e of expenses) {
    const idx = bucketIndex.get(bucketOf(e.date));
    if (idx !== undefined) buckets[idx].gastos += e.amount;
  }
  for (const o of orders) {
    const idx = bucketIndex.get(bucketOf(o.date));
    if (idx !== undefined) buckets[idx].ingresos += o.price;
  }

  return buckets;
}
