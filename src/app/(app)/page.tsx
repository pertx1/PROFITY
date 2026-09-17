import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getFinancialSummary, getMonthlySeries, getRecentActivity } from "@/lib/dashboard";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { MonthlyBarChart } from "@/components/charts/MonthlyBarChart";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Beneficio · PROFITY" };

export default async function DashboardPage() {
  const { userId } = await requireUser();
  const [summary, series, recent] = await Promise.all([
    getFinancialSummary(userId),
    getMonthlySeries(userId),
    getRecentActivity(userId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Beneficio</h1>
        <p className="mt-1 text-sm text-secondary">
          Resumen de tu negocio, en tiempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Ingresos totales"
          value={formatCurrency(summary.totalIngresos)}
          hint={`${formatCurrency(summary.ingresosMes)} este mes`}
        />
        <StatCard
          label="Gastos totales"
          value={formatCurrency(summary.totalGastos)}
          hint={`${formatCurrency(summary.gastosMes)} este mes`}
        />
        <StatCard
          label="Beneficio"
          value={formatCurrency(summary.beneficio)}
          hint={`${formatCurrency(summary.beneficioMes)} este mes`}
          tone={summary.beneficio >= 0 ? "positive" : "negative"}
        />
      </div>

      <Card className="p-5">
        <h2 className="text-base font-semibold">Últimos 6 meses</h2>
        <div className="mt-2">
          <MonthlyBarChart data={series} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Últimos gastos</h2>
            <Link href="/gastos" className="text-sm font-medium text-accent">
              Ver todos
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {recent.expenses.length === 0 && (
              <p className="py-6 text-center text-sm text-secondary">
                Aún no has registrado gastos.
              </p>
            )}
            {recent.expenses.map((expense) => (
              <li key={expense.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium">{expense.category}</p>
                  <p className="text-xs text-secondary">
                    {formatDate(expense.date)}
                    {expense.concept ? ` · ${expense.concept}` : ""}
                  </p>
                </div>
                <span className="text-sm font-semibold text-danger">
                  -{formatCurrency(expense.amount)}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Últimos pedidos</h2>
            <Link href="/pedidos" className="text-sm font-medium text-accent">
              Ver todos
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {recent.orders.length === 0 && (
              <p className="py-6 text-center text-sm text-secondary">
                Aún no has registrado pedidos.
              </p>
            )}
            {recent.orders.map((order) => (
              <li key={order.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium">
                    {order.model}
                    {order.size ? ` · ${order.size}` : ""}
                  </p>
                  <p className="text-xs text-secondary">{formatDate(order.date)}</p>
                </div>
                <span className="text-sm font-semibold text-success">
                  +{formatCurrency(order.price)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
