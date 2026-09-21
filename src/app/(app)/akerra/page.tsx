import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStockOverview } from "@/lib/stock";
import { Card } from "@/components/ui/Card";
import { IconBox, IconGoat, IconLayers, IconReceipt, IconTrendUp } from "@/components/nav/icons";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Akerra · PROFITY" };

const PENDING_STATUSES = ["SIN_HACER", "SIN_LLEGAR"] as const;

export default async function AkerraPage() {
  const { userId } = await requireUser();

  const [orderCount, pendingOrders, expenseAgg, incomeAgg, stock] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.count({ where: { userId, status: { in: [...PENDING_STATUSES] } } }),
    prisma.expense.aggregate({ where: { userId }, _sum: { amount: true }, _count: true }),
    prisma.income.aggregate({ where: { userId }, _sum: { amount: true }, _count: true }),
    getStockOverview(userId),
  ]);

  const stockTotal = stock.tshirtTotal + stock.dtfTotal;

  const tiles = [
    {
      href: "/pedidos",
      label: "Pedidos",
      icon: IconBox,
      value: orderCount,
      hint: `${pendingOrders} pendiente${pendingOrders === 1 ? "" : "s"}`,
    },
    {
      href: "/gastos",
      label: "Gastos",
      icon: IconReceipt,
      value: formatCurrency(expenseAgg._sum.amount ?? 0),
      hint: `${expenseAgg._count} apunte${expenseAgg._count === 1 ? "" : "s"}`,
    },
    {
      href: "/ingresos",
      label: "Ingresos",
      icon: IconTrendUp,
      value: formatCurrency(incomeAgg._sum.amount ?? 0),
      hint: `${incomeAgg._count} apunte${incomeAgg._count === 1 ? "" : "s"}`,
    },
    {
      href: "/stock",
      label: "Stock",
      icon: IconLayers,
      value: stockTotal,
      hint:
        stock.needsOrder.length > 0
          ? `${stock.needsOrder.length} por pedir`
          : "Todo al día",
      warn: stock.needsOrder.length > 0,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">
          <IconGoat className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Akerra</h1>
          <p className="mt-1 text-sm text-secondary">
            Tu negocio de un vistazo: pedidos, gastos, ingresos y stock.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map(({ href, label, icon: Icon, value, hint, warn }) => (
          <Link key={href} href={href} className="block aspect-square">
            <Card
              className={cn(
                "flex h-full flex-col justify-between p-4 transition-shadow hover:shadow-md",
                warn && "border-danger/40 bg-danger/5",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full",
                  warn ? "bg-danger/15 text-danger" : "bg-accent/12 text-accent",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p
                  className={cn(
                    "text-xl font-semibold tabular-nums",
                    warn ? "text-danger" : "text-foreground",
                  )}
                >
                  {value}
                </p>
                <p className="text-sm font-medium">{label}</p>
                <p className="mt-0.5 truncate text-xs text-secondary">{hint}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
