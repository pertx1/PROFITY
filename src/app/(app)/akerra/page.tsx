import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStockOverview } from "@/lib/stock";
import { Card } from "@/components/ui/Card";
import { IconBox, IconGoat, IconLayers, IconReceipt } from "@/components/nav/icons";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Akerra · PROFITY" };

const PENDING_STATUSES = ["SIN_HACER", "SIN_LLEGAR"] as const;

export default async function AkerraPage() {
  const { userId } = await requireUser();

  const [orderCount, pendingOrders, expenseAgg, stock] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.count({ where: { userId, status: { in: [...PENDING_STATUSES] } } }),
    prisma.expense.aggregate({ where: { userId }, _sum: { amount: true }, _count: true }),
    getStockOverview(userId),
  ]);

  const stockTotal = stock.tshirtTotal + stock.dtfTotal;

  // Cada tarjeta lleva el color de sistema de Apple que mejor la distingue
  // de un vistazo, como los iconos de Ajustes en iOS.
  const tiles = [
    {
      href: "/pedidos",
      label: "Pedidos",
      icon: IconBox,
      value: orderCount,
      hint: `${pendingOrders} pendiente${pendingOrders === 1 ? "" : "s"}`,
      tone: "bg-accent",
    },
    {
      href: "/gastos",
      label: "Gastos",
      icon: IconReceipt,
      value: formatCurrency(expenseAgg._sum.amount ?? 0),
      hint: `${expenseAgg._count} apunte${expenseAgg._count === 1 ? "" : "s"}`,
      tone: "bg-[#ff9500] dark:bg-[#ff9f0a]",
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
      tone: "bg-[#af52de] dark:bg-[#bf5af2]",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-accent text-white shadow-sm">
          <IconGoat className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-[34px] font-bold leading-[41px] tracking-tight">Akerra</h1>
          <p className="mt-1 text-sm text-secondary">
            Tu negocio de un vistazo: pedidos, gastos y stock.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {tiles.map(({ href, label, icon: Icon, value, hint, warn, tone }) => (
          <Link key={href} href={href} className="block aspect-square">
            <Card
              className={cn(
                "flex h-full flex-col justify-between p-4 transition-shadow duration-200 ease-spring hover:shadow-md",
                warn && "border-danger/40 bg-danger/5",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-[11px] text-white shadow-sm",
                  warn ? "bg-danger" : tone,
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
